"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  Loader2,
  ExternalLink,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

// Mock data types
interface CoveragePolicy {
  id: string;
  protocol: string;
  protocolLogo: string;
  coverageAmount: string;
  premium: string;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "pending";
  chain: string;
}

interface StakeInfo {
  id: string;
  amount: string;
  apy: string;
  rewards: string;
  lockPeriod: string;
  status: "active" | "unlocking" | "unlocked";
}

interface ClaimInfo {
  id: string;
  protocol: string;
  protocolLogo: string;
  amount: string;
  status: "pending" | "approved" | "rejected" | "processing";
  submittedDate: string;
  description: string;
}

interface UserDashboardWidgetProps {
  activeTab: "coverage" | "stake" | "claim";
}

export function UserDashboardWidget({ activeTab }: UserDashboardWidgetProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [policies, setPolicies] = useState<CoveragePolicy[]>([]);
  const [stakes, setStakes] = useState<StakeInfo[]>([]);
  const [claims, setClaims] = useState<ClaimInfo[]>([]);

  const { user, primaryWallet } = useDynamicContext();
  const { toast } = useToast();

  // Mock data - replace with actual API calls
  useEffect(() => {
    if (user) {
      setIsLoading(true);

      // Simulate API call
      setTimeout(() => {
        setPolicies([
          {
            id: "1",
            protocol: "Aave",
            protocolLogo: "/aave.svg",
            coverageAmount: "10,000",
            premium: "250",
            startDate: "2024-01-15",
            endDate: "2024-04-15",
            status: "active",
            chain: "Ethereum",
          },
          {
            id: "2",
            protocol: "Uniswap V3",
            protocolLogo: "/uniswap.svg",
            coverageAmount: "5,000",
            premium: "160",
            startDate: "2024-02-01",
            endDate: "2024-05-01",
            status: "active",
            chain: "Arbitrum",
          },
        ]);

        setStakes([
          {
            id: "1",
            amount: "2,500",
            apy: "12.5%",
            rewards: "31.25",
            lockPeriod: "1 day",
            status: "active",
          },
          {
            id: "2",
            amount: "1,000",
            apy: "12.5%",
            rewards: "12.5",
            lockPeriod: "1 day",
            status: "unlocking",
          },
        ]);

        setClaims([
          {
            id: "1",
            protocol: "Aave",
            protocolLogo: "/aave.svg",
            amount: "2,500",
            status: "pending",
            submittedDate: "2024-03-10",
            description: "Smart contract vulnerability exploit",
          },
          {
            id: "2",
            protocol: "Curve Finance",
            protocolLogo: "/curve.png",
            amount: "1,000",
            status: "approved",
            submittedDate: "2024-03-05",
            description: "Flash loan attack",
          },
        ]);

        setIsLoading(false);
      }, 1000);
    } else {
      setPolicies([]);
      setStakes([]);
      setClaims([]);
      setIsLoading(false);
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "expired":
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "unlocking":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
      case "processing":
        return <Clock className="w-4 h-4" />;
      case "expired":
      case "rejected":
        return <AlertTriangle className="w-4 h-4" />;
      case "unlocking":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50/50">
          <CardContent className="px-6 py-8">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-gray-600">Loading your data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50/50">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-2">
            <Shield className="w-6 h-6 text-blue-600 mr-2" />
            <CardTitle className="text-xl font-bold text-gray-900">
              Your Dashboard
            </CardTitle>
          </div>
          <p className="text-gray-600 text-sm">
            Manage your coverage and investments
          </p>
        </CardHeader>

        <CardContent className="px-6 pb-6">
          <div className="mt-4 max-h-96 overflow-y-auto">
            {activeTab === "coverage" && (
              <div className="space-y-3">
                {policies.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      No active coverage policies
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Purchase coverage to see your policies here
                    </p>
                  </div>
                ) : (
                  policies.map((policy) => (
                    <motion.div
                      key={policy.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 relative">
                            <Image
                              src={policy.protocolLogo}
                              alt={policy.protocol}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {policy.protocol}
                            </div>
                            <div className="text-xs text-gray-500">
                              {policy.chain}
                            </div>
                          </div>
                        </div>
                        <Badge
                          className={`text-xs border ${getStatusColor(
                            policy.status
                          )}`}
                        >
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(policy.status)}
                            <span className="capitalize">{policy.status}</span>
                          </div>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-gray-500 text-xs">Coverage</div>
                          <div className="flex items-center">
                            <span className="font-semibold text-gray-900 mr-1">
                              {policy.coverageAmount}
                            </span>
                            <div className="w-3 h-3 relative mr-1">
                              <Image
                                src="/pyusd.svg"
                                alt="PYUSD"
                                fill
                                className="object-contain"
                              />
                            </div>
                            <span className="font-semibold text-gray-900 text-xs">
                              PYUSD
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs">Premium</div>
                          <div className="flex items-center">
                            <span className="font-semibold text-blue-600 mr-1">
                              {policy.premium}
                            </span>
                            <div className="w-3 h-3 relative mr-1">
                              <Image
                                src="/pyusd.svg"
                                alt="PYUSD"
                                fill
                                className="object-contain"
                              />
                            </div>
                            <span className="font-semibold text-blue-600 text-xs">
                              PYUSD
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs">
                            Start Date
                          </div>
                          <div className="font-medium text-gray-900">
                            {new Date(policy.startDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs">End Date</div>
                          <div className="font-medium text-gray-900">
                            {new Date(policy.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {activeTab === "stake" && (
              <div className="space-y-3">
                {stakes.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No staked amounts</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Stake PYUSD to earn rewards
                    </p>
                  </div>
                ) : (
                  stakes.map((stake) => (
                    <motion.div
                      key={stake.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              Staked Amount
                            </div>
                            <div className="text-xs text-gray-500">
                              Lock: {stake.lockPeriod}
                            </div>
                          </div>
                        </div>
                        <Badge
                          className={`text-xs border ${getStatusColor(
                            stake.status
                          )}`}
                        >
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(stake.status)}
                            <span className="capitalize">{stake.status}</span>
                          </div>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-gray-500 text-xs">Amount</div>
                          <div className="flex items-center">
                            <span className="font-semibold text-gray-900 mr-1">
                              {stake.amount}
                            </span>
                            <div className="w-3 h-3 relative mr-1">
                              <Image
                                src="/pyusd.svg"
                                alt="PYUSD"
                                fill
                                className="object-contain"
                              />
                            </div>
                            <span className="font-semibold text-gray-900 text-xs">
                              PYUSD
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs">APY</div>
                          <div className="font-semibold text-green-600">
                            {stake.apy}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs">Rewards</div>
                          <div className="flex items-center">
                            <span className="font-semibold text-green-600 mr-1">
                              {stake.rewards}
                            </span>
                            <div className="w-3 h-3 relative mr-1">
                              <Image
                                src="/pyusd.svg"
                                alt="PYUSD"
                                fill
                                className="object-contain"
                              />
                            </div>
                            <span className="font-semibold text-green-600 text-xs">
                              PYUSD
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {activeTab === "claim" && (
              <div className="space-y-3">
                {claims.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No claims submitted</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Submit a claim to see it here
                    </p>
                  </div>
                ) : (
                  claims.map((claim) => (
                    <motion.div
                      key={claim.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 relative">
                            <Image
                              src={claim.protocolLogo}
                              alt={claim.protocol}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {claim.protocol}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(
                                claim.submittedDate
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Badge
                          className={`text-xs border ${getStatusColor(
                            claim.status
                          )}`}
                        >
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(claim.status)}
                            <span className="capitalize">{claim.status}</span>
                          </div>
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-xs">Amount</span>
                          <div className="flex items-center">
                            <span className="font-semibold text-gray-900 mr-1">
                              {claim.amount}
                            </span>
                            <div className="w-3 h-3 relative mr-1">
                              <Image
                                src="/pyusd.svg"
                                alt="PYUSD"
                                fill
                                className="object-contain"
                              />
                            </div>
                            <span className="font-semibold text-gray-900 text-xs">
                              PYUSD
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 line-clamp-2">
                          {claim.description}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default UserDashboardWidget;
