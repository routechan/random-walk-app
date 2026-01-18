"use client";

import { useState } from "react";
import RandomButton from "@/components/RandomButton";
import RouletteAnimation from "@/components/RouletteAnimation";
import ResultDisplay from "@/components/ResultDisplay";
import type { AppState, Result } from "@/types";
import { getRandomWalk } from "@/lib/actions";

// 雲コンポーネント
function Cloud({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute ${className}`}>
      <div className="flex">
        <div className="w-8 h-6 bg-white rounded-full" />
        <div className="w-12 h-10 bg-white rounded-full -ml-3 -mt-2" />
        <div className="w-10 h-7 bg-white rounded-full -ml-4 mt-1" />
      </div>
    </div>
  );
}

// 太陽コンポーネント
function Sun() {
  return (
    <div className="absolute -top-16 right-4 md:-top-20 md:right-8">
      <div
        className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-yellow-300"
        style={{
          boxShadow:
            "0 0 40px rgba(255, 235, 59, 0.8), 0 0 80px rgba(255, 235, 59, 0.4)",
        }}
      />
    </div>
  );
}

export default function RandomWalkClient() {
  const [state, setState] = useState<AppState>("idle");
  const [result, setResult] = useState<Result | null>(null);

  const handleGenerate = async () => {
    setState("animating");

    try {
      const response = await getRandomWalk();

      if (!response.success || !response.data) {
        throw new Error(response.error || "データの取得に失敗しました");
      }

      setTimeout(() => {
        setResult({
          location: response.data.location.text,
          action: response.data.action.text,
        });
        setState("result");
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      setState("idle");
      alert("エラーが発生しました。もう一度お試しください。");
    }
  };

  return (
    <div className="relative">
      {/* 雲 */}
      <Cloud className="cloud top-0 left-4 md:left-10 opacity-90" />
      <Cloud className="cloud-slow top-8 right-0 md:right-16 opacity-80 scale-75" />

      {/* 太陽 */}
      <Sun />

      {(state === "idle" || state === "animating") && (
        <div className="space-y-6 pt-16">
          {/* ルーレット表示（アニメーション中のみ表示） */}
          {state === "animating" && <RouletteAnimation isAnimating={true} />}

          {/* 初回の空カード表示 */}
          {state === "idle" && (
            <div className="space-y-6">
              {/* どこで カード（空） */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-4 border-green-400">
                <p className="text-sm font-bold text-green-600 mb-2">どこで?</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-300">
                  ???
                </p>
              </div>

              {/* なにをする カード（空） */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-4 border-orange-400">
                <p className="text-sm font-bold text-orange-500 mb-2">
                  なにをする?
                </p>
                <p className="text-2xl md:text-3xl font-bold text-gray-300">
                  ???
                </p>
              </div>
            </div>
          )}

          {/* ボタン */}
          <div className="pt-4 flex justify-center">
            <RandomButton
              onClick={handleGenerate}
              disabled={state === "animating"}
            />
          </div>
        </div>
      )}

      {state === "result" && result && (
        <ResultDisplay
          location={result.location}
          action={result.action}
          onRegenerate={handleGenerate}
        />
      )}
    </div>
  );
}
