"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SuccessAnimation } from "@/components/success-animation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SuccessAnimationDemo() {
  const [showAnimation, setShowAnimation] = useState(false);
  const [transactionType, setTransactionType] = useState<"coverage" | "claim" | "vote" | "approval" | "general">("general");
  const [transactionHash, setTransactionHash] = useState("");

  const handleShowAnimation = (type: typeof transactionType) => {
    setTransactionType(type);
    setTransactionHash("0x" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    setShowAnimation(true);
  };

  const handleAnimationComplete = () => {
    setShowAnimation(false);
    console.log("Success animation completed!");
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Success Animation Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Test the success animation with different transaction types. Each button will show a different success message.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handleShowAnimation("coverage")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Test Coverage Success
            </Button>
            
            <Button
              onClick={() => handleShowAnimation("claim")}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Test Claim Success
            </Button>
            
            <Button
              onClick={() => handleShowAnimation("vote")}
              className="bg-green-600 hover:bg-green-700"
            >
              Test Vote Success
            </Button>
            
            <Button
              onClick={() => handleShowAnimation("approval")}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Test Approval Success
            </Button>
            
            <Button
              onClick={() => handleShowAnimation("general")}
              className="bg-gray-600 hover:bg-gray-700"
            >
              Test General Success
            </Button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Current State:</h3>
            <p className="text-sm text-gray-600">
              Animation Visible: {showAnimation ? "Yes" : "No"}
            </p>
            <p className="text-sm text-gray-600">
              Transaction Type: {transactionType}
            </p>
            <p className="text-sm text-gray-600">
              Transaction Hash: {transactionHash || "None"}
            </p>
          </div>
        </CardContent>
      </Card>

      <SuccessAnimation
        isVisible={showAnimation}
        onComplete={handleAnimationComplete}
        transactionHash={transactionHash}
        transactionType={transactionType}
      />
    </div>
  );
}
