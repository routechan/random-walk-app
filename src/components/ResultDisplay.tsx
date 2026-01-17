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
    <div className="space-y-6 animate-bounceIn">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
        今日の散歩は...
      </h2>

      {/* どこで カード */}
      <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-pink-500 transform transition-transform hover:scale-105">
        <p className="text-sm font-bold text-pink-500 mb-2">どこで?</p>
        <p className="text-3xl font-bold text-gray-800">{location}</p>
      </div>

      {/* なにをする カード */}
      <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-orange-400 transform transition-transform hover:scale-105">
        <p className="text-sm font-bold text-orange-400 mb-2">なにをする?</p>
        <p className="text-3xl font-bold text-gray-800">{action}</p>
      </div>

      {/* 再生成ボタン */}
      <button
        onClick={onRegenerate}
        className="mt-8 w-full max-w-sm h-14 rounded-full
                   bg-gradient-to-br from-purple-600 to-purple-800
                   text-white font-bold text-lg shadow-lg
                   hover:brightness-110 active:scale-95
                   transition-all duration-300 mx-auto"
        style={{
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
        }}
      >
        もう一度生成する
      </button>
    </div>
  )
}
