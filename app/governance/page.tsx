"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Vote, Clock, CheckCircle, Users, Gavel } from "lucide-react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useContractInteraction } from "@/hooks/use-contract-interaction";
import { useToast } from "@/hooks/use-toast";
import { SuccessAnimation } from "@/components/success-animation";

const activeProposals = [
  {
    id: "PROP-001",
    title: "Claim CLM-003: Compound V3 Liquidation Failure",
    description: "Review claim for 15,000 PYUSD due to liquidation bot failure",
    votesFor: 45,
    votesAgainst: 25,
    quorum: 70,
    timeLeft: "2 days",
    status: "Active",
  },
  {
    id: "PROP-002",
    title: "Update Risk Parameters for Aave V3",
    description: "Adjust premium rates based on recent protocol updates",
    votesFor: 62,
    votesAgainst: 18,
    quorum: 80,
    timeLeft: "5 days",
    status: "Active",
  },
];

const completedProposals = [
  {
    id: "PROP-000",
    title: "Claim CLM-002: Uniswap Oracle Manipulation",
    result: "Approved",
    votesFor: 78,
    votesAgainst: 22,
    executed: "2024-01-12",
  },
];

export default function GovernancePage() {
  const [votingStates, setVotingStates] = useState<
    Record<string, { for: boolean; against: boolean }>
  >({});
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successTransactionHash, setSuccessTransactionHash] = useState("");
  const [successTransactionType, setSuccessTransactionType] = useState<
    "vote" | "general"
  >("general");

  const { user } = useDynamicContext();
  const { toast } = useToast();
  const { voteOnClaim } = useContractInteraction();

  const handleVote = async (proposalId: string, support: boolean) => {
    if (!user) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to vote",
        variant: "destructive",
      });
      return;
    }

    // Extract claim ID from proposal ID (assuming format "PROP-001" maps to claim ID 1)
    const claimId = BigInt(parseInt(proposalId.split("-")[1]));

    // Set loading state for specific vote type
    setVotingStates({
      ...votingStates,
      [proposalId]: {
        for: support ? true : votingStates[proposalId]?.for || false,
        against: !support ? true : votingStates[proposalId]?.against || false,
      },
    });

    try {
      const success = await voteOnClaim(claimId, support, (hash: string) => {
        setSuccessTransactionHash(hash);
        setSuccessTransactionType("vote");
        setShowSuccessAnimation(true);
      });

      if (success) {
        toast({
          title: `Vote ${support ? "For" : "Against"} submitted! 🗳️`,
          description: `Your vote has been recorded on the blockchain`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Voting Failed",
        description:
          "There was an error submitting your vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Clear loading state for specific vote type
      setVotingStates({
        ...votingStates,
        [proposalId]: {
          for: support ? false : votingStates[proposalId]?.for || false,
          against: !support
            ? false
            : votingStates[proposalId]?.against || false,
        },
      });
    }
  };

  const handleSuccessAnimationComplete = () => {
    setShowSuccessAnimation(false);
    setSuccessTransactionHash("");
    setSuccessTransactionType("general");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SuccessAnimation
        isVisible={showSuccessAnimation}
        onComplete={handleSuccessAnimationComplete}
        transactionHash={successTransactionHash}
        transactionType={successTransactionType}
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Governance</h1>
        <p className="text-gray-600">Participate in DAO voting on Hedera</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Your Voting Power
            </CardTitle>
            <Vote className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25,000</div>
            <p className="text-xs text-gray-600">gTokens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Proposals
            </CardTitle>
            <Gavel className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-gray-600">Awaiting votes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Participation Rate
            </CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-gray-600">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active Votes</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Active Proposals</h3>
            <Badge variant="outline">
              <Clock className="w-3 h-3 mr-1" />2 Active
            </Badge>
          </div>

          <div className="space-y-4">
            {activeProposals.map((proposal) => (
              <Card key={proposal.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{proposal.title}</h4>
                          <Badge variant="secondary">{proposal.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {proposal.description}
                        </p>
                        <p className="text-sm text-gray-600">
                          Time left: {proposal.timeLeft}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>For: {proposal.votesFor}%</span>
                        <span>Against: {proposal.votesAgainst}%</span>
                        <span>Quorum: {proposal.quorum}%</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>For</span>
                          <span>{proposal.votesFor}%</span>
                        </div>
                        <Progress value={proposal.votesFor} className="h-2" />

                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Against</span>
                          <span>{proposal.votesAgainst}%</span>
                        </div>
                        <Progress
                          value={proposal.votesAgainst}
                          className="h-2 bg-red-100"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      {user ? (
                        <>
                          <Button
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                            disabled={votingStates[proposal.id]?.for || false}
                            onClick={() => handleVote(proposal.id, true)}
                          >
                            {votingStates[proposal.id]?.for ? (
                              <>
                                <div className="w-3 h-3 mr-1 border border-white border-t-transparent rounded-full animate-spin" />
                                Voting...
                              </>
                            ) : (
                              "Vote For"
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={
                              votingStates[proposal.id]?.against || false
                            }
                            onClick={() => handleVote(proposal.id, false)}
                          >
                            {votingStates[proposal.id]?.against ? (
                              <>
                                <div className="w-3 h-3 mr-1 border border-white border-t-transparent rounded-full animate-spin" />
                                Voting...
                              </>
                            ) : (
                              "Vote Against"
                            )}
                          </Button>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">
                          Connect wallet to vote
                        </div>
                      )}
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <h3 className="text-lg font-semibold">Completed Proposals</h3>

          <div className="space-y-4">
            {completedProposals.map((proposal) => (
              <Card key={proposal.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{proposal.title}</h4>
                        <Badge
                          variant={
                            proposal.result === "Approved"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {proposal.result}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        For: {proposal.votesFor}% • Against:{" "}
                        {proposal.votesAgainst}%
                      </p>
                      <p className="text-sm text-gray-600">
                        Executed: {proposal.executed}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <Button variant="outline" size="sm">
                        View on Hashscan
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="parameters" className="space-y-4">
          <h3 className="text-lg font-semibold">DAO Parameters</h3>
          <p className="text-gray-600">
            Current governance settings (read-only)
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Voting Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Quorum Threshold
                  </span>
                  <span className="font-medium">60%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Approval Threshold
                  </span>
                  <span className="font-medium">50%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Voting Period</span>
                  <span className="font-medium">7 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Execution Delay</span>
                  <span className="font-medium">24 hours</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Token Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total gTokens</span>
                  <span className="font-medium">2,400,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Circulating Supply
                  </span>
                  <span className="font-medium">1,850,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Min Proposal Stake
                  </span>
                  <span className="font-medium">10,000 gTokens</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Delegation Rate</span>
                  <span className="font-medium">45%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
