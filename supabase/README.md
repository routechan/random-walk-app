# Supabaseセットアップガイド

このドキュメントでは、ランダム散歩アプリのSupabaseセットアップ手順を説明します。

## セットアップ方法

### 方法1: Supabase Dashboard経由（推奨）

#### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com/) にアクセス
2. 「Start your project」をクリック
3. GitHubアカウントでサインイン
4. 「New Project」をクリック
5. プロジェクト情報を入力:
   - Name: `random-walk-app` (任意)
   - Database Password: 強力なパスワードを設定（保存すること）
   - Region: `Northeast Asia (Tokyo)` を選択
   - Pricing Plan: `Free` を選択
6. 「Create new project」をクリック

#### 2. データベースのセットアップ

1. プロジェクトダッシュボードの左サイドバーから「SQL Editor」を選択
2. 「New query」をクリック
3. [setup.sql](./setup.sql) の内容をコピー＆ペースト
4. 「Run」ボタンをクリックして実行
5. 実行完了後、下部に以下のような結果が表示されることを確認:
   ```
   table_name | count
   -----------|------
   locations  | 100
   actions    | 100
   ```

#### 3. 環境変数の取得

1. 左サイドバーから「Settings」→「API」を選択
2. 以下の情報をメモ:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1...` (長い文字列)

#### 4. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
```

**重要**: `.env.local` は `.gitignore` に含まれているため、Gitにコミットされません。

#### 5. 動作確認

1. 開発サーバーを起動:
   ```bash
   npm run dev
   ```

2. ブラウザで `http://localhost:3000` にアクセス

3. 「散歩開始！」ボタンをクリックして、ランダムな組み合わせが表示されることを確認

---

### 方法2: Supabase CLI経由

#### 前提条件

- Node.js がインストールされていること
- npm または yarn が使用可能であること

#### 1. Supabase CLIのインストール

```bash
npm install -g supabase
```

#### 2. Supabaseプロジェクトの初期化

```bash
# プロジェクトルートで実行
supabase init
```

#### 3. ローカル開発環境の起動

```bash
supabase start
```

初回起動時は Docker イメージのダウンロードに時間がかかります。

起動完了後、以下の情報が表示されます:
```
API URL: http://localhost:54321
...
anon key: eyJhbGciOiJIUzI1...
```

#### 4. データベースのセットアップ

```bash
# setup.sqlを実行
supabase db reset
psql -h localhost -p 54322 -U postgres -d postgres -f supabase/setup.sql
```

または、Supabase Studio（`http://localhost:54323`）からsetup.sqlの内容を実行。

#### 5. 環境変数の設定

ローカル開発用の `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...  # supabase startで表示されたanon key
```

---

## MCP (Model Context Protocol) を使用した管理

MCPサーバーを使用すると、Claude Desktopから直接Supabaseを操作できます。

### MCPサーバーのセットアップ

#### 1. Supabase MCP Serverのインストール

Claude Desktop の設定ファイル (`claude_desktop_config.json`) に以下を追加:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-supabase",
        "--supabase-url",
        "https://xxxxx.supabase.co",
        "--supabase-key",
        "your-service-role-key-here"
      ]
    }
  }
}
```

**注意**:
- `supabase-url`: プロジェクトURL
- `supabase-key`: **Service Role Key** を使用（Dashboard → Settings → API → service_role）
- Service Role Keyは強力な権限を持つため、安全に管理してください

#### 2. Claude Desktopの再起動

設定を反映するため、Claude Desktopを再起動します。

#### 3. MCPサーバーの動作確認

Claude Desktopで以下のようなプロンプトを試してください:

```
Supabaseのlocationsテーブルからランダムに1件取得してください
```

MCPサーバーが正しく動作していれば、Claudeが直接Supabaseにクエリを実行できます。

### MCPで可能な操作

- テーブルのスキーマ確認
- データの検索・取得
- データの追加・更新・削除
- SQLクエリの実行
- テーブルの作成・変更

### 使用例

```
# データ件数の確認
locationsテーブルとactionsテーブルの件数を確認してください

# データの検索
「公園」を含むlocationsを検索してください

# データの追加
locationsテーブルに「海辺で」を追加してください

# データの更新
id が xxx の location の is_active を false に更新してください
```

---

## データ管理

### データの追加

#### Dashboard経由

1. 左サイドバーから「Table Editor」を選択
2. `locations` または `actions` テーブルを選択
3. 「Insert」→「Insert row」をクリック
4. `text` フィールドに新しいデータを入力
5. 「Save」をクリック

#### SQL経由

```sql
-- 新しい場所を追加
INSERT INTO locations (text) VALUES ('新しい場所で');

-- 新しい行動を追加
INSERT INTO actions (text) VALUES ('新しい行動をする');
```

### データの無効化

物理削除ではなく、`is_active` を `false` にすることで非表示にします。

```sql
-- 特定のデータを無効化
UPDATE locations SET is_active = false WHERE id = 'uuid';

-- 再度有効化
UPDATE locations SET is_active = true WHERE id = 'uuid';
```

### データのエクスポート

1. Table Editorでテーブルを選択
2. 右上の「...」メニューから「Export as CSV」を選択

### データのバックアップ

定期的にデータをエクスポートしてバックアップを取ることを推奨します。

---

## トラブルシューティング

### エラー: "Invalid API key"

- 環境変数のURLとキーが正しいか確認
- キーにスペースや改行が含まれていないか確認
- `.env.local` ファイルを保存後、開発サーバーを再起動

### エラー: "Failed to fetch"

- Supabaseプロジェクトが起動しているか確認
- ネットワーク接続を確認
- RLSポリシーが正しく設定されているか確認

### データが取得できない

- RLSポリシーで `is_active = true` の条件が設定されているか確認
- テーブルにデータが存在するか確認:
  ```sql
  SELECT COUNT(*) FROM locations;
  SELECT COUNT(*) FROM actions;
  ```

### ローカル環境でSupabase CLIが起動しない

- Dockerがインストールされているか確認
- Dockerが起動しているか確認
- ポート競合がないか確認（54321, 54322, 54323が使用可能か）

---

## セキュリティのベストプラクティス

1. **環境変数の管理**
   - `.env.local` は絶対にGitにコミットしない
   - Service Role Keyは公開しない
   - 本番環境とローカル環境で異なるプロジェクトを使用

2. **RLS (Row Level Security)**
   - 読み取り専用アクセスのみ許可
   - 書き込みは管理者のみに制限

3. **パスワード管理**
   - データベースパスワードは強力なものを使用
   - パスワードマネージャーで管理

4. **API Keyの保護**
   - `NEXT_PUBLIC_` プレフィックスは必要最小限に
   - Anon Keyのみをクライアント側で使用
   - Service Role Keyはサーバーサイドのみで使用

---

## 参考リンク

- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [MCP Supabase Server](https://github.com/modelcontextprotocol/servers/tree/main/src/supabase)

---

最終更新: 2026-01-17
