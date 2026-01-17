-- ランダム散歩アプリ データベースセットアップ
-- 実行順序: テーブル作成 → インデックス → トリガー → RLS → 初期データ

-- ============================================
-- 1. テーブル作成
-- ============================================

-- locationsテーブル作成
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  text text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- actionsテーブル作成
CREATE TABLE IF NOT EXISTS actions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  text text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- ============================================
-- 2. インデックス作成
-- ============================================

CREATE INDEX IF NOT EXISTS idx_locations_active ON locations(is_active);
CREATE INDEX IF NOT EXISTS idx_actions_active ON actions(is_active);

-- ============================================
-- 3. 更新日時の自動更新トリガー
-- ============================================

-- トリガー関数作成
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- locationsテーブル用トリガー
DROP TRIGGER IF EXISTS locations_updated_at ON locations;
CREATE TRIGGER locations_updated_at
BEFORE UPDATE ON locations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- actionsテーブル用トリガー
DROP TRIGGER IF EXISTS actions_updated_at ON actions;
CREATE TRIGGER actions_updated_at
BEFORE UPDATE ON actions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 4. Row Level Security (RLS) 設定
-- ============================================

-- RLSを有効化
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;

-- 読み取り専用ポリシー（全ユーザーが読み取り可能）
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

-- 管理者のみ書き込み可能（必要に応じて設定）
-- DROP POLICY IF EXISTS "Enable write access for admins" ON locations;
-- CREATE POLICY "Enable write access for admins"
-- ON locations FOR ALL
-- TO authenticated
-- USING (auth.jwt() ->> 'role' = 'admin');

-- DROP POLICY IF EXISTS "Enable write access for admins" ON actions;
-- CREATE POLICY "Enable write access for admins"
-- ON actions FOR ALL
-- TO authenticated
-- USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- 5. 初期データ投入（locations - どこで）
-- ============================================

INSERT INTO locations (text) VALUES
('近くの公園で'),
('駅前で'),
('商店街で'),
('図書館で'),
('市役所で'),
('郵便局で'),
('コンビニで'),
('スーパーで'),
('デパートで'),
('ショッピングモールで'),
('本屋で'),
('駅のホームで'),
('バス停で'),
('タクシー乗り場で'),
('駐車場で'),
('駐輪場で'),
('交番で'),
('消防署の前で'),
('学校の前で'),
('幼稚園の前で'),
('公民館で'),
('体育館の前で'),
('プールの前で'),
('美術館で'),
('博物館で'),
('川沿いで'),
('橋の上で'),
('大きな木の下で'),
('坂道で'),
('階段で'),
('線路沿いで'),
('神社で'),
('お寺で'),
('墓地で'),
('広場で'),
('芝生の上で'),
('花壇の前で'),
('噴水の前で'),
('池のほとりで'),
('山道で'),
('森の中で'),
('海岸で'),
('砂浜で'),
('岩場で'),
('展望台で'),
('トンネルの前で'),
('洞窟で'),
('滝の前で'),
('田んぼのそばで'),
('畑のそばで'),
('カフェで'),
('レストランで'),
('ファストフード店で'),
('ラーメン屋で'),
('パン屋で'),
('ケーキ屋で'),
('アイスクリーム屋で'),
('書店で'),
('服屋で'),
('靴屋で'),
('雑貨屋で'),
('花屋で'),
('薬局で'),
('病院で'),
('歯医者で'),
('美容院で'),
('銀行で'),
('郵便局で'),
('コインランドリーで'),
('ガソリンスタンドで'),
('自動販売機の前で'),
('ATMの前で'),
('ゲームセンターで'),
('カラオケ店で'),
('映画館で'),
('見たことない道で'),
('角を曲がったところで'),
('路地裏で'),
('横断歩道で'),
('歩道橋の上で'),
('地下道で'),
('アーケード街で'),
('自転車で5分先で'),
('2駅先の駅で'),
('3つ目の信号で'),
('次の角で'),
('一番遠い場所で'),
('一番近い場所で'),
('ベンチがある場所で'),
('屋根がある場所で'),
('今いる場所で'),
('振り返った場所で'),
('目をつぶって10歩歩いた場所で'),
('右に曲がった先で'),
('左に曲がった先で'),
('一番人が多い場所で'),
('一番静かな場所で'),
('一番明るい場所で'),
('一番暗い場所で'),
('一番気になった場所で')
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. 初期データ投入（actions - なにをする）
-- ============================================

INSERT INTO actions (text) VALUES
('写真を撮る'),
('動画を撮る'),
('空を見上げる'),
('雲の形を観察する'),
('星を探す'),
('鳥を探す'),
('猫を探す'),
('犬を探す'),
('花を探す'),
('虫を探す'),
('看板を読む'),
('ポスターを見る'),
('建物を観察する'),
('人を観察する'),
('車を観察する'),
('木を観察する'),
('石を拾う'),
('葉っぱを拾う'),
('景色を眺める'),
('夕日を見る'),
('物を買う'),
('飲み物を買う'),
('お菓子を買う'),
('一番高いものを買う'),
('一番安いものを買う'),
('ガチャガチャを回す'),
('自動販売機で飲み物を買う'),
('コーヒーを飲む'),
('お茶を飲む'),
('ジュースを飲む'),
('アイスを食べる'),
('パンを買う'),
('おにぎりを買う'),
('弁当を買う'),
('雑誌を立ち読みする'),
('試食する'),
('試飲する'),
('クーポンを探す'),
('セール品を探す'),
('新商品を探す'),
('人と話す'),
('店員さんと話す'),
('店員さんにおすすめを聞く'),
('道を聞く'),
('挨拶する'),
('笑顔で会釈する'),
('知らない人に声をかける'),
('電話する'),
('メッセージを送る'),
('SNSに投稿する'),
('友達を誘う'),
('家族に連絡する'),
('写真を送る'),
('感想を共有する'),
('お礼を言う'),
('5分座って休む'),
('10分休憩する'),
('深呼吸する'),
('ストレッチする'),
('目を閉じる'),
('音楽を聴く'),
('好きな音楽を1曲聴く'),
('ラジオを聴く'),
('Podcastを聴く'),
('瞑想する'),
('昼寝する'),
('ベンチで休む'),
('日向ぼっこする'),
('風を感じる'),
('水を飲む'),
('知らない道を選ぶ'),
('右に曲がる'),
('左に曲がる'),
('Uターンする'),
('走る'),
('スキップする'),
('後ろ向きで歩く'),
('目印を探す'),
('地図を見る'),
('迷う'),
('引き返す'),
('ショートカットを探す'),
('遠回りする'),
('階段を使う'),
('エレベーターを使う'),
('橋を渡る'),
('トンネルをくぐる'),
('10分歩く'),
('100歩数える'),
('立ち止まる'),
('スマホを見ずに5分過ごす'),
('10枚写真を撮る'),
('3回深呼吸する'),
('占いをする'),
('おみくじを引く'),
('願い事をする'),
('何もしない'),
('サイコロを振る'),
('コインを投げる'),
('次の行動を決める')
ON CONFLICT DO NOTHING;

-- ============================================
-- セットアップ完了確認クエリ
-- ============================================

-- データ件数確認
SELECT 'locations' as table_name, COUNT(*) as count FROM locations WHERE is_active = true
UNION ALL
SELECT 'actions' as table_name, COUNT(*) as count FROM actions WHERE is_active = true;
