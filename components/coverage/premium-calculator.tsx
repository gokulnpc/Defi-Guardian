"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Calculator, Wallet } from "lucide-react"

interface PremiumCalculatorProps {
  protocolId: string
}

export function PremiumCalculator({ protocolId }: PremiumCalculatorProps) {
  const [coverageAmount, setCoverageAmount] = useState("")
  const [duration, setDuration] = useState("")

  // Mock premium calculation
  const calculatePremium = () => {
    const amount = Number.parseFloat(coverageAmount) || 0
    const days = Number.parseInt(duration) || 30
    const baseRate = 0.025 // 2.5% annual
    return ((amount * baseRate * days) / 365).toFixed(2)
  }

  const premium = calculatePremium()

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Premium Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="coverage-amount">Coverage Amount</Label>
          <div className="relative">
            <Input
              id="coverage-amount"
              placeholder="10,000"
              value={coverageAmount}
              onChange={(e) => setCoverageAmount(e.target.value)}
              className="pr-16"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
              PYUSD
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Coverage Duration</Label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="180">180 days</SelectItem>
              <SelectItem value="365">1 year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Coverage Amount:</span>
            <span>{coverageAmount || "0"} PYUSD</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Duration:</span>
            <span>{duration || "0"} days</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Premium Rate:</span>
            <span>2.5% APR</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total Premium:</span>
            <span className="text-primary">{premium} PYUSD</span>
          </div>
        </div>

        <Button className="w-full" size="lg" disabled={!coverageAmount || !duration}>
          <Wallet className="h-4 w-4 mr-2" />
          Buy Coverage
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Coverage starts after 24h cooldown period</p>
          <p>• Claims processed via Hedera governance</p>
          <p>• Payouts in PYUSD on selected network</p>
        </div>
      </CardContent>
    </Card>
  )
}
