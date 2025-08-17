"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  TrendingUp,
  FileText,
  Zap,
  ChevronDown,
  ArrowRight,
  Info,
  X,
  Clock,
} from "lucide-react";
import Image from "next/image";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useToast } from "@/hooks/use-toast";
import { useContractInteraction } from "@/hooks/use-contract-interaction";

interface SimplifiedCoverageWidgetProps {
  activeTab: "coverage" | "stake" | "claim";
}

export function SimplifiedCoverageWidget({
  activeTab,
}: SimplifiedCoverageWidgetProps) {
  const [selectedProtocol, setSelectedProtocol] = useState("");
  const [coverageAmount, setCoverageAmount] = useState("1");
  const [duration, setDuration] = useState([90]);
  const [premium, setPremium] = useState(0);
  const [ccipFee, setCcipFee] = useState("0");
  const [isProtocolExpanded, setIsProtocolExpanded] = useState(false);
  const [stakeAmount, setStakeAmount] = useState("");
  const [claimAmount, setClaimAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { user, primaryWallet } = useDynamicContext();
  const { toast } = useToast();
  const { buyCoverage, getCCIPFeeEstimate } = useContractInteraction();

  // Mock protocols data
  const protocols = [
    {
      id: "aave",
      name: "Aave",
      logo: "/aave.svg",
      rate: "2.5%",
      risk: "Low",
      tvl: "$2.1B",
      chain: "Ethereum",
      network: "Ethereum",
      description: "Lending protocol",
    },
    {
      id: "uniswap",
      name: "Uniswap V3",
      logo: "/uniswap.svg",
      rate: "3.2%",
      risk: "Medium",
      tvl: "$1.8B",
      chain: "Arbitrum",
      network: "Arbitrum",
      description: "DEX protocol",
    },
    {
      id: "compound",
      name: "Compound",
      logo: "/compound.svg",
      rate: "2.8%",
      risk: "Low",
      tvl: "$900M",
      chain: "Ethereum",
      network: "Ethereum",
      description: "Lending protocol",
    },
    {
      id: "curve",
      name: "Curve Finance",
      logo: "/curve.png",
      rate: "2.3%",
      risk: "Medium",
      tvl: "$2B+",
      chain: "Ethereum",
      network: "Ethereum",
      description: "Stable/like-asset AMM pools.",
    },
    {
      id: "camelot",
      name: "Camelot DEX",
      logo: "/camelot.jpeg",
      rate: "3.4%",
      risk: "Medium",
      tvl: "$200M+",
      chain: "Arbitrum",
      network: "Arbitrum",
      description: "Native Arbitrum DEX with custom pools.",
    },
    {
      id: "radiant",
      name: "Radiant Capital",
      logo: "/radiant.jpeg",
      rate: "3.1%",
      risk: "Medium",
      tvl: "$300M+",
      chain: "Arbitrum",
      network: "Arbitrum",
      description: "Omnichain lending market.",
    },
  ];

  // Group protocols by network
  const protocolsByNetwork = protocols.reduce((acc, protocol) => {
    if (!acc[protocol.network]) {
      acc[protocol.network] = [];
    }
    acc[protocol.network].push(protocol);
    return acc;
  }, {} as Record<string, typeof protocols>);

  const selectedProtocolData = protocols.find((p) => p.id === selectedProtocol);

  const currentDuration = duration[0];

  const durationOptions = [
    { value: 30, label: "30 days" },
    { value: 60, label: "60 days" },
    { value: 90, label: "90 days" },
    { value: 180, label: "180 days" },
    { value: 365, label: "1 year" },
  ];

  const stakeRewards = {
    apy: "12.5",
    monthly: "104.17",
  };

  const calculatePremium = () => {
    if (!selectedProtocolData || !coverageAmount || !currentDuration) return 0;

    const baseRate = parseFloat(selectedProtocolData.rate.replace("%", ""));
    const amount = parseFloat(coverageAmount.replace(/,/g, ""));
    const days = currentDuration;

    return (amount * baseRate * days) / (100 * 365);
  };

  const getCompletionPercentage = () => {
    let completed = 0;
    if (selectedProtocol) completed += 25;
    if (coverageAmount) completed += 25;
    if (currentDuration) completed += 25;
    if (premium > 0) completed += 25;
    return completed;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const calculatedPremium = calculatePremium();
      setPremium(calculatedPremium);
    }, 500);

    return () => clearTimeout(timer);
  }, [selectedProtocol, coverageAmount, currentDuration]);

  // Update CCIP fee when parameters change
  useEffect(() => {
    const updateCCIPFee = async () => {
      if (selectedProtocol && coverageAmount && currentDuration && user) {
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
    user,
    getCCIPFeeEstimate,
  ]);

  const handleProtocolSelect = (protocolId: string) => {
    setSelectedProtocol(protocolId);
    setIsProtocolExpanded(false);
  };

  const handlePurchaseCoverage = async () => {
    if (!selectedProtocol || !coverageAmount || premium === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const success = await buyCoverage(
        selectedProtocol,
        coverageAmount,
        currentDuration,
        premium.toString()
      );

      if (success) {
        toast({
          title: "Coverage Purchased Successfully! 🎉",
          description: "Your coverage has been purchased and is now active",
          variant: "default",
        });

        // Reset form
        setSelectedProtocol("");
        setCoverageAmount("");
        setDuration([90]);
        setPremium(0);
        setCcipFee("0");
      }
    } catch (error) {
      console.error("Error purchasing coverage:", error);
      toast({
        title: "Purchase Failed",
        description:
          "There was an error purchasing coverage. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto h-full">
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50/50 h-full flex flex-col">
        <CardContent className="px-6 pt-6 pb-0 flex-1 flex flex-col">
          <div className="flex-1">
            {activeTab === "coverage" && (
              <div className="space-y-3">
                {/* Protocol Selection */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold flex items-center">
                    <Zap className="w-3 h-3 mr-1 text-blue-600" />
                    Select Protocol
                  </Label>

                  {!selectedProtocolData ? (
                    <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 hover:border-blue-300 transition-colors">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() =>
                          setIsProtocolExpanded(!isProtocolExpanded)
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                            <Zap className="w-3 h-3 text-gray-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-600">
                              Choose a protocol to insure
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className="border-gray-300 text-gray-600 text-xs"
                          >
                            Select
                          </Badge>
                          <motion.div
                            animate={{ rotate: isProtocolExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center"
                          >
                            <ChevronDown className="w-3 h-3 text-gray-500" />
                          </motion.div>
                        </div>
                      </div>

                      {/* Protocol Options */}
                      <AnimatePresence>
                        {isProtocolExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 space-y-6">
                              {Object.entries(protocolsByNetwork).map(
                                ([network, networkProtocols], networkIndex) => (
                                  <motion.div
                                    key={network}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                      duration: 0.3,
                                      delay: networkIndex * 0.1,
                                      ease: "easeOut",
                                    }}
                                    className="space-y-3"
                                  >
                                    {/* Network Header */}
                                    <div className="flex items-center space-x-2">
                                      <Badge
                                        variant="outline"
                                        className="text-xs font-medium px-2 py-1"
                                      >
                                        {network}
                                      </Badge>
                                      <div className="text-xs text-gray-500">
                                        {networkProtocols.length} protocol
                                        {networkProtocols.length > 1 ? "s" : ""}
                                      </div>
                                    </div>

                                    {/* Protocol Grid */}
                                    <div className="grid grid-cols-3 gap-2">
                                      {networkProtocols.map(
                                        (protocol, index) => (
                                          <motion.div
                                            key={protocol.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{
                                              duration: 0.2,
                                              delay:
                                                networkIndex * 0.1 +
                                                index * 0.05,
                                              ease: "easeOut",
                                            }}
                                            onClick={() =>
                                              handleProtocolSelect(protocol.id)
                                            }
                                            className="bg-white border border-gray-200 rounded-lg p-2 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
                                          >
                                            <div className="flex flex-col items-center text-center space-y-1">
                                              <div className="w-8 h-8 relative">
                                                <Image
                                                  src={protocol.logo}
                                                  alt={protocol.name}
                                                  fill
                                                  className="object-contain"
                                                />
                                              </div>
                                              <div className="space-y-0.5">
                                                <div className="font-medium text-gray-900 text-xs">
                                                  {protocol.name}
                                                </div>
                                                <div className="font-bold text-blue-600 text-sm">
                                                  {protocol.rate}
                                                </div>
                                              </div>
                                              <Badge
                                                variant={
                                                  protocol.risk === "Low"
                                                    ? "default"
                                                    : protocol.risk === "Medium"
                                                    ? "secondary"
                                                    : "destructive"
                                                }
                                                className="text-xs px-1 py-0"
                                              >
                                                {protocol.risk}
                                              </Badge>
                                            </div>
                                          </motion.div>
                                        )
                                      )}
                                    </div>
                                  </motion.div>
                                )
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 relative">
                            <Image
                              src={selectedProtocolData.logo}
                              alt={selectedProtocolData.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {selectedProtocolData.name}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className="border-slate-400 text-slate-700"
                          >
                            TVL: {selectedProtocolData.tvl}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="border-green-400 text-green-700"
                          >
                            {selectedProtocolData.rate}
                          </Badge>
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
                    </motion.div>
                  )}
                </div>

                {/* Coverage Amount & Duration - Combined Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold flex items-center">
                      <Shield className="w-3 h-3 mr-1 text-blue-600" />
                      Coverage Amount
                    </Label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="10,000"
                        value={coverageAmount}
                        onChange={(e) => setCoverageAmount(e.target.value)}
                        className="h-8 text-sm pr-16 border focus:border-blue-500"
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center bg-gray-100 px-1 py-0.5 rounded">
                        <div className="w-3 h-3 relative mr-1">
                          <Image
                            src="/pyusd.svg"
                            alt="PYUSD"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          PYUSD
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-blue-600" />
                      Duration ({currentDuration} days)
                    </Label>
                    <Slider
                      value={duration}
                      onValueChange={setDuration}
                      max={365}
                      min={30}
                      step={30}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Premium Calculation */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-3">
                  <h4 className="font-semibold text-gray-900 mb-2 text-xs">
                    Premium Calculation
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs">Base Rate:</span>
                      <span className="font-semibold text-gray-900 text-xs">
                        {selectedProtocolData?.rate || "0%"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs">Duration:</span>
                      <span className="font-medium text-gray-900 text-xs">
                        {currentDuration} days
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs">
                        Coverage Amount:
                      </span>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900 text-xs mr-1">
                          {coverageAmount || "0"}
                        </span>
                        <div className="w-3 h-3 relative mr-1">
                          <Image
                            src="/pyusd.svg"
                            alt="PYUSD"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span className="font-medium text-gray-900 text-xs">
                          PYUSD
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs">CCIP Fee:</span>
                      <span className="font-medium text-gray-900 text-xs">
                        {ccipFee} ETH
                      </span>
                    </div>
                    <div className="border-t border-blue-200 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-900">
                          Total Premium:
                        </span>
                        <div className="flex items-center">
                          <span className="text-base font-bold text-blue-600 mr-1">
                            {premium.toFixed(2)}
                          </span>
                          <div className="w-4 h-4 relative mr-1">
                            <Image
                              src="/pyusd.svg"
                              alt="PYUSD"
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span className="text-base font-bold text-blue-600">
                            PYUSD
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "stake" && (
              <div className="space-y-4">
                <div className="text-center mb-3">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="text-base font-semibold text-gray-900">
                    Provide Liquidity
                  </h3>
                  <p className="text-gray-600 text-xs">
                    Earn rewards by staking PYUSD and supporting the insurance
                    pool
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">
                      Stake Amount
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="1,000"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        className="h-10 text-base pr-20 border-2 focus:border-green-500"
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center bg-gray-100 px-1 py-0.5 rounded">
                        <div className="w-3 h-3 relative mr-1">
                          <Image
                            src="/pyusd.svg"
                            alt="PYUSD"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          PYUSD
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                      Rewards Overview
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Current APY:</span>
                        <span className="text-xl font-bold text-green-600">
                          {stakeRewards.apy}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          Est. Monthly Rewards:
                        </span>
                        <div className="flex items-center">
                          <span className="text-base font-semibold text-gray-900 mr-1">
                            ~{stakeRewards.monthly}
                          </span>
                          <div className="w-3 h-3 relative mr-1">
                            <Image
                              src="/pyusd.svg"
                              alt="PYUSD"
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span className="text-base font-semibold text-gray-900">
                            PYUSD
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Lock Period:</span>
                        <span className="font-medium text-gray-900">1 day</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "claim" && (
              <div className="space-y-4">
                <div className="text-center mb-3">
                  <FileText className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <h3 className="text-base font-semibold text-gray-900">
                    Submit Claim
                  </h3>
                  <p className="text-gray-600 text-xs">
                    Report an incident and request compensation for your losses
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Protocol</Label>
                    <Select>
                      <SelectTrigger className="h-10 text-left">
                        <SelectValue placeholder="Select the protocol where the incident occurred" />
                      </SelectTrigger>
                      <SelectContent>
                        {protocols.map((protocol) => (
                          <SelectItem key={protocol.id} value={protocol.id}>
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 relative">
                                <Image
                                  src={protocol.logo}
                                  alt={protocol.name}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <span>{protocol.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">
                      Claim Amount
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="5,000"
                        value={claimAmount}
                        onChange={(e) => setClaimAmount(e.target.value)}
                        className="h-10 text-base pr-20 border-2 focus:border-orange-500"
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center bg-gray-100 px-1 py-0.5 rounded">
                        <div className="w-3 h-3 relative mr-1">
                          <Image
                            src="/pyusd.svg"
                            alt="PYUSD"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          PYUSD
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">
                      Incident Description
                    </Label>
                    <textarea
                      className="w-full p-3 border-2 border-gray-200 rounded-xl text-xs focus:border-orange-500 focus:ring-0 resize-none"
                      rows={2}
                      placeholder="Describe the incident that led to your loss. Include relevant transaction hashes, timestamps, and any supporting evidence..."
                    />
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-2">
                    <div className="flex items-start space-x-2">
                      <Info className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-orange-800">
                        <p className="font-medium mb-1">Important:</p>
                        <p>
                          Claims are reviewed by the community through a voting
                          process. Provide detailed information to help with the
                          assessment.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        {/* Action Button Footer */}
        {activeTab === "coverage" && (
          <div className="mt-auto border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
            <div className="px-6 py-4">
              {user && (
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Sepolia Testnet</span>
                </div>
              )}

              {user ? (
                <Button
                  className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={
                    !selectedProtocol ||
                    !coverageAmount ||
                    premium === 0 ||
                    isProcessing
                  }
                  onClick={handlePurchaseCoverage}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Purchase Coverage
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              ) : (
                <div className="text-center text-sm text-gray-500 py-2">
                  Please connect your wallet to purchase coverage
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "stake" && (
          <div className="mt-auto border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
            <div className="px-6 py-4">
              <Button
                className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={!stakeAmount}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Stake Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {activeTab === "claim" && (
          <div className="mt-auto border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
            <div className="px-6 py-4">
              <Button
                className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={!claimAmount}
              >
                <FileText className="w-4 h-4 mr-2" />
                Submit Claim
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
