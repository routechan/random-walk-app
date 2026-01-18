interface ResultDisplayProps {
  location: string;
  action: string;
}

export default function ResultDisplay({
  location,
  action,
}: ResultDisplayProps) {
  return (
    <div className="space-y-6 animate-bounceIn pt-16">
      {/* どこで カード */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-4 border-green-400 transform transition-transform hover:scale-105">
        <p className="text-sm font-bold text-green-600 mb-2">どこで?</p>
        <p className="text-2xl md:text-3xl font-bold text-gray-800">
          {location}
        </p>
      </div>

      {/* なにをする カード */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-4 border-orange-400 transform transition-transform hover:scale-105">
        <p className="text-sm font-bold text-orange-500 mb-2">なにをする?</p>
        <p className="text-2xl md:text-3xl font-bold text-gray-800">{action}</p>
      </div>
    </div>
  );
}
