import { Badge } from "@/components/ui/badge"

interface RiskChipProps {
  risk: string
}

export function RiskChip({ risk }: RiskChipProps) {
  const getRiskConfig = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "low":
        return { color: "bg-green-500/10 text-green-600 border-green-500/20" }
      case "medium":
        return { color: "bg-amber-500/10 text-amber-600 border-amber-500/20" }
      case "high":
        return { color: "bg-red-500/10 text-red-600 border-red-500/20" }
      default:
        return { color: "bg-gray-500/10 text-gray-600 border-gray-500/20" }
    }
  }

  const config = getRiskConfig(risk)

  return (
    <Badge variant="outline" className={`text-xs ${config.color}`}>
      {risk} Risk
    </Badge>
  )
}
