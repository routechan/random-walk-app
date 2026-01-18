import type { Metadata, Viewport } from "next";
import { Zen_Maru_Gothic, Dela_Gothic_One } from "next/font/google";
import "@/styles/globals.css";

const zenMaruGothic = Zen_Maru_Gothic({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-zen-maru",
});

const delaGothicOne = Dela_Gothic_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dela-gothic",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sanpo-roulette.vercel.app"),
  title: "さんぽルーレット",
  description:
    "マンネリ化したおさんぽに新しい刺激を与えてくれます。ルーレットでランダムに生成される「どこで」、「なにをする」にしたがってさんぽをしてみましょう。",
  keywords: ["散歩", "ルーレット", "ランダム", "おでかけ", "アプリ"],
  openGraph: {
    title: "さんぽルーレット",
    description: "どこで何をするか、ルーレットで決めよう",
    type: "website",
    images: ["/images/sanpo_ogp.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/sanpo_ogp.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body
        className={`${zenMaruGothic.variable} ${delaGothicOne.variable} ${zenMaruGothic.className}`}
      >
        {children}
      </body>
    </html>
  );
}
