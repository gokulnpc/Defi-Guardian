// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

// Minimal CCIP interfaces for testing
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

    struct Any2EVMMessage {
        bytes32 messageId;
        uint64 sourceChainSelector;
        bytes sender;
        bytes data;
        EVMTokenAmount[] destTokenAmounts;
    }
}

contract MockCCIPRouter {
    mapping(bytes32 => bool) public processedMessages;
    uint256 public fee = 0.01 ether;

    event MessageSent(bytes32 indexed messageId, uint64 destinationChainSelector, bytes receiver, bytes data);

    function ccipSend(uint64 destinationChainSelector, Client.EVM2AnyMessage calldata message) external payable returns (bytes32) {
        require(msg.value >= fee, "Insufficient fee");
        
        bytes32 messageId = keccak256(abi.encodePacked(
            destinationChainSelector,
            message.receiver,
            message.data,
            block.timestamp
        ));
        
        processedMessages[messageId] = true;
        
        emit MessageSent(messageId, destinationChainSelector, message.receiver, message.data);
        
        return messageId;
    }

    function getFee(uint64 destinationChainSelector, Client.EVM2AnyMessage calldata message) external view returns (uint256) {
        return fee;
    }

    // Mock function to simulate CCIP message delivery
    function deliverMessage(
        address receiver,
        Client.Any2EVMMessage calldata message
    ) external {
        // This would normally be called by the CCIP network
        // For testing, we call it directly
        (bool success, ) = receiver.call(
            abi.encodeWithSignature(
                "ccipReceive((bytes32,uint64,bytes,bytes,(address,uint256)[]))",
                message
            )
        );
        require(success, "CCIP delivery failed");
    }
}
