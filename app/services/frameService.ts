'use client';

/**
 * This service provides functions for interacting with the Farcaster frame SDK
 * For this implementation, we'll use mock functions that simulate the SDK
 * In production, replace with actual SDK calls
 */

// Mock function to simulate SDK ready call
export const setFrameReady = (disableNativeGestures = false) => {
  // In real implementation, use:
  // import { sdk } from '@farcaster/frame-sdk'
  // await sdk.actions.ready({ disableNativeGestures });
  
  console.log('Frame ready called with disableNativeGestures:', disableNativeGestures);
  
  // Return a promise that resolves after a short delay
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, 100);
  });
};

// Check if app is running in a Frame context
export const isInFrameContext = (): boolean => {
  // In real implementation, check for Frame context
  // For mockup, check if window is defined and look for a frame query param
  if (typeof window !== 'undefined') {
    return window.location.search.includes('frame=true');
  }
  return false;
};

// Other frame-related functions can be added here 