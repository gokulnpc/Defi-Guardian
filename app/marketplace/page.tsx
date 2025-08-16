import { MarketplaceHeader } from "@/components/marketplace/marketplace-header"
import { ProtocolGrid } from "@/components/marketplace/protocol-grid"

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <MarketplaceHeader />
        <ProtocolGrid />
      </main>
    </div>
  )
}
