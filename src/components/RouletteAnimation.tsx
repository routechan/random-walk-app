"use client";

import { useEffect, useState } from "react";

// ダミーデータ（アニメーション用）
const dummyLocations = [
  "近くの公園で",
  "カフェで",
  "駅前で",
  "商店街で",
  "川沿いで",
  "橋の上で",
  "神社で",
  "コンビニで",
];

const dummyActions = [
  "写真を撮る",
  "コーヒーを飲む",
  "深呼吸する",
  "人と話す",
  "空を見上げる",
  "5分座って休む",
  "物を買う",
  "猫を探す",
];

export default function RouletteAnimation() {
  const [locationIndex, setLocationIndex] = useState(0);
  const [actionIndex, setActionIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLocationIndex((prev) => (prev + 1) % dummyLocations.length);
      setActionIndex((prev) => (prev + 1) % dummyActions.length);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
        今日の散歩は...
      </h2>

      {/* どこで カード */}
      <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-pink-500">
        <p className="text-sm font-bold text-pink-500 mb-2">どこで?</p>
        <p className="text-3xl font-bold text-gray-800 animate-pulse">
          {dummyLocations[locationIndex]}
        </p>
      </div>

      {/* なにをする カード */}
      <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-orange-400">
        <p className="text-sm font-bold text-orange-400 mb-2">なにをする?</p>
        <p className="text-3xl font-bold text-gray-800 animate-pulse">
          {dummyActions[actionIndex]}
        </p>
      </div>

      <p className="text-sm text-gray-500 animate-pulse">ルーレット中...</p>
    </div>
  );
}
