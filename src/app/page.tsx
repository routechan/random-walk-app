import RandomWalkClient from "@/components/RandomWalkClient";

// 太陽コンポーネント
function Sun() {
  return (
    <div className="absolute -top-16 right-4 md:-top-24 md:right-8">
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

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden relative">
      <div className="w-full max-w-md mx-auto text-center relative z-10">
        <Sun />

        {/* タイトル */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-dela text-white drop-shadow-lg mb-3">
            さんぽルーレット
          </h1>
          <p className="text-white/80 text-sm md:text-base">
            どこで何をするか、ルーレットで決めよう
          </p>
        </div>

        <RandomWalkClient />
      </div>
    </main>
  );
}
