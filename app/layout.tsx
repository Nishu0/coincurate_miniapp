import './theme.css';
import '@coinbase/onchainkit/styles.css';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Coin Curate',
  description: 'Discover the best content coins by community health',
  openGraph: {
    title: 'Coin Curate',
    description: 'Discover the best content coins by community health',
    images: ['https://res.cloudinary.com/dyk5s8gbw/image/upload/v1746142963/sryaxse2cojomtj7wxyj.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Create the frame embed data for sharing
  const frameEmbed = {
    version: "next",
    imageUrl: "https://res.cloudinary.com/dyk5s8gbw/image/upload/v1746142963/sryaxse2cojomtj7wxyj.png",
    button: {
      title: "Discover Content Coins",
      action: {
        type: "launch_frame",
        url: "https://coin-curate.xyz", // Replace with your actual URL
        name: "Coin Curate",
        splashImageUrl: "https://res.cloudinary.com/dyk5s8gbw/image/upload/v1746142963/sryaxse2cojomtj7wxyj.png",
        splashBackgroundColor: "#000000"
      }
    }
  }

  return (
    <html lang="en">
      <head>
        {/* Farcaster Frame meta tag */}
        <meta name="fc:frame" content={JSON.stringify(frameEmbed)} />
      </head>
      <body className="bg-gray-950">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
