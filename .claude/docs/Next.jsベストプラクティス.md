# Next.js App Router ベストプラクティス

このドキュメントは、Next.js App Routerを使用した開発における設計原則とベストプラクティスをまとめたものです。

参考: [Next.jsの考え方](https://zenn.dev/akfm/books/nextjs-basic-principle) by akfm_sato

---

## 目次

1. [データフェッチ](#1-データフェッチ)
2. [コンポーネント設計](#2-コンポーネント設計)
3. [キャッシュ戦略](#3-キャッシュ戦略)
4. [レンダリング](#4-レンダリング)
5. [その他のプラクティス](#5-その他のプラクティス)

---

## 1. データフェッチ

### 1.1 Server Componentsでのデータフェッチ

**原則: データフェッチはデフォルトでServer Componentsで行う**

Server Componentsでは、async/awaitを使って直接データフェッチが可能です。

```tsx
// app/posts/page.tsx
async function PostsPage() {
  // サーバーサイドで直接データフェッチ
  const posts = await fetch('https://api.example.com/posts').then(res => res.json());

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  );
}
```

**メリット:**
- バンドルサイズの削減（データフェッチロジックがクライアントに送られない）
- 直接データベースアクセスが可能
- 環境変数への安全なアクセス
- サーバー側での高速な処理

### 1.2 データのコロケーション（Colocation）

**原則: データは使用する場所で取得する**

データフェッチロジックをコンポーネントの近くに配置することで、保守性が向上します。

```tsx
// app/users/[id]/page.tsx
async function UserProfile({ params }: { params: { id: string } }) {
  const user = await getUser(params.id);

  return (
    <div>
      <UserHeader user={user} />
      <UserPosts userId={user.id} />
      <UserComments userId={user.id} />
    </div>
  );
}

// データフェッチ関数をコンポーネント近くで定義
async function getUser(id: string) {
  const res = await fetch(`https://api.example.com/users/${id}`);
  return res.json();
}
```

**メリット:**
- コンポーネントの独立性が高まる
- コードの理解が容易
- 変更の影響範囲が限定的

### 1.3 Request Memoization（リクエストメモ化）

**原則: 同一レンダリング内での重複リクエストは自動的にメモ化される**

Next.jsは同じリクエストを自動的に重複排除します。

```tsx
// これらは同じfetch URLなので、実際には1回しかリクエストされない
async function Component1() {
  const data = await fetch('https://api.example.com/data');
  return <div>{/* ... */}</div>;
}

async function Component2() {
  // 同じURLへのfetchは自動的にキャッシュされる
  const data = await fetch('https://api.example.com/data');
  return <div>{/* ... */}</div>;
}
```

カスタムデータフェッチ関数でも`cache`を使用してメモ化可能:

```tsx
import { cache } from 'react';

// データベースクエリなどをメモ化
export const getUser = cache(async (id: string) => {
  const user = await db.user.findUnique({ where: { id } });
  return user;
});
```

### 1.4 並行データフェッチ

**原則: 依存関係のないデータは並行してフェッチする**

Waterfallを避け、並行してデータを取得することでパフォーマンスを改善します。

```tsx
// ❌ 悪い例: Waterfall（順次実行）
async function SlowPage() {
  const user = await getUser();
  const posts = await getPosts(); // userの取得完了を待ってから実行
  const comments = await getComments(); // postsの取得完了を待ってから実行

  return <div>{/* ... */}</div>;
}

// ✅ 良い例: 並行実行
async function FastPage() {
  const [user, posts, comments] = await Promise.all([
    getUser(),
    getPosts(),
    getComments(),
  ]);

  return <div>{/* ... */}</div>;
}
```

### 1.5 N+1問題の回避とDataLoaderパターン

**原則: ループ内でのデータフェッチを避け、バッチ処理を使用する**

```tsx
// ❌ 悪い例: N+1問題
async function PostList() {
  const posts = await getPosts(); // 1回

  return (
    <div>
      {posts.map(async post => {
        const author = await getAuthor(post.authorId); // N回
        return <PostCard post={post} author={author} />;
      })}
    </div>
  );
}

// ✅ 良い例: バッチ取得
async function PostList() {
  const posts = await getPosts();
  const authorIds = posts.map(post => post.authorId);
  const authors = await getAuthors(authorIds); // 1回でまとめて取得

  const authorsMap = new Map(authors.map(author => [author.id, author]));

  return (
    <div>
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          author={authorsMap.get(post.authorId)}
        />
      ))}
    </div>
  );
}
```

### 1.6 きめ細かいREST API設計

**原則: フロントエンドの要求に合わせて専用のAPIエンドポイントを設計する**

```tsx
// ❌ 汎用的すぎるAPI
// GET /api/users → 不要なデータも含まれる
// GET /api/posts → 不要なデータも含まれる

// ✅ 用途に特化したAPI
// GET /api/dashboard/summary → ダッシュボードに必要なデータのみ
async function Dashboard() {
  const summary = await fetch('/api/dashboard/summary').then(r => r.json());

  return (
    <div>
      <StatsCard stats={summary.stats} />
      <RecentPosts posts={summary.recentPosts} />
      <Notifications notifications={summary.notifications} />
    </div>
  );
}
```

### 1.7 インタラクティブなデータフェッチ

**原則: ユーザー操作によるデータフェッチはClient Componentsで行う**

```tsx
'use client';

import { useState } from 'react';

export function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await fetch(`/api/search?q=${query}`).then(r => r.json());
      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? '検索中...' : '検索'}
      </button>
      <ResultsList results={results} />
    </div>
  );
}
```

---

## 2. コンポーネント設計

### 2.1 バンドル境界の管理

**原則: 'use client'ディレクティブは必要最小限に留める**

```tsx
// ❌ 悪い例: ページ全体をClient Componentにしている
'use client';

export default function Page() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <Header /> {/* インタラクティブでないのにクライアントバンドルに含まれる */}
      <Counter count={count} setCount={setCount} />
      <Footer /> {/* インタラクティブでないのにクライアントバンドルに含まれる */}
    </div>
  );
}

// ✅ 良い例: インタラクティブな部分だけをClient Componentにする
export default function Page() {
  return (
    <div>
      <Header /> {/* Server Component */}
      <Counter /> {/* Client Component */}
      <Footer /> {/* Server Component */}
    </div>
  );
}

// components/Counter.tsx
'use client';
export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### 2.2 Client Componentsのユースケース

**Client Componentsを使用すべき場合:**

1. **イベントハンドラーが必要な場合**
```tsx
'use client';

export function Button() {
  return <button onClick={() => alert('Clicked!')}>Click me</button>;
}
```

2. **Reactのフックを使用する場合**
```tsx
'use client';
import { useState, useEffect } from 'react';

export function Timer() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return <div>{time.toLocaleTimeString()}</div>;
}
```

3. **ブラウザAPIを使用する場合**
```tsx
'use client';

export function WindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <div>{size.width} x {size.height}</div>;
}
```

### 2.3 Compositionパターン

**原則: Server ComponentsとClient Componentsを組み合わせる**

```tsx
// app/page.tsx (Server Component)
import { ClientWrapper } from './ClientWrapper';
import { ServerData } from './ServerData';

export default async function Page() {
  const data = await fetchData();

  return (
    <ClientWrapper>
      {/* Server Componentを子として渡せる */}
      <ServerData data={data} />
    </ClientWrapper>
  );
}

// ClientWrapper.tsx
'use client';

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && children}
    </div>
  );
}
```

**重要なポイント:**
- Client Componentの`children`としてServer Componentを渡すことができる
- これによりインタラクティブな機能とサーバーレンダリングの利点を両立できる

### 2.4 Container-First設計

**原則: UIコンポーネントを先に作り、データフェッチは後で追加する**

```tsx
// 1. まずUI（Presentational）コンポーネントを作成
export function UserCard({ user }: { user: User }) {
  return (
    <div className="card">
      <img src={user.avatar} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.bio}</p>
    </div>
  );
}

// 2. 次にコンテナ（データフェッチ）を追加
async function UserCardContainer({ userId }: { userId: string }) {
  const user = await getUser(userId);
  return <UserCard user={user} />;
}
```

### 2.5 Container/Presentationalパターン

**原則: データロジックと表示ロジックを分離する**

```tsx
// Presentational Component（表示のみ）
export function TaskList({ tasks, onToggle, onDelete }: TaskListProps) {
  return (
    <ul>
      {tasks.map(task => (
        <li key={task.id}>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggle(task.id)}
          />
          <span>{task.title}</span>
          <button onClick={() => onDelete(task.id)}>削除</button>
        </li>
      ))}
    </ul>
  );
}

// Container Component（データとロジック）
'use client';

export function TaskListContainer() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleToggle = async (id: string) => {
    await fetch(`/api/tasks/${id}/toggle`, { method: 'POST' });
    // 状態更新
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    // 状態更新
  };

  return <TaskList tasks={tasks} onToggle={handleToggle} onDelete={handleDelete} />;
}
```

**メリット:**
- テストが容易
- 再利用性が高い
- デザインとロジックの分離

---

## 3. キャッシュ戦略

### 3.1 Static RenderingとFull Route Cache

**原則: デフォルトでStatic Renderingを活用する**

Static Renderingはビルド時にページをレンダリングし、結果をキャッシュします。

```tsx
// デフォルトでStatic Rendering
export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  );
}

// 動的ルートの場合はgenerateStaticParamsで事前生成
export async function generateStaticParams() {
  const posts = await getPosts();

  return posts.map(post => ({
    slug: post.slug,
  }));
}
```

**Static Renderingが適している場合:**
- ブログ記事
- 商品ページ
- ドキュメント
- マーケティングページ

### 3.2 Dynamic RenderingとData Cache

**原則: ユーザー固有のデータや頻繁に更新されるデータはDynamic Renderingを使用**

```tsx
import { cookies } from 'next/headers';

// Dynamic Renderingを強制
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  // ユーザー固有のデータを取得
  const userData = await getUserData(userId);

  return (
    <div>
      <h1>Welcome, {userData.name}</h1>
      <DashboardStats data={userData.stats} />
    </div>
  );
}
```

**Data Cacheの制御:**

```tsx
// キャッシュしない
fetch('https://api.example.com/data', { cache: 'no-store' });

// 10秒間キャッシュ
fetch('https://api.example.com/data', { next: { revalidate: 10 } });

// デフォルト（無期限キャッシュ）
fetch('https://api.example.com/data');
```

### 3.3 Router Cache

**原則: クライアント側のナビゲーションキャッシュを理解する**

Router Cacheは、ユーザーがページ間を移動する際にクライアント側でページをキャッシュします。

```tsx
// app/layout.tsx
import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav>
        {/* Linkコンポーネントはプリフェッチとキャッシュを自動的に行う */}
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
      </nav>
      {children}
    </div>
  );
}
```

**プリフェッチの制御:**

```tsx
// プリフェッチを無効化
<Link href="/about" prefetch={false}>About</Link>

// プログラムでプリフェッチ
import { useRouter } from 'next/navigation';

function Component() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/dashboard');
  }, [router]);
}
```

### 3.4 データの変更とキャッシュの無効化

**原則: Server Actionsを使用してデータを変更し、キャッシュを適切に無効化する**

```tsx
// app/actions.ts
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  // データベースに保存
  await db.post.create({
    data: { title, content },
  });

  // キャッシュを無効化
  revalidatePath('/posts'); // 特定のパスを無効化
  revalidateTag('posts'); // タグベースで無効化
}

// app/posts/new/page.tsx
import { createPost } from '../actions';

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="タイトル" />
      <textarea name="content" placeholder="内容" />
      <button type="submit">投稿</button>
    </form>
  );
}
```

**キャッシュタグの使用:**

```tsx
// データフェッチ時にタグを付ける
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    next: { tags: ['posts'] }
  });
  return res.json();
}

// Server Actionで特定のタグを無効化
'use server';

export async function updatePost(id: string, data: PostData) {
  await db.post.update({ where: { id }, data });
  revalidateTag('posts');
}
```

---

## 4. レンダリング

### 4.1 純粋なServer Components

**原則: Server Componentsは純粋関数として実装する**

Server Componentsは、同じ入力に対して常に同じ出力を返すべきです。

```tsx
// ✅ 良い例: 純粋な関数
async function UserProfile({ userId }: { userId: string }) {
  const user = await getUser(userId);

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.bio}</p>
    </div>
  );
}

// ❌ 悪い例: 副作用がある
async function UserProfile({ userId }: { userId: string }) {
  const user = await getUser(userId);

  // グローバル状態を変更（副作用）
  globalState.lastVisitedUser = user.id;

  return <div>...</div>;
}
```

**注意点:**
- Server Componentsでは状態管理やブラウザAPIは使用できない
- データフェッチ以外の副作用は避ける
- キャッシュ可能性を意識する

### 4.2 SuspenseとStreaming

**原則: Suspenseを使用して段階的にコンテンツを表示する**

```tsx
// app/page.tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <div>
      <h1>ダッシュボード</h1>

      {/* 即座に表示される部分 */}
      <QuickStats />

      {/* データフェッチ中はローディングを表示 */}
      <Suspense fallback={<Skeleton />}>
        <SlowData />
      </Suspense>

      {/* 別のデータフェッチ */}
      <Suspense fallback={<Skeleton />}>
        <AnotherSlowData />
      </Suspense>
    </div>
  );
}

// 遅いデータフェッチを含むコンポーネント
async function SlowData() {
  const data = await fetchSlowData(); // 時間がかかる処理
  return <div>{/* データを表示 */}</div>;
}
```

**メリット:**
- 初期表示が高速化
- ユーザーエクスペリエンスの向上
- 並行レンダリング

**ローディングUIの配置:**

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <div>読み込み中...</div>;
}

// app/dashboard/page.tsx
export default async function Dashboard() {
  const data = await fetchData();
  return <div>{/* データを表示 */}</div>;
}
```

### 4.3 ストリーミングの活用

**原則: loading.tsxとSuspenseでストリーミングを実現する**

```tsx
// app/posts/loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  );
}

// app/posts/[id]/page.tsx
export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);

  return (
    <article>
      <h1>{post.title}</h1>

      {/* コメントは別途ストリーミング */}
      <Suspense fallback={<div>コメントを読み込み中...</div>}>
        <Comments postId={params.id} />
      </Suspense>
    </article>
  );
}

async function Comments({ postId }: { postId: string }) {
  const comments = await getComments(postId);
  return (
    <div>
      {comments.map(comment => (
        <div key={comment.id}>{comment.text}</div>
      ))}
    </div>
  );
}
```

---

## 5. その他のプラクティス

### 5.1 リクエストとレスポンスの操作

**原則: Next.jsのヘルパー関数を使用する**

```tsx
import { cookies, headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';

export default async function Page() {
  // Cookieの取得
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (!token) {
    redirect('/login');
  }

  // ヘッダーの取得
  const headersList = await headers();
  const userAgent = headersList.get('user-agent');

  const data = await fetchData(token.value);

  if (!data) {
    notFound(); // 404ページを表示
  }

  return <div>{/* データを表示 */}</div>;
}
```

**Cookieの設定（Server Actions）:**

```tsx
'use server';

import { cookies } from 'next/headers';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const token = await authenticate(email, password);

  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7日
  });
}
```

### 5.2 認証と認可

**原則: Middlewareとサーバーコンポーネントで認証を実装する**

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');

  // 認証が必要なページへのアクセス
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*'],
};
```

**Server Componentsでのユーザー情報取得:**

```tsx
// lib/auth.ts
import { cookies } from 'next/headers';
import { cache } from 'react';

export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  const user = await verifyToken(token);
  return user;
});

// app/dashboard/page.tsx
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
    </div>
  );
}
```

**認可の実装:**

```tsx
// lib/auth.ts
export async function checkPermission(userId: string, resource: string, action: string) {
  const permissions = await getPermissions(userId);
  return permissions.some(p => p.resource === resource && p.action === action);
}

// app/posts/[id]/edit/page.tsx
import { getCurrentUser, checkPermission } from '@/lib/auth';
import { notFound } from 'next/navigation';

export default async function EditPost({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const canEdit = await checkPermission(user.id, 'posts', 'edit');

  if (!canEdit) {
    notFound(); // または専用の403ページへリダイレクト
  }

  const post = await getPost(params.id);

  return <EditForm post={post} />;
}
```

### 5.3 エラーハンドリング

**原則: error.tsxとグローバルエラーハンドラーを活用する**

```tsx
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>エラーが発生しました</h2>
      <p>{error.message}</p>
      <button onClick={reset}>再試行</button>
    </div>
  );
}

// app/posts/error.tsx（特定のセグメント用）
'use client';

export default function PostsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>投稿の読み込みに失敗しました</h2>
      <button onClick={reset}>再読み込み</button>
    </div>
  );
}
```

**グローバルエラーハンドラー:**

```tsx
// app/global-error.tsx
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>予期しないエラーが発生しました</h2>
        <button onClick={reset}>再試行</button>
      </body>
    </html>
  );
}
```

**404ハンドリング:**

```tsx
// app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>ページが見つかりません</h2>
      <p>お探しのページは存在しないか、移動した可能性があります。</p>
      <Link href="/">ホームへ戻る</Link>
    </div>
  );
}

// 特定のページで404を表示
import { notFound } from 'next/navigation';

export default async function Post({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);

  if (!post) {
    notFound(); // not-found.tsxが表示される
  }

  return <article>{post.title}</article>;
}
```

**エラーバウンダリの配置戦略:**

```
app/
├── error.tsx           # ルートレベルのエラー
├── layout.tsx
├── page.tsx
├── dashboard/
│   ├── error.tsx       # ダッシュボード固有のエラー
│   ├── page.tsx
│   └── analytics/
│       ├── error.tsx   # アナリティクス固有のエラー
│       └── page.tsx
```

---

## まとめ

### 重要な設計原則

1. **サーバーファースト**: デフォルトでServer Componentsを使用し、必要な場合のみClient Componentsを使う
2. **コロケーション**: データフェッチとコンポーネントを近くに配置する
3. **並行処理**: 依存関係のないデータは並行して取得する
4. **キャッシュ最適化**: Static RenderingとDynamic Renderingを適切に使い分ける
5. **段階的表示**: SuspenseとStreamingでユーザーエクスペリエンスを向上させる
6. **エラーハンドリング**: error.tsxを階層的に配置し、適切にエラーを処理する

### パフォーマンスのチェックリスト

- [ ] 'use client'は必要最小限に留めているか
- [ ] 並行データフェッチを活用しているか
- [ ] N+1問題を回避しているか
- [ ] 適切なキャッシュ戦略を選択しているか
- [ ] Suspenseで段階的にコンテンツを表示しているか
- [ ] 画像は`next/image`を使用しているか
- [ ] 動的インポートを活用しているか

### セキュリティのチェックリスト

- [ ] 認証はMiddlewareとサーバーサイドで実装しているか
- [ ] 環境変数は適切に保護されているか（NEXT_PUBLIC_プレフィックスの使い分け）
- [ ] Server Actionsで適切な検証を行っているか
- [ ] CSRFトークンを使用しているか（必要な場合）
- [ ] Cookieに適切なフラグ（httpOnly, secure, sameSite）を設定しているか

---

## 参考リンク

- [Next.js公式ドキュメント](https://nextjs.org/docs)
- [React公式ドキュメント](https://react.dev)
- [Next.jsの考え方](https://zenn.dev/akfm/books/nextjs-basic-principle) by akfm_sato

---

最終更新: 2026-01-17
