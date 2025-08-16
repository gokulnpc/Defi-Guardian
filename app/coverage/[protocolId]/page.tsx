import { CoverageHeader } from "@/components/coverage/coverage-header";
import { PremiumCalculator } from "@/components/coverage/premium-calculator";
import { ProtocolInfo } from "@/components/coverage/protocol-info";

interface CoveragePageProps {
  params: {
    protocolId: string;
  };
}

export default function CoveragePage({ params }: CoveragePageProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8">
        <CoverageHeader protocolId={params.protocolId} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <ProtocolInfo protocolId={params.protocolId} />
          </div>
          <div>
            <PremiumCalculator protocolId={params.protocolId} />
          </div>
        </div>
      </main>
    </div>
  );
}
