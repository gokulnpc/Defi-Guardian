import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FileUp, AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react"

const mockClaims = [
  {
    id: "CLM-001",
    policy: "Aave V3 Coverage",
    amount: "10,000 PYUSD",
    status: "Under Review",
    submitted: "2024-01-15",
    incident: "Smart contract exploit",
  },
  {
    id: "CLM-002",
    policy: "Uniswap V3 Coverage",
    amount: "5,000 PYUSD",
    status: "Approved",
    submitted: "2024-01-10",
    incident: "Oracle manipulation",
  },
]

export default function ClaimsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Claims</h1>
        <p className="text-gray-600">Submit and track insurance claims</p>
      </div>

      <Tabs defaultValue="submit" className="space-y-6">
        <TabsList>
          <TabsTrigger value="submit">Submit Claim</TabsTrigger>
          <TabsTrigger value="my-claims">My Claims</TabsTrigger>
          <TabsTrigger value="proposals">Open Proposals</TabsTrigger>
        </TabsList>

        <TabsContent value="submit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Submit Insurance Claim
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Select Policy</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an active policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aave">Aave V3 - 10,000 PYUSD Coverage</SelectItem>
                    <SelectItem value="uniswap">Uniswap V3 - 5,000 PYUSD Coverage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="incident-date">Incident Date</Label>
                  <Input id="incident-date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="claim-amount">Claim Amount (PYUSD)</Label>
                  <Input id="claim-amount" type="number" placeholder="0.00" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="incident-description">Incident Description</Label>
                <Textarea
                  id="incident-description"
                  placeholder="Describe what happened and how it affected your position..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tx-evidence">Transaction Evidence</Label>
                <Input id="tx-evidence" placeholder="Transaction hash or contract address" />
                <p className="text-sm text-gray-600">Provide transaction hashes or contract addresses as evidence</p>
              </div>

              <div className="space-y-2">
                <Label>Supporting Documents</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload screenshots, reports, or other evidence</p>
                  <Button variant="outline" size="sm">
                    Choose Files
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Claims are reviewed by the Hedera DAO. The voting process typically takes 3-7
                  days.
                </p>
              </div>

              <Button className="w-full bg-red-600 hover:bg-red-700">Submit Claim</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-claims" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Your Claims History</h3>
            <Button className="bg-red-600 hover:bg-red-700">Submit New Claim</Button>
          </div>

          <div className="space-y-4">
            {mockClaims.map((claim) => (
              <Card key={claim.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{claim.id}</h4>
                        <Badge
                          variant={
                            claim.status === "Approved"
                              ? "default"
                              : claim.status === "Under Review"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {claim.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{claim.policy}</p>
                      <p className="text-sm text-gray-600">
                        Amount: {claim.amount} • Submitted: {claim.submitted}
                      </p>
                      <p className="text-sm text-gray-600">Incident: {claim.incident}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>

                  {/* Status Timeline */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Submitted</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {claim.status === "Under Review" ? (
                        <Clock className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      <span>Under Review</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {claim.status === "Approved" ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : claim.status === "Rejected" ? (
                        <XCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-400" />
                      )}
                      <span>Decision</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {claim.status === "Approved" ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-400" />
                      )}
                      <span>Payout</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="proposals" className="space-y-4">
          <h3 className="text-lg font-semibold">Open Claim Proposals</h3>
          <p className="text-gray-600">View claims currently under DAO review</p>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">CLM-003</h4>
                    <Badge variant="secondary">Voting Active</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Compound V3 Coverage - 15,000 PYUSD</p>
                  <p className="text-sm text-gray-600">Incident: Liquidation bot failure during market volatility</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>Votes For: 45%</span>
                    <span>Votes Against: 25%</span>
                    <span>Time Left: 2 days</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Proposal
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
