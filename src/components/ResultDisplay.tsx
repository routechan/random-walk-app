interface ResultDisplayProps {
  location: string
  action: string
  onRegenerate: () => void
}

export default function ResultDisplay({
  location,
  action,
  onRegenerate,
}: ResultDisplayProps) {
  return (
    <div className="space-y-6 animate-bounceIn pt-16">
      <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg mb-8">
        今日の散歩は...
      </h2>

      {/* どこで カード */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-4 border-green-400 transform transition-transform hover:scale-105">
        <p className="text-sm font-bold text-green-600 mb-2">どこで?</p>
        <p className="text-2xl md:text-3xl font-bold text-gray-800">{location}</p>
      </div>

      {/* なにをする カード */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-4 border-orange-400 transform transition-transform hover:scale-105">
        <p className="text-sm font-bold text-orange-500 mb-2">なにをする?</p>
        <p className="text-2xl md:text-3xl font-bold text-gray-800">{action}</p>
      </div>

      {/* 再生成ボタン */}
      <button
        onClick={onRegenerate}
        className="mt-8 w-full max-w-sm h-14 rounded-full
                   bg-gradient-to-br from-green-400 to-green-600
                   text-white font-bold text-lg shadow-xl
                   hover:scale-105 active:scale-95
                   transition-all duration-300 mx-auto block
                   border-4 border-green-300"
        style={{
          boxShadow: '0 6px 20px rgba(76, 175, 80, 0.5)',
        }}
      >
        散歩開始！
      </button>
    </div>
  )
}
