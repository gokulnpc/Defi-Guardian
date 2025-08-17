"use client";

import { useState } from "react";
import { SimplifiedCoverageWidget } from "@/components/simplified-coverage-widget";
import { CryptoBackground } from "@/components/crypto-background";
import UserDashboardWidget from "@/components/user-dashboard-widget";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, TrendingUp, FileText } from "lucide-react";
import Image from "next/image";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"coverage" | "stake" | "claim">(
    "coverage"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50 relative">
      <CryptoBackground />

      <main className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Secure Your DeFi Investments{" "}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Protect against smart contract risks, governance attacks, and
            protocol failures across multiple blockchains.
          </p>
        </div>

        {/* Unified Tab System */}
        <div className="max-w-6xl mx-auto mb-8">
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "coverage" | "stake" | "claim")
            }
            className="w-full"
          >
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 h-14 bg-gray-100 p-1 rounded-xl">
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
          </Tabs>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch">
          {/* Coverage Widget - Takes 2/3 of the space */}
          <div className="lg:col-span-2">
            <SimplifiedCoverageWidget activeTab={activeTab} />
          </div>

          {/* Dashboard Widget - Takes 1/3 of the space */}
          <div className="lg:col-span-1">
            <UserDashboardWidget activeTab={activeTab} />
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="flex items-center justify-center space-x-1 text-gray-500 text-sm">
            <span>
              Coverage starts after 24h cooldown • Claims processed via Hedera
              governance • Payouts in
            </span>
            <div className="w-4 h-4 relative mx-1">
              <Image
                src="/pyusd.svg"
                alt="PYUSD"
                fill
                className="object-contain"
              />
            </div>
            <span>PYUSD</span>
          </div>
        </div>
      </main>
    </div>
  );
}
