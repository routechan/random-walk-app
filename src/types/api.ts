// API レスポンス型定義
export interface RandomResult {
  location: {
    id: string
    text: string
  }
  action: {
    id: string
    text: string
  }
}
