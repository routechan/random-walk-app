'use client'

import { useState } from 'react'
import RandomButton from '@/components/RandomButton'
import RouletteAnimation from '@/components/RouletteAnimation'
import ResultDisplay from '@/components/ResultDisplay'
import type { AppState, Result } from '@/types'
import { getRandomWalk } from '@/lib/actions'

export default function RandomWalkClient() {
  const [state, setState] = useState<AppState>('idle')
  const [result, setResult] = useState<Result | null>(null)

  const handleGenerate = async () => {
    setState('animating')

    try {
      // Server Actionを直接呼び出し
      const response = await getRandomWalk()

      if (!response.success || !response.data) {
        throw new Error(response.error || 'データの取得に失敗しました')
      }

      // ルーレット演出の時間（2.5秒）
      setTimeout(() => {
        setResult({
          location: response.data.location.text,
          action: response.data.action.text,
        })
        setState('result')
      }, 2500)
    } catch (error) {
      console.error('Error:', error)
      setState('idle')
      alert('エラーが発生しました。もう一度お試しください。')
    }
  }

  return (
    <>
      {state === 'idle' && (
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              ランダム散歩
            </h1>
            <p className="text-base md:text-lg text-gray-600">
              ボタンを押して、今日の散歩を始めよう！
            </p>
          </div>
          <RandomButton onClick={handleGenerate} disabled={false} />
        </div>
      )}

      {state === 'animating' && <RouletteAnimation />}

      {state === 'result' && result && (
        <ResultDisplay
          location={result.location}
          action={result.action}
          onRegenerate={handleGenerate}
        />
      )}
    </>
  )
}
