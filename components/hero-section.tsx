import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, TrendingUp, Users, Zap } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Cross-Chain Coverage",
    description: "Protect your DeFi investments across Ethereum, Arbitrum, and Hedera",
  },
  {
    icon: TrendingUp,
    title: "Smart Premiums",
    description: "Dynamic pricing based on real-time risk assessment and protocol health",
  },
  {
    icon: Users,
    title: "Community Governance",
    description: "Participate in protocol decisions and claim validations through voting",
  },
  {
    icon: Zap,
    title: "Instant Claims",
    description: "Fast claim processing with automated verification and PYUSD payouts",
  },
]

export function HeroSection() {
  return (
    <section className="py-20 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Secure Your DeFi Future with <span className="text-primary">Cross-Chain Insurance</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            DeFi Guardians provides comprehensive insurance coverage for your decentralized finance investments. Protect
            against smart contract risks, governance attacks, and protocol failures across multiple blockchains.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6">
              Explore Coverage
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
              View Marketplace
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
