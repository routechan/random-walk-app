"use client";

import { useEffect, useState } from "react";

// ダミーデータ（アニメーション用）
const dummyLocations = [
  "10分適当に歩いた場所で",
  "カフェで",
  "3駅先で降りて",
  "商店街で",
  "川沿いで",
  "線路沿いで",
  "神社に行って",
  "コンビニで",
];

const dummyActions = [
  "写真を撮ろう",
  "100円のものを買おう",
  "深呼吸しよう",
  "人と話そう",
  "空を見上よう",
  "5分座って休もう",
  "物を買おう",
  "猫を探おう",
];

interface RouletteAnimationProps {
  isAnimating?: boolean;
}

export default function RouletteAnimation({
  isAnimating = true,
}: RouletteAnimationProps) {
  const [locationIndex, setLocationIndex] = useState(0);
  const [actionIndex, setActionIndex] = useState(0);

  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setLocationIndex((prev) => (prev + 1) % dummyLocations.length);
      setActionIndex((prev) => (prev + 1) % dummyActions.length);
    }, 50);

    return () => clearInterval(interval);
  }, [isAnimating]);

  return (
    <div className="space-y-4">
      {/* どこで カード */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-xl border-4 border-green-400">
        <p className="text-sm font-bold text-green-600 mb-2">どこで?</p>
        <p
          className={`text-2xl md:text-3xl font-bold text-gray-800 ${
            isAnimating ? "animate-pulse" : ""
          }`}
        >
          {dummyLocations[locationIndex]}
        </p>
      </div>

      {/* なにをする カード */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-xl border-4 border-orange-400">
        <p className="text-sm font-bold text-orange-500 mb-2">なにをする?</p>
        <p
          className={`text-2xl md:text-3xl font-bold text-gray-800 ${
            isAnimating ? "animate-pulse" : ""
          }`}
        >
          {dummyActions[actionIndex]}
        </p>
      </div>

      {isAnimating && (
        <div className="flex items-center justify-center gap-2 text-white/90 pt-2">
          <span className="animate-bounce text-2xl">🚶</span>
          <p className="text-sm font-medium">ルーレット中...</p>
          <span
            className="animate-bounce text-2xl"
            style={{ animationDelay: "0.2s" }}
          >
            🚶
          </span>
        </div>
      )}
    </div>
  );
}
