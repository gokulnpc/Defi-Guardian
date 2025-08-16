"use client";

import { useState, useEffect } from "react";
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
import { Slider } from "@/components/ui/slider";
import {
  Shield,
  TrendingUp,
  FileText,
  CheckCircle,
  AlertCircle,
  Info,
  DollarSign,
  Calendar,
  Zap,
  ArrowRight,
  ExternalLink,
  X,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useToast } from "@/hooks/use-toast";
import {
  PremiumVaultABI,
  CONTRACT_ADDRESSES,
  type PolicyTerms,
} from "@/lib/contracts";
import { parseEther, formatEther } from "viem";
import { useContractInteraction } from "@/hooks/use-contract-interaction";

const protocols = [
  {
    id: "aave",
    name: "Aave",
    chain: "Ethereum",
    rate: "2.5%",
    logo: "🟢",
    risk: "Low",
    tvl: "$12.5B",
    description: "Lending protocol with stable rates",
  },
  {
    id: "compound",
    name: "Compound",
    chain: "Ethereum",
    rate: "2.8%",
    logo: "🔵",
    risk: "Low",
    tvl: "$8.2B",
    description: "Algorithmic interest rate protocol",
  },
  {
    id: "uniswap",
    name: "Uniswap V3",
    chain: "Arbitrum",
    rate: "3.2%",
    logo: "🦄",
    risk: "Medium",
    tvl: "$5.1B",
    description: "Decentralized exchange with concentrated liquidity",
  },
  {
    id: "curve",
    name: "Curve Finance",
    chain: "Ethereum",
    rate: "2.1%",
    logo: "📈",
    risk: "Low",
    tvl: "$15.3B",
    description: "Stablecoin exchange with low slippage",
  },
];

const durationOptions = [
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
  { value: 180, label: "180 days" },
  { value: 365, label: "365 days" },
];

export function SimplifiedCoverageWidget() {
  const [selectedProtocol, setSelectedProtocol] = useState("");
  const [coverageAmount, setCoverageAmount] = useState("");
  const [duration, setDuration] = useState([90]);
  const [claimAmount, setClaimAmount] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [activeTab, setActiveTab] = useState("coverage");
  const [isCalculating, setIsCalculating] = useState(false);
  const [ccipFee, setCcipFee] = useState("0");

  const { user, primaryWallet } = useDynamicContext();
  const {
    buyCoverage,
    isLoading: isBuyingCoverage,
    isConnected,
    getCCIPFeeEstimate,
  } = useContractInteraction();
  const { toast } = useToast();

  const selectedProtocolData = protocols.find((p) => p.id === selectedProtocol);
  const currentDuration = duration[0];

  const calculatePremium = () => {
    if (!coverageAmount || !selectedProtocol) return "0.00";
    const protocol = protocols.find((p) => p.id === selectedProtocol);
    if (!protocol) return "0.00";
    const rate = Number.parseFloat(protocol.rate.replace("%", "")) / 100;
    const amount = Number.parseFloat(coverageAmount);
    const days = currentDuration;
    return ((amount * rate * days) / 365).toFixed(2);
  };

  const calculateStakeRewards = () => {
    if (!stakeAmount) return { monthly: "0.00", apy: "12.5" };
    const amount = Number.parseFloat(stakeAmount);
    const apy = 12.5;
    const monthly = ((amount * apy) / 100 / 12).toFixed(2);
    return { monthly, apy: apy.toString() };
  };

  const stakeRewards = calculateStakeRewards();
  const premium = calculatePremium();

  // Simulate calculation delay for better UX
  useEffect(() => {
    if (coverageAmount && selectedProtocol) {
      setIsCalculating(true);
      const timer = setTimeout(() => setIsCalculating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [coverageAmount, duration, selectedProtocol]);

  // Update CCIP fee when parameters change
  useEffect(() => {
    const updateCCIPFee = async () => {
      if (
        selectedProtocol &&
        coverageAmount &&
        currentDuration > 0 &&
        isConnected
      ) {
        try {
          const fee = await getCCIPFeeEstimate(
            selectedProtocol,
            coverageAmount,
            currentDuration
          );
          setCcipFee(fee);
        } catch (error) {
          console.warn("Could not estimate CCIP fee:", error);
          setCcipFee("0.001"); // Default fallback
        }
      }
    };

    updateCCIPFee();
  }, [
    selectedProtocol,
    coverageAmount,
    currentDuration,
    isConnected,
    getCCIPFeeEstimate,
  ]);

  const getCompletionPercentage = () => {
    let completed = 0;
    if (selectedProtocol) completed += 33;
    if (coverageAmount) completed += 33;
    if (currentDuration > 0) completed += 34;
    return completed;
  };

  const formatDuration = (days: number) => {
    if (days === 30) return "30 days";
    if (days === 90) return "90 days";
    if (days === 180) return "180 days";
    if (days === 365) return "365 days";
    return `${days} days`;
  };

  const handleBuyCoverage = async () => {
    if (!selectedProtocol || !coverageAmount) {
      toast({
        title: "Missing information",
        description: "Please select a protocol and enter coverage amount",
        variant: "destructive",
      });
      return;
    }

    const success = await buyCoverage(
      selectedProtocol,
      coverageAmount,
      currentDuration,
      premium
    );
    console.log("success", success);
    if (success) {
      // Reset form
      setSelectedProtocol("");
      setCoverageAmount("");
      setDuration([90]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50/50">
        <CardContent className="px-8 pb-8">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 h-14 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger
                value="coverage"
                className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 rounded-lg transition-all duration-200"
              >
                <Shield className="w-4 h-4 mr-2" />
                <span className="font-medium">Coverage</span>
              </TabsTrigger>
              <TabsTrigger
                value="stake"
                className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-green-600 rounded-lg transition-all duration-200"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                <span className="font-medium">Stake</span>
              </TabsTrigger>
              <TabsTrigger
                value="claim"
                className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-orange-600 rounded-lg transition-all duration-200"
              >
                <FileText className="w-4 h-4 mr-2" />
                <span className="font-medium">Claim</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="coverage" className="space-y-5">
                {/* Protocol Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-blue-600" />
                    Select Protocol
                  </Label>

                  {!selectedProtocolData ? (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <Zap className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-600">
                              Choose a protocol to insure
                            </div>
                            <div className="text-sm text-gray-500">
                              Select from available DeFi protocols
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className="border-gray-300 text-gray-600"
                          >
                            Select
                          </Badge>
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Protocol Options */}
                      <div className="mt-4 space-y-2">
                        {protocols.map((protocol) => (
                          <div
                            key={protocol.id}
                            onClick={() => setSelectedProtocol(protocol.id)}
                            className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-xl">{protocol.logo}</span>
                                <div className="text-left">
                                  <div className="font-medium text-gray-900">
                                    {protocol.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {protocol.description}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-blue-600">
                                  {protocol.rate}
                                </div>
                                <Badge
                                  variant={
                                    protocol.risk === "Low"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {protocol.risk}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">
                            {selectedProtocolData.logo}
                          </span>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {selectedProtocolData.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              TVL: {selectedProtocolData.tvl}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className="border-blue-300 text-blue-700"
                          >
                            {selectedProtocolData.chain}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedProtocol("")}
                            className="h-8 w-8 p-0 hover:bg-blue-100"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Coverage Amount */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                    Coverage Amount
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="10,000"
                      value={coverageAmount}
                      onChange={(e) => setCoverageAmount(e.target.value)}
                      className="h-12 text-lg pr-20 border-2 focus:border-blue-500"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      PYUSD
                    </span>
                  </div>
                </div>

                {/* Duration Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                    Coverage Duration
                  </Label>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Slider
                        value={duration}
                        onValueChange={setDuration}
                        max={365}
                        min={30}
                        step={1}
                        className="flex-1"
                      />
                      <div className="w-20">
                        <Input
                          type="number"
                          value={currentDuration}
                          onChange={(e) =>
                            setDuration([Number(e.target.value)])
                          }
                          className="text-center"
                          min={30}
                          max={365}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500">
                      <span>30 days</span>
                      <span>90 days</span>
                      <span>180 days</span>
                      <span>365 days</span>
                    </div>

                    <div className="text-sm text-gray-600 text-center">
                      Selected:{" "}
                      <span className="font-medium">
                        {formatDuration(currentDuration)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Premium Calculation */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Premium Calculation
                    </h3>
                    {isCalculating && (
                      <div className="flex items-center text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Calculating...
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Coverage Amount:</span>
                      <span className="font-medium">
                        {coverageAmount || "0"} PYUSD
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">
                        {formatDuration(currentDuration)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Rate:</span>
                      <span className="font-medium">
                        {selectedProtocolData?.rate || "N/A"}
                      </span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">
                          Total Premium:
                        </span>
                        <span className="text-2xl font-bold text-blue-600">
                          {premium} PYUSD
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CCIP Fee Display */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Info className="w-5 h-5 text-yellow-600" />
                    <div className="text-sm text-yellow-800">
                      <span className="font-medium">CCIP Fee:</span> {ccipFee}{" "}
                      ETH (estimated)
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={
                    !selectedProtocol ||
                    !coverageAmount ||
                    isBuyingCoverage ||
                    !isConnected
                  }
                  onClick={handleBuyCoverage}
                >
                  {isBuyingCoverage ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-2" />
                      Get Coverage Now
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>

                {!isConnected && (
                  <div className="text-center text-sm text-gray-500">
                    Please connect your wallet to purchase coverage
                  </div>
                )}
              </TabsContent>

              <TabsContent value="stake" className="space-y-4">
                <div className="text-center mb-4">
                  <TrendingUp className="w-10 h-10 text-green-600 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Provide Liquidity
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Earn rewards by staking PYUSD and supporting the insurance
                    pool
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      Stake Amount
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="1,000"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        className="h-12 text-lg pr-20 border-2 focus:border-green-500"
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        PYUSD
                      </span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Rewards Overview
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Current APY:</span>
                        <span className="text-2xl font-bold text-green-600">
                          {stakeRewards.apy}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          Est. Monthly Rewards:
                        </span>
                        <span className="text-lg font-semibold text-gray-900">
                          ~{stakeRewards.monthly} PYUSD
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Lock Period:</span>
                        <span className="font-medium text-gray-900">1 day</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={!stakeAmount}
                  >
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Stake Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="claim" className="space-y-4">
                <div className="text-center mb-4">
                  <FileText className="w-10 h-10 text-orange-600 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Submit Claim
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Report an incident and request compensation for your losses
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Protocol</Label>
                    <Select>
                      <SelectTrigger className="h-12 text-left">
                        <SelectValue placeholder="Select the protocol where the incident occurred" />
                      </SelectTrigger>
                      <SelectContent>
                        {protocols.map((protocol) => (
                          <SelectItem key={protocol.id} value={protocol.id}>
                            <div className="flex items-center space-x-3">
                              <span className="text-xl">{protocol.logo}</span>
                              <span>{protocol.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      Claim Amount
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="5,000"
                        value={claimAmount}
                        onChange={(e) => setClaimAmount(e.target.value)}
                        className="h-12 text-lg pr-20 border-2 focus:border-orange-500"
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        PYUSD
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      Incident Description
                    </Label>
                    <textarea
                      className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:border-orange-500 focus:ring-0 resize-none"
                      rows={3}
                      placeholder="Describe the incident that led to your loss. Include relevant transaction hashes, timestamps, and any supporting evidence..."
                    />
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-orange-800">
                        <p className="font-medium mb-1">Important:</p>
                        <p>
                          Claims are reviewed by the community through a voting
                          process. Provide detailed information to help with the
                          assessment.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={!claimAmount}
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Submit Claim
                    <ArrowRight className="w-5 h-5 ml-2" />
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
