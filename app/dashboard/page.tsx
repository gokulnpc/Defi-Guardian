import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, TrendingUp, Bell, ExternalLink } from "lucide-react"

const mockCoverages = [
  {
    id: 1,
    protocol: "Aave V3",
    chain: "Arbitrum",
    amount: "10,000 PYUSD",
    premium: "150 PYUSD",
    expiry: "2024-03-15",
    status: "Active",
  },
  {
    id: 2,
    protocol: "Uniswap V3",
    chain: "Ethereum",
    amount: "5,000 PYUSD",
    premium: "75 PYUSD",
    expiry: "2024-02-28",
    status: "Expiring Soon",
  },
]

const mockStaking = [
  {
    id: 1,
    pool: "Aave Coverage Pool",
    staked: "25,000 PYUSD",
    rewards: "1,250 PYUSD",
    apy: "12.5%",
  },
]

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Manage your coverage and staking positions</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="coverage">My Coverage</TabsTrigger>
          <TabsTrigger value="staking">My Staking</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Coverage</CardTitle>
                <Shield className="h-4 w-4 text-cyan-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15,000 PYUSD</div>
                <p className="text-xs text-gray-600">Across 2 protocols</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Staked Amount</CardTitle>
                <TrendingUp className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">25,000 PYUSD</div>
                <p className="text-xs text-gray-600">Earning 12.5% APY</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
                <Bell className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-gray-600">Require attention</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Active Coverage Policies</h2>
            <Button className="bg-cyan-600 hover:bg-cyan-700">Buy New Coverage</Button>
          </div>

          <div className="grid gap-4">
            {mockCoverages.map((coverage) => (
              <Card key={coverage.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{coverage.protocol}</h3>
                        <Badge variant="outline">{coverage.chain}</Badge>
                        <Badge variant={coverage.status === "Active" ? "default" : "destructive"}>
                          {coverage.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Coverage: {coverage.amount} • Premium: {coverage.premium}
                      </p>
                      <p className="text-sm text-gray-600">Expires: {coverage.expiry}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="staking" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Staking Positions</h2>
            <Button className="bg-amber-600 hover:bg-amber-700">Stake More</Button>
          </div>

          <div className="grid gap-4">
            {mockStaking.map((position) => (
              <Card key={position.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="font-semibold">{position.pool}</h3>
                      <p className="text-sm text-gray-600">
                        Staked: {position.staked} • Rewards: {position.rewards}
                      </p>
                      <p className="text-sm text-gray-600">Current APY: {position.apy}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Claim Rewards
                      </Button>
                      <Button variant="outline" size="sm">
                        Unstake
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Notifications</h2>
          <div className="space-y-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Coverage Expiring Soon</p>
                    <p className="text-sm text-gray-600">Your Uniswap V3 coverage expires in 5 days</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Staking Rewards Available</p>
                    <p className="text-sm text-gray-600">You have 125 PYUSD in rewards ready to claim</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
