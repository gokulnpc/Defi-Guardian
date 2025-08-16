import { Card, CardContent } from "@/components/ui/card"

const stats = [
  {
    value: "$2.4B+",
    label: "Total Value Protected",
    description: "Assets secured across all protocols",
  },
  {
    value: "15,000+",
    label: "Active Policies",
    description: "Coverage policies currently active",
  },
  {
    value: "99.2%",
    label: "Claim Success Rate",
    description: "Valid claims processed successfully",
  },
  {
    value: "3",
    label: "Supported Chains",
    description: "Ethereum, Arbitrum, and Hedera",
  },
]

export function StatsSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Trusted by the DeFi Community</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of users who trust DeFi Guardians to protect their investments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border-border">
              <CardContent className="p-6">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-lg font-semibold text-foreground mb-1">{stat.label}</div>
                <div className="text-sm text-muted-foreground">{stat.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
