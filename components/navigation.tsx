"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Shield, Vote, FileText, Coins, BarChart3 } from "lucide-react";
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";

const navItems = [
  { name: "Marketplace", href: "/marketplace", icon: Shield },
  { name: "Stake", href: "/stake", icon: Coins },
  { name: "Claims", href: "/claims", icon: FileText },
  { name: "Governance", href: "/governance", icon: Vote },
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-cyan-600 flex-shrink-0" />
            <Link
              href="/"
              className="text-xl font-bold text-foreground hover:text-cyan-600 transition-colors"
            >
              DeFi Guardians
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center flex-1 max-w-2xl mx-8">
            <div className="flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 py-2 px-1 border-b-2 border-transparent hover:border-cyan-600/50"
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden lg:flex items-center gap-4">
            <ConnectWalletButton />
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 sm:w-96">
              <div className="flex flex-col h-full">
                {/* Mobile Logo */}
                <div className="flex items-center gap-3 mb-8 pt-4">
                  <Shield className="h-8 w-8 text-cyan-600" />
                  <span className="text-xl font-bold text-foreground">
                    DeFi Guardians
                  </span>
                </div>

                {/* Mobile Navigation Items */}
                <nav className="flex-1">
                  <div className="flex flex-col gap-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center gap-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 py-3 px-4 rounded-lg hover:bg-accent/50"
                        onClick={() => setIsOpen(false)}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </nav>

                {/* Mobile Wallet Section */}
                <div className="pt-6 border-t border-border/40">
                  <ConnectWalletButton />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Mobile Wallet Button */}
          <div className="lg:hidden">
            <ConnectWalletButton />
          </div>
        </div>
      </div>
    </header>
  );
}
