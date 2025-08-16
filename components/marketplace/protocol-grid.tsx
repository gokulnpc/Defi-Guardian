import { ProtocolCard } from "./protocol-card"

const mockProtocols = [
  {
    id: "aave",
    name: "Aave",
    chain: "ethereum",
    logo: "/aave-logo.png",
    riskScore: "Low",
    premiumRate: "2.5%",
    poolSize: "2.5M PYUSD",
    tvl: "15.2B",
    description: "Leading lending protocol with proven track record",
  },
  {
    id: "compound",
    name: "Compound",
    chain: "ethereum",
    logo: "/compound-logo.png",
    riskScore: "Low",
    premiumRate: "2.8%",
    poolSize: "1.8M PYUSD",
    tvl: "8.5B",
    description: "Autonomous interest rate protocol",
  },
  {
    id: "uniswap",
    name: "Uniswap V3",
    chain: "arbitrum",
    logo: "/uniswap-logo.png",
    riskScore: "Medium",
    premiumRate: "3.2%",
    poolSize: "3.1M PYUSD",
    tvl: "4.2B",
    description: "Concentrated liquidity AMM protocol",
  },
  {
    id: "gmx",
    name: "GMX",
    chain: "arbitrum",
    logo: "/gmx-logo.png",
    riskScore: "Medium",
    premiumRate: "4.1%",
    poolSize: "950K PYUSD",
    tvl: "1.8B",
    description: "Decentralized perpetual exchange",
  },
  {
    id: "curve",
    name: "Curve Finance",
    chain: "ethereum",
    logo: "/abstract-curve-logo.png",
    riskScore: "Low",
    premiumRate: "2.2%",
    poolSize: "2.2M PYUSD",
    tvl: "6.8B",
    description: "Stableswap AMM for efficient stable trading",
  },
  {
    id: "balancer",
    name: "Balancer",
    chain: "arbitrum",
    logo: "/balancer-logo.png",
    riskScore: "Medium",
    premiumRate: "3.5%",
    poolSize: "1.2M PYUSD",
    tvl: "2.1B",
    description: "Automated portfolio manager and trading platform",
  },
]

export function ProtocolGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockProtocols.map((protocol) => (
        <ProtocolCard key={protocol.id} protocol={protocol} />
      ))}
    </div>
  )
}
