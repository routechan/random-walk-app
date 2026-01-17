# ランダム散歩アプリ - 開発進捗

## ドキュメント概要

[.claude/docs](.claude/docs) フォルダに以下のドキュメントを整備済み:

- [技術設計書](.claude/docs/技術設計書.md) - システム構成、DB設計、API設計
- [画面設計書](.claude/docs/画面設計書.md) - UI/UXデザイン、カラーパレット、アニメーション仕様
- [データ仕様書](.claude/docs/データ仕様書.md) - テーブル定義、初期データ(100件×2)
- [Next.jsベストプラクティス](.claude/docs/Next.jsベストプラクティス.md) - App Router設計原則

## 技術スタック

- **フレームワーク**: Next.js v15 (App Router)
- **データベース**: Supabase (PostgreSQL)
- **スタイリング**: Tailwind CSS
- **言語**: TypeScript
- **デプロイ**: Vercel (予定)

## 現在の実装状況

### 完了済み

#### ディレクトリ構造
```
random-walk-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx          ✅
│   │   ├── page.tsx            ✅
│   │   └── api/
│   │       └── random/
│   │           └── route.ts    ✅
│   ├── components/
│   │   ├── RandomButton.tsx    ✅
│   │   ├── RouletteAnimation.tsx ✅
│   │   └── ResultDisplay.tsx   ✅
│   ├── lib/
│   │   ├── supabase.ts         ✅
│   │   └── types.ts            ✅
│   └── styles/
│       └── globals.css         ✅
```

#### パッケージ
- next: ^15.1.4 ✅
- react: ^19.0.0 ✅
- @supabase/supabase-js: ^2.39.3 ✅
- tailwindcss: ^3.4.0 ✅
- typescript: ^5.3.3 ✅

### 未完了タスク

#### 1. Supabaseセットアップ
- [ ] Supabaseプロジェクト作成
- [ ] データベーステーブル作成 (locations, actions)
- [ ] 初期データ投入 (各100件)
- [ ] RLS (Row Level Security) ポリシー設定
- [ ] 環境変数設定 (.env.local)

**セットアップファイル**: [supabase/setup.sql](./supabase/setup.sql) - 全自動セットアップSQL
**手順書**: [supabase/README.md](./supabase/README.md) - Dashboard/CLI/MCPでのセットアップ手順
**参考**: [技術設計書 - データベース設計](.claude/docs/技術設計書.md#3-データベース設計)、[データ仕様書](.claude/docs/データ仕様書.md)

#### 2. コード実装確認・調整
- [ ] 各コンポーネントの実装内容確認
- [ ] APIルートの動作確認
- [ ] 画面設計書に基づくスタイリング調整
- [ ] アニメーション実装

**参考**: [技術設計書 - API設計](.claude/docs/技術設計書.md#4-api設計)、[画面設計書](.claude/docs/画面設計書.md)

#### 3. テスト・デバッグ
- [ ] ローカル環境での動作確認
- [ ] ルーレット演出の動作確認
- [ ] レスポンシブデザインの確認
- [ ] エラーハンドリングの確認

#### 4. デプロイ
- [ ] Vercelプロジェクト作成
- [ ] 環境変数設定
- [ ] 本番デプロイ
- [ ] 動作確認

**参考**: [技術設計書 - デプロイ](.claude/docs/技術設計書.md#10-デプロイ)

## データベース設計

詳細は[データ仕様書](.claude/docs/データ仕様書.md)を参照。

### テーブル構成

#### locationsテーブル (どこで)
- 場所のテキストデータを保存
- 初期データ: 100件

#### actionsテーブル (なにをする)
- 行動のテキストデータを保存
- 初期データ: 100件

**組み合わせ数**: 100 × 100 = 10,000通り

## API仕様

詳細は[技術設計書 - API設計](.claude/docs/技術設計書.md#4-api設計)を参照。

### GET /api/random

ランダムに「どこで」と「なにをする」を1件ずつ取得。

## UI/UX設計

詳細は[画面設計書](.claude/docs/画面設計書.md)を参照。

### 画面状態遷移
```
[初期状態] → [ルーレット演出中] → [結果表示状態] → (繰り返し)
```

### カラーパレット
- **プライマリ**: #FF6B9D (ピンク), #FFA06B (オレンジ)
- **セカンダリ**: #667EEA (パープル)
- **テキスト**: #333333, #666666, #999999
- **背景**: #FAFAFA, #FFFFFF

### アニメーション
- **ルーレット**: 50ms間隔でテキスト切り替え、2-3秒間
- **結果表示**: バウンスアニメーション
- **ボタンホバー**: scale(1.05) + シャドウ拡大

## 開発方針

### Next.jsベストプラクティスの適用

[Next.jsベストプラクティス](.claude/docs/Next.jsベストプラクティス.md)を参照して実装。

主な設計原則:
- Server Components優先のデータフェッチ
- Client Components最小化 (インタラクティブ部分のみ)
- データコロケーション
- 並行データフェッチ
- 適切なキャッシュ戦略

### コンポーネント構成
- **page.tsx**: Server Component
- **RandomButton.tsx**: Client Component
- **RouletteAnimation.tsx**: Client Component
- **ResultDisplay.tsx**: Presentational Component

## 次のステップ

### 優先度: 高
1. Supabaseプロジェクト作成とDB構築
2. 環境変数の設定
3. 実装コードの確認と動作テスト

### 優先度: 中
4. デザインの細部調整
5. アニメーションの完成度向上
6. エラーハンドリングの強化

### 優先度: 低
7. Vercelへのデプロイ
8. 本番環境での動作確認
9. パフォーマンス最適化

## トラブルシューティング

### データが取得できない場合

1. **診断ツールで確認**
   - `http://localhost:3000/test` にアクセス
   - 5つのステップで自動診断
   - エラーの詳細情報を確認

2. **トラブルシューティングガイド**
   - [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) を参照
   - よくあるエラーと解決方法を記載

3. **主な確認ポイント**
   - [ ] `.env.local` ファイルが存在し、正しく設定されている
   - [ ] 開発サーバーを環境変数設定後に再起動した
   - [ ] Supabase Dashboard でデータが存在する
   - [ ] RLSポリシーが正しく設定されている

### クイック修正

**修正済み: ランダム取得ロジック**
- `.order('random()')` → JavaScriptでのランダム選択に変更
- これにより、PostgreSQLのRANDOM()関数の問題を回避

## 開発メモ

### 注意事項
- 環境変数は `.env.local` に保存 (Gitにコミットしない)
- Supabase URLとANON KEYは `NEXT_PUBLIC_` プレフィックスを付ける
- データの組み合わせは 100 × 100 = 10,000通り
- 読み取り専用アクセス、書き込みは管理者のみ

### 参考リンク
- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Next.js公式ドキュメント](https://nextjs.org/docs)
- [Tailwind CSS公式ドキュメント](https://tailwindcss.com/docs)
- [トラブルシューティングガイド](./TROUBLESHOOTING.md) - 問題が発生した場合

---

最終更新: 2026-01-17
