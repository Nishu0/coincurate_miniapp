'use client';

import React, { useEffect, useState } from 'react';
import { isInFrameContext, setFrameReady } from '../services/frameService';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const initializeFrame = async () => {
      // Wait a bit to show the splash screen to users
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Call the ready function to hide the splash screen
      await setFrameReady();
      
      // Hide our splash screen component
      setIsVisible(false);
    };

    // Only initialize if we're in a frame context, otherwise hide after a shorter delay
    if (isInFrameContext()) {
      initializeFrame();
    } else {
      // In non-frame context, show splash briefly for demo purposes
      setTimeout(() => setIsVisible(false), 1000);
    }
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-black"
      style={{ backgroundColor: '#000000' }}
    >
      <img
        src="https://res.cloudinary.com/dyk5s8gbw/image/upload/v1746142963/sryaxse2cojomtj7wxyj.png"
        alt="Coin Curate"
        className="w-24 h-24 mb-4 rounded-full"
      />
      <div className="text-white text-xl font-bold mb-4">
        🔎 Coin Community Finder 🔎
      </div>
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
    </div>
  );
} 