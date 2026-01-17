# ランダム散歩アプリ

お散歩中のユーザーに「どこで」×「なにをする」のランダムな組み合わせを提供し、新しい体験を促すWebアプリケーション。

## 技術スタック

- **フロントエンド・バックエンド**: Next.js v15 (App Router)
- **データベース**: Supabase (PostgreSQL)
- **スタイリング**: Tailwind CSS
- **言語**: TypeScript

## プロジェクト構造

```
random-walk-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # ルートレイアウト
│   │   ├── page.tsx            # メインページ
│   │   └── api/
│   │       └── random/
│   │           └── route.ts    # ランダム生成API
│   ├── components/
│   │   ├── RandomButton.tsx    # ランダム生成ボタン
│   │   ├── RouletteAnimation.tsx  # ルーレット演出
│   │   └── ResultDisplay.tsx   # 結果表示
│   ├── lib/
│   │   ├── supabase.ts         # Supabaseクライアント
│   │   └── types.ts            # 型定義
│   └── styles/
│       └── globals.css         # グローバルスタイル
├── public/
│   └── images/                 # 画像ファイル
└── docs/                       # ドキュメント
```

## セットアップ手順

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com/)にアクセスしてプロジェクトを作成
2. SQL Editorで以下のテーブルを作成:

```sql
-- locationsテーブル作成
CREATE TABLE locations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  text text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- actionsテーブル作成
CREATE TABLE actions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  text text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- インデックス作成
CREATE INDEX idx_locations_active ON locations(is_active);
CREATE INDEX idx_actions_active ON actions(is_active);

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER locations_updated_at
BEFORE UPDATE ON locations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER actions_updated_at
BEFORE UPDATE ON actions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
```

3. 初期データを投入（データ仕様書のSQLを参照）

4. RLSポリシーを設定:
   - Table Editorで各テーブルの設定を開く
   - RLS (Row Level Security) を有効化
   - 読み取り専用ポリシーを追加:

```sql
-- locationsの読み取りポリシー
CREATE POLICY "Enable read access for all users" ON locations
FOR SELECT USING (true);

-- actionsの読み取りポリシー
CREATE POLICY "Enable read access for all users" ON actions
FOR SELECT USING (true);
```

### 2. 環境変数の設定

1. `.env.local.example`をコピーして`.env.local`を作成:

```bash
cp .env.local.example .env.local
```

2. Supabaseの認証情報を設定:
   - Supabase Dashboard > Settings > API
   - `Project URL`と`anon public`キーをコピー
   - `.env.local`に貼り付け

### 3. 依存関係のインストール

```bash
npm install
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く

## 利用可能なコマンド

- `npm run dev` - 開発サーバーを起動
- `npm run build` - 本番用ビルド
- `npm start` - 本番サーバーを起動
- `npm run lint` - ESLintでコードをチェック

## デプロイ

### Vercelへのデプロイ

1. GitHubリポジトリにプッシュ
2. [Vercel](https://vercel.com/)でプロジェクトをインポート
3. 環境変数を設定:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. デプロイ実行

## ドキュメント

詳細な仕様は以下のドキュメントを参照してください:

- [技術設計書](../docs/技術設計書.md)
- [画面設計書](../docs/画面設計書.md)
- [データ仕様書](../docs/データ仕様書.md)

## 主な機能

- **ランダム生成**: 「どこで」×「なにをする」の組み合わせを生成
- **ルーレット演出**: 結果表示前の楽しいアニメーション
- **再生成機能**: 何度でも新しい組み合わせを生成可能
- **レスポンシブデザイン**: スマートフォン・タブレット・PCに対応

## ライセンス

MIT
