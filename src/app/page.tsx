import RandomWalkClient from '@/components/RandomWalkClient'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden relative">
      {/* 草原の波模様 */}
      <div className="absolute bottom-0 left-0 right-0 h-[40vh] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-green-700 via-green-600 to-transparent opacity-30" />
      </div>

      <div className="w-full max-w-md mx-auto text-center relative z-10">
        <RandomWalkClient />
      </div>
    </main>
  )
}
