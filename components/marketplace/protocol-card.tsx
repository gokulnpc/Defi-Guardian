import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChainBadge } from "@/components/ui/chain-badge"
import { RiskChip } from "@/components/ui/risk-chip"
import { TrendingUp, Shield } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Protocol {
  id: string
  name: string
  chain: string
  logo: string
  riskScore: string
  premiumRate: string
  poolSize: string
  tvl: string
  description: string
}

interface ProtocolCardProps {
  protocol: Protocol
}

export function ProtocolCard({ protocol }: ProtocolCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Image
              src={protocol.logo || "/placeholder.svg"}
              alt={`${protocol.name} logo`}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <h3 className="font-semibold text-foreground">{protocol.name}</h3>
              <p className="text-sm text-muted-foreground">TVL: {protocol.tvl}</p>
            </div>
          </div>
          <ChainBadge chain={protocol.chain} />
        </div>
        <p className="text-sm text-muted-foreground">{protocol.description}</p>
      </CardHeader>

      <CardContent className="py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Premium Rate</span>
            </div>
            <p className="text-lg font-bold text-primary">{protocol.premiumRate}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Pool Size</span>
            </div>
            <p className="text-lg font-bold">{protocol.poolSize}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <RiskChip risk={protocol.riskScore} />
          <Badge variant="secondary" className="text-xs">
            Active Coverage Available
          </Badge>
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/coverage/${protocol.id}`}>Get Coverage</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
