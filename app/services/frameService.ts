'use client';

import { sdk } from '@farcaster/frame-sdk';

/**
 * This service provides functions for interacting with the Farcaster frame SDK
 * For this implementation, we'll use mock functions that simulate the SDK
 * In production, replace with actual SDK calls
 */

// Properly initialize the frame and set ready state when UI is loaded
export const setFrameReady = async (disableNativeGestures = false) => {
  try {
    // Call the actual SDK ready function
    await sdk.actions.ready({ disableNativeGestures });
    console.log('Frame ready called successfully');
    return true;
  } catch (error) {
    console.error('Error calling frame ready:', error);
    return false;
  }
};

// Add the frame to user's collection
export const addFrameToCollection = async () => {
  try {
    await sdk.actions.addFrame();
    console.log('Frame added successfully');
    return true;
  } catch (error) {
    console.error('Error adding frame:', error);
    return false;
  }
};

// Check if app is running in a Frame context
export const isInFrameContext = (): boolean => {
  try {
    // Check if window is defined (for SSR compatibility)
    if (typeof window === 'undefined') return false;
    
    // In Farcaster frames, the context property should be available
    return sdk.context !== undefined;
  } catch (error) {
    console.error('Error checking frame context:', error);
    return false;
  }
};

// Other frame-related functions can be added here 