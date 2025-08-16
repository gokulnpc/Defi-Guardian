import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Coins, ArrowUpRight } from "lucide-react"

const stakingPools = [
  {
    id: 1,
    name: "Aave Coverage Pool",
    tvl: "2.4M PYUSD",
    apy: "12.5%",
    risk: "Low",
    utilization: "65%",
  },
  {
    id: 2,
    name: "Uniswap Coverage Pool",
    tvl: "1.8M PYUSD",
    apy: "15.2%",
    risk: "Medium",
    utilization: "78%",
  },
  {
    id: 3,
    name: "Compound Coverage Pool",
    tvl: "950K PYUSD",
    apy: "18.7%",
    risk: "Medium",
    utilization: "82%",
  },
]

export default function StakePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Stake PYUSD</h1>
        <p className="text-gray-600">Earn rewards by providing liquidity to coverage pools</p>
      </div>

      <Tabs defaultValue="stake" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stake">Stake</TabsTrigger>
          <TabsTrigger value="unstake">Unstake</TabsTrigger>
          <TabsTrigger value="positions">My Positions</TabsTrigger>
        </TabsList>

        <TabsContent value="stake" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Stake Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-600" />
                  Stake PYUSD
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pool">Select Pool</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a coverage pool" />
                    </SelectTrigger>
                    <SelectContent>
                      {stakingPools.map((pool) => (
                        <SelectItem key={pool.id} value={pool.id.toString()}>
                          {pool.name} - {pool.apy} APY
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (PYUSD)</Label>
                  <div className="relative">
                    <Input id="amount" type="number" placeholder="0.00" className="pr-16" />
                    <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">
                      MAX
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">Balance: 50,000 PYUSD</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Estimated APY:</span>
                    <span className="font-medium text-green-600">12.5%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Monthly Rewards:</span>
                    <span className="font-medium">~104 PYUSD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Voting Power:</span>
                    <span className="font-medium">10,000 gTokens</span>
                  </div>
                </div>

                <Button className="w-full bg-amber-600 hover:bg-amber-700">Stake PYUSD</Button>
              </CardContent>
            </Card>

            {/* Pool Stats */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Available Pools</h3>
              {stakingPools.map((pool) => (
                <Card key={pool.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{pool.name}</h4>
                        <p className="text-sm text-gray-600">Risk: {pool.risk}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{pool.apy}</p>
                        <p className="text-xs text-gray-600">APY</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">TVL</p>
                        <p className="font-medium">{pool.tvl}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Utilization</p>
                        <p className="font-medium">{pool.utilization}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="unstake" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Unstake Position</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Position</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose position to unstake" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aave">Aave Pool - 25,000 PYUSD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unstake-amount">Amount to Unstake</Label>
                <Input id="unstake-amount" type="number" placeholder="0.00" />
                <p className="text-sm text-gray-600">Available: 25,000 PYUSD</p>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Unstaking has a 7-day cooldown period. You'll continue earning rewards during
                  this time.
                </p>
              </div>

              <Button className="w-full bg-transparent" variant="outline">
                Initiate Unstaking
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <h3 className="text-lg font-semibold">Your Staking Positions</h3>
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h4 className="font-semibold">Aave Coverage Pool</h4>
                  <p className="text-sm text-gray-600">Staked: 25,000 PYUSD</p>
                  <p className="text-sm text-gray-600">Unclaimed Rewards: 1,250 PYUSD</p>
                  <p className="text-sm text-gray-600">Current APY: 12.5%</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    Claim
                  </Button>
                  <Button size="sm" variant="outline">
                    Unstake
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
