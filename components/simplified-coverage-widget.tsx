"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, TrendingUp, FileText } from "lucide-react";

const protocols = [
  { id: "aave", name: "Aave", chain: "Ethereum", rate: "2.5%" },
  { id: "compound", name: "Compound", chain: "Ethereum", rate: "2.8%" },
  { id: "uniswap", name: "Uniswap V3", chain: "Arbitrum", rate: "3.2%" },
  { id: "curve", name: "Curve Finance", chain: "Ethereum", rate: "2.1%" },
];

export function SimplifiedCoverageWidget() {
  const [selectedProtocol, setSelectedProtocol] = useState("");
  const [coverageAmount, setCoverageAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [claimAmount, setClaimAmount] = useState("");

  const calculatePremium = () => {
    if (!coverageAmount || !duration || !selectedProtocol) return "0.00";
    const protocol = protocols.find((p) => p.id === selectedProtocol);
    if (!protocol) return "0.00";
    const rate = Number.parseFloat(protocol.rate.replace("%", "")) / 100;
    const amount = Number.parseFloat(coverageAmount);
    const days = Number.parseInt(duration);
    return ((amount * rate * days) / 365).toFixed(2);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-2 border-cyan-200 shadow-xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-gray-900">
            DeFi Insurance
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Protect your investments across chains
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="coverage" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="coverage" className="text-xs">
                <Shield className="w-4 h-4 mr-1" />
                Coverage
              </TabsTrigger>
              <TabsTrigger value="stake" className="text-xs">
                <TrendingUp className="w-4 h-4 mr-1" />
                Stake
              </TabsTrigger>
              <TabsTrigger value="claim" className="text-xs">
                <FileText className="w-4 h-4 mr-1" />
                Claim
              </TabsTrigger>
            </TabsList>

            <div className="h-80 mt-4 flex flex-col">
              <TabsContent value="coverage" className="flex-1 flex flex-col">
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="protocol">Select Protocol</Label>
                    <Select
                      value={selectedProtocol}
                      onValueChange={setSelectedProtocol}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose protocol" />
                      </SelectTrigger>
                      <SelectContent>
                        {protocols.map((protocol) => (
                          <SelectItem key={protocol.id} value={protocol.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{protocol.name}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                {protocol.rate}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Coverage Amount</Label>
                    <div className="relative">
                      <Input
                        id="amount"
                        type="number"
                        placeholder="10,000"
                        value={coverageAmount}
                        onChange={(e) => setCoverageAmount(e.target.value)}
                        className="pr-16"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                        PYUSD
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (Days)</Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">180 days</SelectItem>
                        <SelectItem value="365">365 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Premium:</span>
                      <span className="font-semibold text-cyan-600">
                        {calculatePremium()} PYUSD
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                    Get Coverage
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="stake" className="flex-1 flex flex-col">
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="stake-amount">Stake Amount</Label>
                    <div className="relative">
                      <Input
                        id="stake-amount"
                        type="number"
                        placeholder="1,000"
                        className="pr-16"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                        PYUSD
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between text-sm mb-1">
                      <span>APY:</span>
                      <span className="font-semibold text-green-600">
                        12.5%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Est. Monthly Rewards:</span>
                      <span className="font-semibold">~10.4 PYUSD</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Button className="w-full bg-amber-600 hover:bg-amber-700">
                    Stake Now
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="claim" className="flex-1 flex flex-col">
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="claim-protocol">Protocol</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select protocol" />
                      </SelectTrigger>
                      <SelectContent>
                        {protocols.map((protocol) => (
                          <SelectItem key={protocol.id} value={protocol.id}>
                            {protocol.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="claim-amount">Claim Amount</Label>
                    <div className="relative">
                      <Input
                        id="claim-amount"
                        type="number"
                        placeholder="5,000"
                        value={claimAmount}
                        onChange={(e) => setClaimAmount(e.target.value)}
                        className="pr-16"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                        PYUSD
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="incident-description">
                      Incident Description
                    </Label>
                    <textarea
                      id="incident-description"
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      rows={3}
                      placeholder="Describe the incident that led to your loss..."
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    Submit Claim
                  </Button>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
