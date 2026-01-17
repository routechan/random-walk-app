'use server'

import { supabase } from '@/lib/supabase'

export async function getRandomWalk() {
  try {
    // カウント取得を並行実行
    const [locationCount, actionCount] = await Promise.all([
      supabase
        .from('locations')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true),
      supabase
        .from('actions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true),
    ])

    if (!locationCount.count || !actionCount.count) {
      throw new Error('データが見つかりませんでした')
    }

    // ランダムなオフセットを計算
    const locationOffset = Math.floor(Math.random() * locationCount.count)
    const actionOffset = Math.floor(Math.random() * actionCount.count)

    // データ取得を並行実行
    const [locationResult, actionResult] = await Promise.all([
      supabase
        .from('locations')
        .select('id, text')
        .eq('is_active', true)
        .range(locationOffset, locationOffset)
        .single(),
      supabase
        .from('actions')
        .select('id, text')
        .eq('is_active', true)
        .range(actionOffset, actionOffset)
        .single(),
    ])

    if (locationResult.error) {
      console.error('Location error:', locationResult.error)
      throw locationResult.error
    }

    if (actionResult.error) {
      console.error('Action error:', actionResult.error)
      throw actionResult.error
    }

    if (!locationResult.data || !actionResult.data) {
      throw new Error('データが見つかりませんでした')
    }

    return {
      success: true,
      data: {
        location: locationResult.data,
        action: actionResult.data,
      },
    }
  } catch (error) {
    console.error('Error fetching random walk:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'データの取得に失敗しました',
    }
  }
}
