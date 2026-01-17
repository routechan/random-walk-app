import RandomWalkClient from '@/components/RandomWalkClient'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md mx-auto text-center">
        <RandomWalkClient />
      </div>
    </main>
  )
}
