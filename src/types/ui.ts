// UI状態型定義
export type AppState = 'idle' | 'animating' | 'result'

export interface Result {
  location: string
  action: string
}
