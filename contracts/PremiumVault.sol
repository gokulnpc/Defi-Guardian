// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * PremiumVault (Arbitrum)
 * - Collects premiums in PYUSD, allocates to LPVault & PayoutVault
 * - Sends policy purchase metadata to Hedera PolicyManager via Chainlink CCIP
 *
 * NOTE: This is hackathon-grade code. Audit before prod.
 */

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// Minimal CCIP interfaces for hackathon
interface IRouterClient {
    function ccipSend(uint64 destinationChainSelector, Client.EVM2AnyMessage calldata message) external payable returns (bytes32);
    function getFee(uint64 destinationChainSelector, Client.EVM2AnyMessage calldata message) external view returns (uint256);
}

library Client {
    struct EVMTokenAmount {
        address token;
        uint256 amount;
    }

    struct EVM2AnyMessage {
        bytes receiver;
        bytes data;
        EVMTokenAmount[] tokenAmounts;
        address feeToken;
        bytes extraArgs;
    }

    function _argsToBytes(GenericExtraArgsV2 memory _args) internal pure returns (bytes memory) {
        return abi.encode(_args);
    }

    struct GenericExtraArgsV2 {
        uint256 gasLimit;
        bool allowOutOfOrderExecution;
    }
}

/// @dev Minimal Ownable (OwnerIsCreator-like) for simplicity
abstract contract Ownable {
    error NotOwner();
    address public owner;
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }
    constructor() { owner = msg.sender; }
    function transferOwnership(address newOwner) external onlyOwner { owner = newOwner; }
}

contract PremiumVault is Ownable {
    using SafeERC20 for IERC20;

    // ========= Errors =========
    error InvalidAddress();
    error InvalidAmount();
    error DestNotAllowlisted(uint64 selector);
    error ReceiverNotAllowlisted(bytes receiver);
    error NoGasLimitForChain(uint64 selector);
    error NotEnoughBalance(uint256 have, uint256 need);
    error FeeTokenNotConfigured();
    error ZeroAllocation();
    error BadAllocationSum();

    // ========= Tokens & external contracts =========
    IERC20 public immutable PYUSD;                 // PYUSD on Arbitrum
    IERC20 public immutable LINK;                  // LINK on Arbitrum (for paying CCIP fees in LINK)

    address public lpVault;                        // where premiums (yield portion) go
    address public payoutVault;                    // reserve for claims
    IRouterClient public router;                   // CCIP router on Arbitrum

    // ========= CCIP config =========
    // Destination Hedera chain selector (set allowlist).
    mapping(uint64 => bool) public allowlistedDestChains;
    // Allowlisted receiver(s) on Hedera (encoded bytes address) => true
    mapping(bytes => bool) public allowlistedReceivers;
    // Per-chain gasLimit for the destination PolicyManager call
    mapping(uint64 => uint256) public gasLimitByChain;

    // CCIP fee mode: address(0) => native, otherwise LINK
    address public feeToken; // set to address(LINK) to pay in LINK, or address(0) for native

    // Default policy allocations (BPS)
    // premiumBpsToLP + premiumBpsToReserve must equal <= 10000
    uint256 public premiumBpsToLP = 7000;      // 70% to LPVault
    uint256 public premiumBpsToReserve = 3000; // 30% to PayoutVault
    uint256 internal constant BPS = 10_000;

    // ========= Events =========
    event PremiumPaid(
        address indexed user,
        uint256 premiumPYUSD,
        uint256 toLP,
        uint256 toReserve,
        bytes32 ccipMessageId
    );

    event CCIPSent(
        bytes32 indexed messageId,
        uint64 indexed dstSelector,
        bytes indexed receiver,
        address feeToken,
        uint256 feePaid
    );

    event RouterUpdated(address router);
    event FeeTokenUpdated(address feeToken);
    event DestChainAllowlisted(uint64 selector, bool allowed);
    event ReceiverAllowlisted(bytes receiver, bool allowed);
    event GasLimitSet(uint64 selector, uint256 gasLimit);
    event SplitUpdated(uint256 bpsToLP, uint256 bpsToReserve);
    event VaultsUpdated(address lpVault, address payoutVault);

    // ========= Policy types =========
    struct PolicyTerms {
        // Minimal terms used by Hedera PolicyManager to mint a Policy NFT and store data
        bytes32 poolId;             // which coverage pool
        address buyer;              // EVM buyer on Arbitrum
        uint256 coverageAmount;     // insured amount (PYUSD units)
        uint64  startTs;            // coverage start
        uint64  endTs;              // coverage end
        bytes32 policyRef;          // offchain/IPFS ref or hash of terms
    }

    constructor(
        address _router,
        address _link,
        address _pyusd,
        address _lpVault,
        address _payoutVault
    ) {
        if (_router == address(0) || _pyusd == address(0) || _lpVault == address(0) || _payoutVault == address(0)) {
            revert InvalidAddress();
        }
        router = IRouterClient(_router);
        LINK = IERC20(_link);
        PYUSD = IERC20(_pyusd);
        lpVault = _lpVault;
        payoutVault = _payoutVault;

        // default to paying in LINK if provided, else native
        feeToken = _link; // owner can flip to native later if desired
    }

    // ========= Owner configuration =========

    function setVaults(address _lpVault, address _payoutVault) external onlyOwner {
        if (_lpVault == address(0) || _payoutVault == address(0)) revert InvalidAddress();
        lpVault = _lpVault;
        payoutVault = _payoutVault;
        emit VaultsUpdated(_lpVault, _payoutVault);
    }

    function setRouter(address _router) external onlyOwner {
        if (_router == address(0)) revert InvalidAddress();
        router = IRouterClient(_router);
        emit RouterUpdated(_router);
    }

    /// @notice Set fee token: address(LINK) to pay in LINK, or address(0) to pay in native gas.
    function setFeeToken(address _feeToken) external onlyOwner {
        feeToken = _feeToken;
        emit FeeTokenUpdated(_feeToken);
    }

    function allowlistDestChain(uint64 selector, bool allowed) external onlyOwner {
        allowlistedDestChains[selector] = allowed;
        emit DestChainAllowlisted(selector, allowed);
    }

    function allowlistReceiver(bytes calldata receiver, bool allowed) external onlyOwner {
        allowlistedReceivers[receiver] = allowed;
        emit ReceiverAllowlisted(receiver, allowed);
    }

    function setGasLimit(uint64 selector, uint256 gasLimit) external onlyOwner {
        gasLimitByChain[selector] = gasLimit;
        emit GasLimitSet(selector, gasLimit);
    }

    /// @notice Update premium splits in BPS. Sum must be <= 10000.
    function setPremiumSplits(uint256 bpsToLP, uint256 bpsToReserve) external onlyOwner {
        if (bpsToLP == 0 && bpsToReserve == 0) revert ZeroAllocation();
        if (bpsToLP + bpsToReserve > BPS) revert BadAllocationSum();
        premiumBpsToLP = bpsToLP;
        premiumBpsToReserve = bpsToReserve;
        emit SplitUpdated(bpsToLP, bpsToReserve);
    }

    // ========= Public user function =========

    /**
     * @notice User buys coverage by paying PYUSD on Arbitrum.
     *         This allocates premium locally (LP + Reserve) and sends CCIP message to Hedera with policy terms.
     * @param dstChainSelector Hedera chain selector (allowlisted)
     * @param hederaReceiver   ABI-encoded receiver (PolicyManager) on Hedera (allowlisted)
     * @param terms            Policy terms
     * @param premiumPYUSD     Premium to pay (PYUSD)
     * @return messageId       CCIP message id used for tracking
     */
    function buyCoverage(
        uint64 dstChainSelector,
        bytes calldata hederaReceiver,
        PolicyTerms calldata terms,
        uint256 premiumPYUSD
    ) external payable returns (bytes32 messageId) {
        if (!allowlistedDestChains[dstChainSelector]) revert DestNotAllowlisted(dstChainSelector);
        if (!allowlistedReceivers[hederaReceiver]) revert ReceiverNotAllowlisted(hederaReceiver);
        if (premiumPYUSD == 0) revert InvalidAmount();

        // 1) Pull PYUSD premium from buyer
        PYUSD.safeTransferFrom(msg.sender, address(this), premiumPYUSD);

        // 2) Allocate premium locally
        (uint256 toLP, uint256 toReserve) = _allocatePremium(premiumPYUSD);

        if (toLP > 0) PYUSD.safeTransfer(lpVault, toLP);
        if (toReserve > 0) PYUSD.safeTransfer(payoutVault, toReserve);

        // 3) CCIP: send policy purchase to Hedera PolicyManager
        // Build the message payload: we encode a function-like payload expected by PolicyManager.
        bytes memory payload = abi.encode(
            // e.g. Hedera PolicyManager's entrypoint selector or simply a typed struct
            // For hackathon simplicity, we pack the struct "as is" and let receiver decode.
            terms
        );

        // Build extra args: gasLimit + allowOutOfOrderExecution (best practice: configurable)
        uint256 gasLimit = gasLimitByChain[dstChainSelector];
        if (gasLimit == 0) revert NoGasLimitForChain(dstChainSelector);

        Client.EVM2AnyMessage memory m = Client.EVM2AnyMessage({
            receiver: hederaReceiver,                 // ABI-encoded receiver (PolicyManager on Hedera)
            data: payload,                            // policy terms payload
            tokenAmounts: new Client.EVMTokenAmount[](0), // no tokens sent, only data
            extraArgs: Client._argsToBytes(
                Client.GenericExtraArgsV2({
                    gasLimit: gasLimit,
                    allowOutOfOrderExecution: true
                })
            ),
            // fee token: LINK or native
            feeToken: feeToken
        });

        // Estimate CCIP fee
        uint256 fee = router.getFee(dstChainSelector, m);

        // Pay fee in LINK or native, per docs
        if (feeToken == address(0)) {
            // pay in native gas: ensure msg.value covers fee
            if (msg.value < fee) revert NotEnoughBalance(msg.value, fee);
            messageId = router.ccipSend{value: fee}(dstChainSelector, m);
            // refund any excess native (tiny convenience)
            if (msg.value > fee) {
                (bool ok, ) = msg.sender.call{value: (msg.value - fee)}("");
                require(ok, "Refund failed");
            }
        } else {
            // pay in LINK: approve router
            uint256 bal = LINK.balanceOf(address(this));
            if (bal < fee) revert NotEnoughBalance(bal, fee);
            LINK.approve(address(router), 0);
            LINK.approve(address(router), fee);
            messageId = router.ccipSend(dstChainSelector, m);
        }

        emit CCIPSent(messageId, dstChainSelector, hederaReceiver, feeToken, fee);
        emit PremiumPaid(msg.sender, premiumPYUSD, toLP, toReserve, messageId);
        return messageId;
    }

    // ========= Views & helpers =========

    /// @notice Preview the CCIP fee for a given terms payload.
    function quoteCCIPFee(
        uint64 dstChainSelector,
        bytes calldata hederaReceiver,
        PolicyTerms calldata terms
    ) external view returns (uint256) {
        if (!allowlistedDestChains[dstChainSelector]) revert DestNotAllowlisted(dstChainSelector);
        if (!allowlistedReceivers[hederaReceiver]) revert ReceiverNotAllowlisted(hederaReceiver);

        uint256 gasLimit = gasLimitByChain[dstChainSelector];
        if (gasLimit == 0) revert NoGasLimitForChain(dstChainSelector);

        Client.EVM2AnyMessage memory m = Client.EVM2AnyMessage({
            receiver: hederaReceiver,
            data: abi.encode(terms),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(
                Client.GenericExtraArgsV2({
                    gasLimit: gasLimit,
                    allowOutOfOrderExecution: true
                })
            ),
            feeToken: feeToken
        });

        return router.getFee(dstChainSelector, m);
    }

    /// @notice Utility: return current premium split result for a notional amount.
    function previewAllocation(uint256 premiumPYUSD) external view returns (uint256 toLP, uint256 toReserve) {
        return _calcAlloc(premiumPYUSD);
    }

    // ========= Internal =========

    function _allocatePremium(uint256 premiumPYUSD) internal view returns (uint256 toLP, uint256 toReserve) {
        (toLP, toReserve) = _calcAlloc(premiumPYUSD);
        // nothing else to do here yet; actual transfer executed in buyCoverage
    }

    function _calcAlloc(uint256 amount) internal view returns (uint256 toLP, uint256 toReserve) {
        toLP = (amount * premiumBpsToLP) / BPS;
        toReserve = (amount * premiumBpsToReserve) / BPS;
    }

    // ========= Owner rescues =========

    function rescueToken(address token, address to, uint256 amt) external onlyOwner {
        if (to == address(0)) revert InvalidAddress();
        IERC20(token).safeTransfer(to, amt);
    }

    receive() external payable {}
}

