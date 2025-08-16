import { ChainBadge } from "@/components/ui/chain-badge"
import { RiskChip } from "@/components/ui/risk-chip"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

interface CoverageHeaderProps {
  protocolId: string
}

// Mock data - in real app this would come from API/database
const getProtocolData = (id: string) => {
  const protocols: Record<string, any> = {
    aave: {
      name: "Aave",
      chain: "ethereum",
      logo: "/aave-logo.png",
      riskScore: "Low",
      tvl: "15.2B",
      description: "Leading lending protocol with proven track record",
    },
  }
  return protocols[id] || protocols.aave
}

export function CoverageHeader({ protocolId }: CoverageHeaderProps) {
  const protocol = getProtocolData(protocolId)

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link href="/marketplace">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketplace
        </Link>
      </Button>

      <div className="flex items-center gap-4 mb-6">
        <Image
          src={protocol.logo || "/placeholder.svg"}
          alt={`${protocol.name} logo`}
          width={60}
          height={60}
          className="rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">{protocol.name}</h1>
            <ChainBadge chain={protocol.chain} />
            <RiskChip risk={protocol.riskScore} />
          </div>
          <p className="text-muted-foreground">{protocol.description}</p>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="secondary">TVL: {protocol.tvl}</Badge>
            <Badge variant="secondary">Coverage Available</Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
