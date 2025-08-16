import { Badge } from "@/components/ui/badge"

interface ChainBadgeProps {
  chain: string
}

export function ChainBadge({ chain }: ChainBadgeProps) {
  const getChainConfig = (chain: string) => {
    switch (chain.toLowerCase()) {
      case "ethereum":
        return { name: "Ethereum", color: "bg-blue-500" }
      case "arbitrum":
        return { name: "Arbitrum", color: "bg-blue-400" }
      case "hedera":
        return { name: "Hedera", color: "bg-purple-500" }
      default:
        return { name: chain, color: "bg-gray-500" }
    }
  }

  const config = getChainConfig(chain)

  return (
    <Badge variant="secondary" className="text-xs">
      <div className={`w-2 h-2 rounded-full ${config.color} mr-1`} />
      {config.name}
    </Badge>
  )
}
