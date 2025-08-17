"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  TrendingUp,
  Bell,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const mockCoverages = [
  {
    id: 1,
    protocol: "Aave V3",
    chain: "Ethereum",
    amount: "10,000",
    premium: "150",
    expiry: "2024-03-15",
    status: "Active",
    logo: "/aave.svg",
  },
  {
    id: 2,
    protocol: "Uniswap V3",
    chain: "Arbitrum",
    amount: "5,000",
    premium: "75",
    expiry: "2024-02-28",
    status: "Expiring Soon",
    logo: "/uniswap.svg",
  },
];

const mockStaking = [
  {
    id: 1,
    pool: "General Insurance Pool",
    staked: "2,500",
    rewards: "31.25",
    apy: "12.5%",
    lockPeriod: "1 day",
    status: "Active",
  },
  {
    id: 2,
    pool: "High-Risk Protocol Pool",
    staked: "1,000",
    rewards: "12.5",
    apy: "12.5%",
    lockPeriod: "1 day",
    status: "Unlocking",
  },
];

const mockNotifications = [
  {
    id: 1,
    type: "warning",
    title: "Coverage Expiring Soon",
    message: "Your Uniswap V3 coverage expires in 5 days",
    timestamp: "2 hours ago",
    icon: AlertTriangle,
    iconColor: "text-amber-500",
  },
  {
    id: 2,
    type: "success",
    title: "Staking Rewards Available",
    message: "You have 125 PYUSD in rewards ready to claim",
    timestamp: "1 day ago",
    icon: TrendingUp,
    iconColor: "text-green-500",
  },
];

export default function DashboardPage() {
  const router = useRouter();

  const handleCoverageNavigation = () => {
    router.push("/?tab=coverage");
  };

  const handleStakeNavigation = () => {
    router.push("/?tab=stake");
  };

  const handleClaimNavigation = () => {
    router.push("/?tab=claim");
  };

  const handleGovernanceNavigation = () => {
    router.push("/governance");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Manage your coverage and staking positions
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white shadow-sm border">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="coverage" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              My Coverage
            </TabsTrigger>
            <TabsTrigger value="staking" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              My Staking
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Coverage
                  </CardTitle>
                  <Shield className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-bold">15,000</div>
                    <div className="flex items-center">
                      <div className="w-5 h-5 relative mr-1">
                        <Image
                          src="/pyusd.svg"
                          alt="PYUSD"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="text-lg font-semibold text-gray-700">
                        PYUSD
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Across 2 protocols
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Staked Amount
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-bold">25,000</div>
                    <div className="flex items-center">
                      <div className="w-5 h-5 relative mr-1">
                        <Image
                          src="/pyusd.svg"
                          alt="PYUSD"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="text-lg font-semibold text-gray-700">
                        PYUSD
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Earning 12.5% APY
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Actions
                  </CardTitle>
                  <Bell className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2</div>
                  <p className="text-xs text-gray-600 mt-1">
                    Require attention
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="coverage" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                Active Coverage Policies
              </h2>
              <Button
                className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                onClick={handleCoverageNavigation}
              >
                <Shield className="w-4 h-4 mr-2" />
                Buy New Coverage
              </Button>
            </div>

            <div className="grid gap-4">
              {mockCoverages.map((coverage) => (
                <Card
                  key={coverage.id}
                  className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 relative">
                            <Image
                              src={coverage.logo}
                              alt={coverage.protocol}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <h3 className="font-semibold text-lg">
                            {coverage.protocol}
                          </h3>
                          <Badge variant="outline" className="bg-gray-50">
                            {coverage.chain}
                          </Badge>
                          <Badge
                            variant={
                              coverage.status === "Active"
                                ? "default"
                                : "destructive"
                            }
                            className={
                              coverage.status === "Active"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : ""
                            }
                          >
                            {coverage.status}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              Coverage:
                            </span>
                            <div className="flex items-center">
                              <span className="font-semibold">
                                {coverage.amount}
                              </span>
                              <div className="w-4 h-4 relative mx-1">
                                <Image
                                  src="/pyusd.svg"
                                  alt="PYUSD"
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <span className="text-sm font-medium">PYUSD</span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600">
                              Premium:
                            </span>
                            <div className="flex items-center">
                              <span className="font-semibold">
                                {coverage.premium}
                              </span>
                              <div className="w-4 h-4 relative mx-1">
                                <Image
                                  src="/pyusd.svg"
                                  alt="PYUSD"
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <span className="text-sm font-medium">PYUSD</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            Expires: {coverage.expiry}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-gray-50"
                        onClick={handleCoverageNavigation}
                      >
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
              <Button
                className="bg-green-600 hover:bg-green-700 shadow-sm"
                onClick={handleStakeNavigation}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Stake More
              </Button>
            </div>

            <div className="grid gap-4">
              {mockStaking.map((position) => (
                <Card
                  key={position.id}
                  className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="w-6 h-6 text-green-600" />
                          <h3 className="font-semibold text-lg">
                            {position.pool}
                          </h3>
                          <Badge
                            variant={
                              position.status === "Active"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              position.status === "Active"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-blue-100 text-blue-800 border-blue-200"
                            }
                          >
                            {position.status}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              Staked:
                            </span>
                            <div className="flex items-center">
                              <span className="font-semibold">
                                {position.staked}
                              </span>
                              <div className="w-4 h-4 relative mx-1">
                                <Image
                                  src="/pyusd.svg"
                                  alt="PYUSD"
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <span className="text-sm font-medium">PYUSD</span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600">
                              Rewards:
                            </span>
                            <div className="flex items-center">
                              <span className="font-semibold text-green-600">
                                {position.rewards}
                              </span>
                              <div className="w-4 h-4 relative mx-1">
                                <Image
                                  src="/pyusd.svg"
                                  alt="PYUSD"
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <span className="text-sm font-medium text-green-600">
                                PYUSD
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="text-sm text-gray-600">
                              APY:{" "}
                              <span className="font-semibold text-green-600">
                                {position.apy}
                              </span>
                            </p>
                            <p className="text-sm text-gray-600">
                              Lock:{" "}
                              <span className="font-medium">
                                {position.lockPeriod}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                          onClick={handleStakeNavigation}
                        >
                          Claim Rewards
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-gray-50"
                          onClick={handleStakeNavigation}
                        >
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
              {mockNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <notification.icon
                        className={`w-5 h-5 ${notification.iconColor} mt-0.5`}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {notification.timestamp}
                        </p>
                      </div>
                      {notification.type === "warning" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200"
                          onClick={handleCoverageNavigation}
                        >
                          Renew Coverage
                        </Button>
                      )}
                      {notification.type === "success" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                          onClick={handleStakeNavigation}
                        >
                          Claim Now
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
