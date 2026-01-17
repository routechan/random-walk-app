# トラブルシューティングガイド

データ取得に関する問題の診断と解決方法を記載しています。

## 目次

1. [環境変数の確認](#1-環境変数の確認)
2. [Supabase接続の確認](#2-supabase接続の確認)
3. [データベースの確認](#3-データベースの確認)
4. [RLSポリシーの確認](#4-rlsポリシーの確認)
5. [APIエンドポイントの確認](#5-apiエンドポイントの確認)
6. [よくあるエラーと解決方法](#6-よくあるエラーと解決方法)

---

## 1. 環境変数の確認

### チェックリスト

- [ ] `.env.local` ファイルが存在する
- [ ] `NEXT_PUBLIC_SUPABASE_URL` が設定されている
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` が設定されている
- [ ] URLとキーにスペースや改行が含まれていない
- [ ] 環境変数設定後に開発サーバーを再起動した

### 確認方法

#### .env.localファイルの確認

```bash
# ファイルが存在するか確認
ls -la .env.local

# 内容を確認（機密情報なので注意）
cat .env.local
```

正しい形式:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 環境変数が読み込まれているか確認

`src/lib/supabase.ts` に一時的にログを追加:

```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('Supabase URL:', supabaseUrl)
console.log('Anon Key (first 20 chars):', supabaseAnonKey?.substring(0, 20))
```

開発サーバーを再起動して、ターミナルに出力されることを確認。

### よくある問題

**❌ 間違い: 余分なスペースがある**
```bash
NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co  # = の前後にスペース
```

**✅ 正しい**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
```

**❌ 間違い: クォートで囲んでいる**
```bash
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"  # 不要
```

**✅ 正しい**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
```

---

## 2. Supabase接続の確認

### Supabase Dashboardでの確認

1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. プロジェクトが「Active」状態か確認
3. Settings → API で以下を確認:
   - Project URL が `.env.local` の URL と一致
   - anon public key が `.env.local` のキーと一致

### テスト用スクリプト

プロジェクトルートに `test-connection.js` を作成:

```javascript
// test-connection.js
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'undefined')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ 接続エラー:', error.message)
      return
    }

    console.log('✅ Supabase接続成功!')
  } catch (err) {
    console.error('❌ エラー:', err.message)
  }
}

testConnection()
```

実行:
```bash
npm install dotenv
node test-connection.js
```

---

## 3. データベースの確認

### Supabase SQL Editorでクエリ実行

#### データ件数の確認

```sql
-- locationsテーブルの件数確認
SELECT COUNT(*) as total,
       COUNT(*) FILTER (WHERE is_active = true) as active
FROM locations;

-- actionsテーブルの件数確認
SELECT COUNT(*) as total,
       COUNT(*) FILTER (WHERE is_active = true) as active
FROM actions;
```

**期待される結果:**
```
total | active
------|-------
  100 |   100
```

#### サンプルデータの確認

```sql
-- locationsから5件取得
SELECT * FROM locations WHERE is_active = true LIMIT 5;

-- actionsから5件取得
SELECT * FROM actions WHERE is_active = true LIMIT 5;
```

データが表示されない場合は、[setup.sql](./supabase/setup.sql) を再実行してください。

### テーブルが存在するか確認

```sql
-- テーブル一覧を表示
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

`locations` と `actions` が表示されることを確認。

---

## 4. RLSポリシーの確認

### RLSが有効か確認

```sql
-- RLS設定の確認
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('locations', 'actions');
```

**期待される結果:**
```
tablename  | rowsecurity
-----------|------------
locations  | true
actions    | true
```

### ポリシーが設定されているか確認

```sql
-- ポリシー一覧を表示
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('locations', 'actions');
```

**期待される結果:**
少なくとも `Enable read access for all users` ポリシーが存在すること。

### RLSポリシーのテスト

```sql
-- anonロールでのアクセステスト（実際のAPIと同じ権限）
SET ROLE anon;
SELECT COUNT(*) FROM locations WHERE is_active = true;
SELECT COUNT(*) FROM actions WHERE is_active = true;
RESET ROLE;
```

エラーが出る場合は、RLSポリシーを再設定:

```sql
-- RLSポリシーを再作成
DROP POLICY IF EXISTS "Enable read access for all users" ON locations;
CREATE POLICY "Enable read access for all users"
ON locations FOR SELECT
TO anon, authenticated
USING (is_active = true);

DROP POLICY IF EXISTS "Enable read access for all users" ON actions;
CREATE POLICY "Enable read access for all users"
ON actions FOR SELECT
TO anon, authenticated
USING (is_active = true);
```

---

## 5. APIエンドポイントの確認

### ブラウザでAPIを直接確認

開発サーバーが起動している状態で:

```
http://localhost:3000/api/random
```

にアクセス。

**期待される結果:**
```json
{
  "location": {
    "id": "uuid",
    "text": "近くの公園で"
  },
  "action": {
    "id": "uuid",
    "text": "写真を撮る"
  }
}
```

### curlでAPIをテスト

```bash
curl http://localhost:3000/api/random
```

### ブラウザのDevToolsで確認

1. F12キーでDevToolsを開く
2. Networkタブを選択
3. アプリで「散歩開始！」ボタンをクリック
4. `/api/random` のリクエストを確認
5. Response タブでレスポンス内容を確認
6. Consoleタブでエラーメッセージを確認

---

## 6. よくあるエラーと解決方法

### エラー: "Supabaseの環境変数が設定されていません"

**原因:**
- `.env.local` ファイルが存在しない
- 環境変数名が間違っている
- 開発サーバーを再起動していない

**解決方法:**
```bash
# .env.exampleから.env.localを作成
cp .env.example .env.local

# .env.localを編集して実際の値を設定
# その後、開発サーバーを再起動
npm run dev
```

---

### エラー: "Invalid API key"

**原因:**
- Anon Keyが間違っている
- キーにスペースや改行が含まれている
- 古いキーを使用している

**解決方法:**
1. Supabase Dashboard → Settings → API
2. 「anon public」キーをコピー
3. `.env.local` に正確に貼り付け
4. 開発サーバーを再起動

---

### エラー: "データが見つかりませんでした" (404)

**原因:**
- データベースにデータが存在しない
- RLSポリシーでデータがフィルタリングされている
- `is_active = false` のデータしか存在しない

**解決方法:**
```sql
-- データが存在するか確認
SELECT COUNT(*) FROM locations WHERE is_active = true;
SELECT COUNT(*) FROM actions WHERE is_active = true;

-- データが0件の場合、setup.sqlを再実行
```

---

### エラー: "Failed to fetch" / ネットワークエラー

**原因:**
- Supabaseプロジェクトが停止している
- ネットワーク接続の問題
- URLが間違っている

**解決方法:**
1. Supabase Dashboardでプロジェクトが「Active」か確認
2. ブラウザで直接 `https://xxxxx.supabase.co` にアクセスして確認
3. `.env.local` のURLが正しいか確認

---

### エラー: "row-level security policy" 関連

**原因:**
- RLSポリシーが正しく設定されていない
- ポリシーの条件が厳しすぎる

**解決方法:**
```sql
-- RLSを一時的に無効化してテスト（本番では絶対にしない）
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE actions DISABLE ROW LEVEL SECURITY;

-- データが取得できたら、RLSポリシーを再設定
-- setup.sqlのRLS部分を再実行
```

---

### エラー: データが取得できるが、常に同じデータが返る

**原因:**
- キャッシュの問題
- ランダム化ロジックの問題

**解決方法:**
```bash
# Next.jsのキャッシュをクリア
rm -rf .next
npm run dev
```

ブラウザのキャッシュもクリア（Ctrl+Shift+Delete）

---

## デバッグモードの有効化

より詳細なログを出力するために、以下を追加:

### src/app/api/random/route.ts

```typescript
export async function GET() {
  console.log('=== API /api/random called ===')
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

  try {
    const { data: locations, error: locationError } = await supabase
      .from('locations')
      .select('id, text')
      .eq('is_active', true)

    console.log('Locations count:', locations?.length)
    console.log('Location error:', locationError)

    // ... 以下同様
  }
}
```

ターミナルとブラウザコンソールの両方でログを確認。

---

## 完全なリセット手順

すべてがうまくいかない場合の最終手段:

### 1. ローカル環境のクリーンアップ

```bash
# キャッシュ削除
rm -rf .next
rm -rf node_modules
rm package-lock.json

# 再インストール
npm install

# 環境変数を再設定
rm .env.local
cp .env.example .env.local
# .env.localを編集
```

### 2. Supabaseの再セットアップ

1. Supabase Dashboard → SQL Editor
2. 既存のテーブルを削除:
   ```sql
   DROP TABLE IF EXISTS locations CASCADE;
   DROP TABLE IF EXISTS actions CASCADE;
   ```
3. [setup.sql](./supabase/setup.sql) を全て実行
4. データ件数を確認:
   ```sql
   SELECT 'locations' as table_name, COUNT(*) FROM locations
   UNION ALL
   SELECT 'actions', COUNT(*) FROM actions;
   ```

### 3. 開発サーバーの起動

```bash
npm run dev
```

### 4. 動作確認

```
http://localhost:3000/api/random
```

にアクセスしてデータが取得できることを確認。

---

## サポート

上記の手順で解決しない場合:

1. ブラウザのDevTools Consoleのエラーメッセージをコピー
2. ターミナルのエラーログをコピー
3. `.env.local` の設定内容を確認（機密情報は除く）
4. Supabase Dashboard でテーブルにデータが存在するか確認

以上の情報を整理して質問すると、より的確なサポートが得られます。

---

最終更新: 2026-01-17
