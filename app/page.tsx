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
import { useAccount } from 'wagmi';
import { TabGroup } from './components/TabGroup';
import { GameCreation } from './components/GameCreation';
import { GameLobby } from './components/GameLobby';
import SplashScreen from './components/SplashScreen';

// Simple Button component
interface ButtonProps {
  variant?: 'primary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

function Button({ 
  variant = 'primary', 
  size = 'sm', 
  onClick, 
  className = '',
  children,
  icon
}: ButtonProps) {
  const baseClasses = 'font-medium transition-colors duration-200';
  const variantClasses = {
    primary: 'bg-[var(--app-accent)] hover:bg-[var(--app-accent-dark)] text-white',
    ghost: 'bg-transparent hover:bg-[var(--app-gray)] text-[var(--app-foreground)]'
  };
  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      <div className="flex items-center">
        {icon}
        {children}
      </div>
    </button>
  );
}

// Simple Icon component
interface IconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function Icon({ name, size = 'md', className = '' }: IconProps) {
  const sizeValues = {
    sm: 16,
    md: 20,
    lg: 24
  };
  
  const getIconPath = (iconName: string) => {
    switch (iconName) {
      case 'plus':
        return (
          <svg width={sizeValues[size]} height={sizeValues[size]} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'check':
        return (
          <svg width={sizeValues[size]} height={sizeValues[size]} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return getIconPath(name);
}

export default function CoinCurate() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'games' | 'create' | 'coins'>('games');
  
  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();

  useEffect(() => {
    if (isFrameReady && !frameAdded) {
      setFrameReady();
      setFrameAdded(true);
    }
  }, [isFrameReady, frameAdded, setFrameReady]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const saveFrameButton = (context && !context.client.added) ? (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleAddFrame}
      className="text-[var(--app-accent)] p-3 rounded-full border border-[var(--app-gray)] hover:border-[var(--app-accent)] transition-colors"
      icon={<Icon name="plus" size="sm" />}
    >
      Save Frame
    </Button>
  ) : frameAdded ? (
    <div className="flex items-center space-x-1 text-sm font-medium text-[#0052FF] animate-fade-out px-3 py-2">
      <Icon name="check" size="sm" className="text-[#0052FF]" />
      <span>Saved</span>
    </div>
  ) : null;

  return (
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme">
      <SplashScreen />
      <div className="w-full max-w-md mx-auto px-4 py-3">
        <header className="flex justify-between items-center mb-6 h-11">
          <div>
            <div className="flex items-center space-x-2">
              <Wallet className="z-10">
                <ConnectWallet>
                  <Button 
                    variant={isConnected ? "ghost" : "primary"} 
                    size="sm" 
                    className={`rounded-full hover:opacity-90 transition-opacity ${isConnected ? 'text-green-500 border border-green-500' : ''}`}
                  >
                    <span className="flex items-center">
                      {isConnected ? (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1.5">
                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Connected
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1.5">
                            <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                            <path d="M17 9V9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M8 13H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          Connect
                        </>
                      )}
                    </span>
                  </Button>
                </ConnectWallet>
                <WalletDropdown>
                  <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                    <Avatar className="border-2 border-[var(--app-gray)]" />
                    <Name className="font-semibold" />
                    <Address className="text-sm" />
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-center mb-2 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 text-[var(--app-accent)]">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2"/>
                <path d="M12 17V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 7H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Token Games
            </h1>
            <p className="text-center text-[var(--app-foreground-muted)] text-sm max-w-xs mx-auto">
              Play games with token stakes and earn rewards
            </p>
          </div>

          {/* Tab navigation */}
          <div className="mb-6">
            <TabGroup
              tabs={[
                { id: 'games', label: 'Game Lobby' },
                { id: 'create', label: 'Create Game' },
                { id: 'coins', label: 'Discover Coins' },
              ]}
              activeTab={activeTab}
              onChange={(tab) => setActiveTab(tab as 'games' | 'create' | 'coins')}
            />
          </div>

          {/* Main content based on active tab */}
          <div>
            {activeTab === 'games' && <GameLobby />}
            {activeTab === 'create' && <GameCreation />}
          </div>
        </main>

        <footer className="mt-8 pt-4 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-[var(--app-foreground-muted)] text-xs hover:text-[var(--app-foreground)] transition-colors"
            onClick={() => openUrl("https://base.org/builders/minikit")}
          >
            <span className="flex items-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1.5">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1"/>
                <path d="M7.5 12H16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 7.5V16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Built on Base with MiniKit
            </span>
          </Button>
        </footer>
      </div>
    </div>
  );
}
