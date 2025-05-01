'use client';

import React, { useEffect, useState } from 'react';
import { isInFrameContext, setFrameReady } from '../services/frameService';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Function to handle initializing the frame
    const initializeFrame = async () => {
      try {
        // Wait for all critical UI elements to load
        // This ensures the UI is ready before showing it to users
        await new Promise(resolve => {
          // Check if document is loaded, and if not wait for it
          if (document.readyState === 'complete') {
            resolve(true);
          } else {
            window.addEventListener('load', () => resolve(true), { once: true });
          }
        });
        
        // Add a small delay to ensure all React components are rendered
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Call frame ready to tell Farcaster the UI is ready
        const readyResult = await setFrameReady();
        console.log('Frame ready result:', readyResult);
        
        // Hide our splash screen
        setIsVisible(false);
      } catch (error) {
        console.error('Error initializing frame:', error);
        // Still hide splash screen after a timeout in case of errors
        setTimeout(() => setIsVisible(false), 2000);
      }
    };

    // Initialize based on context
    if (isInFrameContext()) {
      console.log('Running in Farcaster frame context');
      initializeFrame();
    } else {
      console.log('Running in browser context');
      // In non-frame context (regular browser), still initialize but with shorter timeout
      initializeFrame();
    }
    
    // Fallback - hide splash after max timeout regardless of what happens
    const fallbackTimeout = setTimeout(() => {
      console.log('Fallback timeout reached, hiding splash screen');
      setIsVisible(false);
    }, 5000); // 5 second max timeout
    
    return () => clearTimeout(fallbackTimeout);
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