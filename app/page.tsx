"use client";

import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
} from "@coinbase/onchainkit/minikit";
import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { useEffect, useState, useCallback } from "react";
import { Button, Icon } from "./components/DemoComponents";
import { Feed, FeedSortOption } from "./components/Feed";
import { Leaderboard, LeaderboardType } from "./components/Leaderboard";

export default function CoinCurate() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"feed" | "leaderboard">("feed");
  const [feedSort, setFeedSort] = useState<FeedSortOption>("recent");
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>("content");

  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const saveFrameButton = (context && !context.client.added) ? (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleAddFrame}
      className="text-[var(--app-accent)] p-4"
      icon={<Icon name="plus" size="sm" />}
    >
      Save Frame
    </Button>
  ) : frameAdded ? (
    <div className="flex items-center space-x-1 text-sm font-medium text-[#0052FF] animate-fade-out">
      <Icon name="check" size="sm" className="text-[#0052FF]" />
      <span>Saved</span>
    </div>
  ) : null;

  return (
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
      <div className="w-full max-w-md mx-auto px-4 py-3">
        <header className="flex justify-between items-center mb-3 h-11">
          <div>
            <div className="flex items-center space-x-2">
              <Wallet className="z-10">
                <ConnectWallet>
                  <Name className="text-inherit" />
                </ConnectWallet>
                <WalletDropdown>
                  <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                    <Avatar />
                    <Name />
                    <Address />
                    <EthBalance />
                  </Identity>
                  <WalletDropdownDisconnect />
                </WalletDropdown>
              </Wallet>
            </div>
          </div>
          <div>{saveFrameButton}</div>
        </header>

        <main className="flex-1">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-center mb-1">Coin Curate</h1>
            <p className="text-center text-[var(--app-foreground-muted)] text-sm">
              Boost content with your content coins
            </p>
          </div>

          <div className="flex justify-center mb-4">
            <div className="flex space-x-2 p-1 bg-[var(--app-gray)] rounded-lg">
              <Button
                variant={activeTab === "feed" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("feed")}
                className={activeTab === "feed" ? "bg-[var(--app-background)]" : ""}
              >
                Feed
              </Button>
              <Button
                variant={activeTab === "leaderboard" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("leaderboard")}
                className={activeTab === "leaderboard" ? "bg-[var(--app-background)]" : ""}
              >
                Leaderboard
              </Button>
            </div>
          </div>

          {activeTab === "feed" && (
            <>
              <div className="flex justify-end mb-3">
                <div className="flex space-x-2 p-1 bg-[var(--app-gray)] rounded-lg">
                  <Button
                    variant={feedSort === "recent" ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setFeedSort("recent")}
                    className={feedSort === "recent" ? "bg-[var(--app-background)]" : ""}
                  >
                    Recent
                  </Button>
                  <Button
                    variant={feedSort === "popular" ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setFeedSort("popular")}
                    className={feedSort === "popular" ? "bg-[var(--app-background)]" : ""}
                  >
                    Popular
                  </Button>
                </div>
              </div>
              <Feed sortBy={feedSort} />
            </>
          )}

          {activeTab === "leaderboard" && (
            <>
              <div className="flex justify-center mb-3">
                <div className="flex space-x-2 p-1 bg-[var(--app-gray)] rounded-lg">
                  <Button
                    variant={leaderboardType === "content" ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setLeaderboardType("content")}
                    className={leaderboardType === "content" ? "bg-[var(--app-background)]" : ""}
                  >
                    Top Content
                  </Button>
                  <Button
                    variant={leaderboardType === "curators" ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setLeaderboardType("curators")}
                    className={leaderboardType === "curators" ? "bg-[var(--app-background)]" : ""}
                  >
                    Top Curators
                  </Button>
                </div>
              </div>
              <Leaderboard type={leaderboardType} />
            </>
          )}
        </main>

        <footer className="mt-6 pt-4 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-[var(--ock-text-foreground-muted)] text-xs"
            onClick={() => openUrl("https://base.org/builders/minikit")}
          >
            Built on Base with MiniKit
          </Button>
        </footer>
      </div>
    </div>
  );
}
