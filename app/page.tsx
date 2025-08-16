import { SimplifiedCoverageWidget } from "@/components/simplified-coverage-widget";
import { CryptoBackground } from "@/components/crypto-background";

export default function HomePage() {
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

        <SimplifiedCoverageWidget />

        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm">
            Coverage starts after 24h cooldown • Claims processed via Hedera
            governance • Payouts in PYUSD
          </p>
        </div>
      </main>
    </div>
  );
}
