import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, TrendingUp, Users, Clock } from "lucide-react"

interface ProtocolInfoProps {
  protocolId: string
}

export function ProtocolInfo({ protocolId }: ProtocolInfoProps) {
  return (
    <div className="space-y-6">
      {/* Pool Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">2.5M</p>
            <p className="text-sm text-muted-foreground">Pool Size (PYUSD)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">65%</p>
            <p className="text-sm text-muted-foreground">Utilization</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">1,247</p>
            <p className="text-sm text-muted-foreground">Active Policies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">24h</p>
            <p className="text-sm text-muted-foreground">Avg Claim Time</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="terms">Policy Terms</TabsTrigger>
          <TabsTrigger value="claims">Claims History</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Protocol Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Aave is a decentralized lending protocol that allows users to lend and borrow cryptocurrencies. The
                protocol has been audited multiple times and has a strong track record of security.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Covered Risks</h4>
                  <div className="space-y-1">
                    <Badge variant="secondary">Smart Contract Bugs</Badge>
                    <Badge variant="secondary">Governance Attacks</Badge>
                    <Badge variant="secondary">Oracle Failures</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Exclusions</h4>
                  <div className="space-y-1">
                    <Badge variant="outline">Market Volatility</Badge>
                    <Badge variant="outline">Regulatory Changes</Badge>
                    <Badge variant="outline">User Error</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terms">
          <Card>
            <CardHeader>
              <CardTitle>Policy Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">Coverage Period</h4>
                  <p className="text-sm text-muted-foreground">
                    Coverage begins 24 hours after purchase and lasts for the selected duration.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Claim Process</h4>
                  <p className="text-sm text-muted-foreground">
                    Claims are submitted on Hedera and voted on by governance token holders. Approved claims are paid
                    out in PYUSD on your selected network.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Payout Conditions</h4>
                  <p className="text-sm text-muted-foreground">
                    Payouts require majority governance approval and valid proof of loss. Maximum payout is the coverage
                    amount minus any deductibles.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims">
          <Card>
            <CardHeader>
              <CardTitle>Recent Claims History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Smart Contract Bug - Flash Loan Attack</p>
                    <p className="text-sm text-muted-foreground">Submitted 2 days ago</p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-600">Approved</Badge>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Oracle Price Manipulation</p>
                    <p className="text-sm text-muted-foreground">Submitted 1 week ago</p>
                  </div>
                  <Badge className="bg-red-500/10 text-red-600">Rejected</Badge>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Governance Attack Prevention</p>
                    <p className="text-sm text-muted-foreground">Submitted 2 weeks ago</p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-600">Approved</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Smart Contract Risk</span>
                  <Badge className="bg-green-500/10 text-green-600">Low</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Liquidity Risk</span>
                  <Badge className="bg-green-500/10 text-green-600">Low</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Governance Risk</span>
                  <Badge className="bg-amber-500/10 text-amber-600">Medium</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Oracle Risk</span>
                  <Badge className="bg-green-500/10 text-green-600">Low</Badge>
                </div>
              </div>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Overall Risk Score: Low</strong>
                  <br />
                  Aave has undergone multiple security audits and has a proven track record. The protocol has strong
                  governance mechanisms and robust oracle systems.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
