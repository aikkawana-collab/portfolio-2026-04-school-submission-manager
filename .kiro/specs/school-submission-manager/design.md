# 設計書: 小学校向け提出物管理システム

| 項目 | 内容 |
|------|------|
| バージョン | 1.0.0 |
| 作成日 | 2026-03-09 |
| 準拠要件 | requirements.md v1.0.0 |

---

## 1. C4モデル — Context（システムコンテキスト図）

```
┌─────────────────────────────────────────────────┐
│                Google Workspace                  │
│                                                  │
│  ┌──────────┐    ┌──────────────────────────┐   │
│  │  Google   │───▶│  Google スプレッドシート   │   │
│  │  フォーム  │    │  (Single Source of Truth) │   │
│  └──────────┘    └──────────┬───────────────┘   │
│       ▲                     │                    │
│       │              ┌──────┴──────┐             │
│       │              │  Google Apps │             │
│  ┌────┴────┐         │   Script    │             │
│  │  教師   │◀────────┤  (Backend)  ├────────▶    │
│  │ (入力)  │         │             │    ┌──────┐ │
│  └─────────┘         └──────┬──────┘    │Cache │ │
│                             │           │Service│ │
│                      ┌──────┴──────┐    └──────┘ │
│                      │  GAS Web App │             │
│                      │  (Frontend)  │             │
│                      └──┬───────┬──┘             │
│                         │       │                 │
│                    ┌────┴──┐ ┌──┴────┐           │
│                    │教師用 │ │児童用 │           │
│                    │ダッシュ│ │確認画面│           │
│                    │ボード │ │      │           │
│                    └───────┘ └──────┘           │
└─────────────────────────────────────────────────┘
         ▲                          ▲
         │                          │
    ┌────┴────┐              ┌──────┴──────┐
    │  教師   │              │    児童     │
    │(PC/タブ) │              │ (タブレット) │
    └─────────┘              └─────────────┘
```

### アクター

| アクター | アクセス経路 | 操作 |
|---------|------------|------|
| 教師 | Googleフォーム / WebアプリURL | ステータス入力、ダッシュボード閲覧 |
| 児童 | WebアプリURL (タブレット) | 自分の未提出確認 |
| GAS Trigger | onFormSubmit | 自動データ処理 |

---

## 2. C4モデル — Container（コンテナ図）

### コンテナ一覧

| コンテナ | 技術 | 責務 |
|---------|------|------|
| C1: Googleフォーム | Google Forms | 提出物ステータスの標準化入力UI |
| C2: スプレッドシート | Google Sheets | データ永続化、全体名簿、設定管理 |
| C3: GASバックエンド | Google Apps Script | トリガー処理、データ加工、API提供 |
| C4: 教師用フロントエンド | React (inlined in HtmlService) | ダッシュボードUI |
| C5: 児童用フロントエンド | React (inlined in HtmlService) | 未提出確認UI |
| C6: CacheService | GAS CacheService | データキャッシュ (TTL: 600s) |

### コンテナ間通信

```
C1 ──(Form Submit)──▶ C2 ──(Trigger)──▶ C3
                                          │
                      C6 ◀──(Read/Write)──┤
                                          │
                      ┌───────────────────┤
                      │                   │
                      ▼                   ▼
                     C4                  C5
              (google.script.run)  (google.script.run)
```

---

## 3. C4モデル — Component（コンポーネント図）

### C3: GASバックエンド コンポーネント

| コンポーネント | ファイル | 責務 |
|--------------|---------|------|
| TriggerHandler | trigger.gs | onFormSubmit イベント処理 |
| DataService | data-service.gs | スプレッドシートCRUD操作 |
| CacheManager | cache-manager.gs | CacheService抽象化 (get/set/invalidate) |
| AuthService | auth-service.gs | ロール判定、アクセス制御 |
| RouterService | router.gs | doGet(e) のルーティング |
| FormatService | format-service.gs | 条件付き書式の動的生成・適用 |
| ConfigService | config-service.gs | 設定シートの読み取り |

### C4/C5: フロントエンド コンポーネント

#### 教師用ダッシュボード (React)

| コンポーネント | 責務 |
|--------------|------|
| App | ルートコンポーネント、状態管理 |
| ClassSummary | クラス全体のサマリーカード |
| StudentList | 児童一覧テーブル (フィルタ/検索付き) |
| StudentDetail | 児童別の詳細パネル |
| SubmissionChart | 提出率の円グラフ/棒グラフ |
| FilterBar | ステータス/課題フィルタ |

#### 児童用確認画面 (React)

| コンポーネント | 責務 |
|--------------|------|
| App | ルートコンポーネント |
| ProgressBar | 提出率プログレスバー |
| TaskList | 未提出/再提出課題一覧 |
| TaskCard | 個別課題カード (アイコン+ステータス) |
| AchievementBadge | 達成時のバッジ表示 |
| TeacherComment | 教師コメント表示 |

---

## 4. API設計（google.script.run インターフェース）

### サーバーサイド関数一覧

| 関数名 | 引数 | 戻り値 | 呼び出し元 | 対応要件 |
|--------|------|--------|----------|---------|
| getClassSummary() | なし | { totalStudents, avgRate, unsubmittedCount, resubmitCount } | C4 | REQ-FUNC-022 |
| getStudentList(filter) | { status?, assignment?, query? } | StudentSummary[] | C4 | REQ-FUNC-023 |
| getStudentDetail(number) | 出席番号 | { name, number, rate, assignments[], history[] } | C4 | REQ-FUNC-021 |
| getStudentStatus(uuid) | UUID識別子 | { name, rate, pending[], resubmit[], comments[] } | C5 | REQ-FUNC-030-034 |
| exportCsv() | なし | CSV文字列 | C4 | REQ-FUNC-024 |
| invalidateCache() | なし | void | 管理用 | REQ-NFR-003 |

### データ型定義

```typescript
interface StudentSummary {
  number: number;        // 出席番号
  name: string;          // 氏名
  rate: number;          // 提出率 (0-100)
  pendingCount: number;  // 未提出数
  resubmitCount: number; // 再提出数
}

interface StudentDetail extends StudentSummary {
  uuid: string;
  assignments: Assignment[];
  history: HistoryEntry[];
}

interface Assignment {
  name: string;          // 提出物名
  status: 'unsubmitted' | 'submitted' | 'resubmit' | 'confirmed';
  deadline?: string;     // 締切日 (ISO 8601)
  comment?: string;      // 教師コメント
  updatedAt?: string;    // 最終更新日時
}

interface HistoryEntry {
  timestamp: string;
  assignment: string;
  status: string;
  teacher: string;
}

interface ClassSummary {
  totalStudents: number;
  avgRate: number;
  unsubmittedCount: number;
  resubmitCount: number;
  assignmentStats: { name: string; rate: number }[];
}
```

---

## 5. データフロー

### 5.1 フォーム送信 → スプレッドシート反映

```
1. 教師がGoogleフォームに入力・送信
2. フォーム回答がスプレッドシート「フォームの回答」シートに自動記録
3. インストーラブルトリガー (onFormSubmit) が発火
4. TriggerHandler が e.namedValues を解析
5. DataService が「名簿」シートで対象児童の行を検索
6. DataService が該当セルのステータスを更新 + タイムスタンプ記録
7. DataService が「提出履歴」シートにログを追記
8. CacheManager がキャッシュを無効化 (invalidate)
9. FormatService が条件付き書式を再適用（必要時のみ）
```

### 5.2 Webアプリ表示（キャッシュ戦略）

```
1. ユーザーが WebアプリURL にアクセス
2. doGet(e) → RouterService がパラメータを解析
3. AuthService がユーザーのロールを判定
4. 適切な HTML テンプレートを返却
5. React アプリが初期化
6. google.script.run で データ取得関数を呼び出し
7. CacheManager がキャッシュを確認
   7a. キャッシュヒット → JSON をパースして即座に返却
   7b. キャッシュミス → DataService がシートから読み取り → キャッシュ保存 → 返却
8. React がデータを描画
```

---

## 6. セキュリティ設計

### 6.1 認証フロー

```
アクセス → Google OAuth → ドメイン検証 → ロール判定 → 画面表示
                                           │
                              教師メール一覧と照合
                              ├─ 一致 → 教師ロール
                              └─ 不一致 → 児童ロール
```

### 6.2 アクセス制御マトリクス

| リソース | 教師 | 児童 |
|---------|------|------|
| 全体名簿シート | 読み書き | アクセス不可 |
| 教師ダッシュボード | 全児童データ閲覧 | アクセス不可 |
| 児童確認画面 | 全児童データ閲覧 | 自分のデータのみ |
| 設定シート | 読み書き | アクセス不可 |

### 6.3 入力サニタイズ

- フォーム入力: Googleフォーム側のバリデーション + GAS側での二重チェック
- URLパラメータ: 正規表現によるUUID形式の検証
- HTML出力: HtmlService.createHtmlOutput() のサニタイズ機能を利用
- テンプレート: スクリプトレットでの直接出力 `<?= ?>` ではなく `<?!= ?>` のフォース出力を避け、明示的なエスケープを使用

---

## 7. ビルド・デプロイ設計

### 7.1 ディレクトリ構成

```
project-root/
├── .clasp.json              # clasp設定
├── .claspignore             # デプロイ除外設定
├── appsscript.json          # GASマニフェスト
├── src/
│   ├── server/              # GASバックエンド
│   │   ├── trigger.gs
│   │   ├── data-service.gs
│   │   ├── cache-manager.gs
│   │   ├── auth-service.gs
│   │   ├── router.gs
│   │   ├── format-service.gs
│   │   └── config-service.gs
│   └── client/              # Reactフロントエンド
│       ├── teacher/         # 教師用ダッシュボード
│       │   ├── App.tsx
│       │   ├── components/
│       │   └── index.tsx
│       └── student/         # 児童用確認画面
│           ├── App.tsx
│           ├── components/
│           └── index.tsx
├── dist/                    # ビルド出力
│   ├── teacher.html         # インラインHTMLファイル
│   └── student.html         # インラインHTMLファイル
├── package.json
├── vite.config.ts
└── CLAUDE.md
```

### 7.2 ビルドパイプライン

```
1. npm run build
   → Vite がReactアプリをビルド
   → CSS/JSをインライン化した単一HTMLファイルを生成
   → dist/teacher.html, dist/student.html に出力

2. ビルド済HTMLを src/server/ 配下にコピー

3. clasp push
   → ローカルファイルをGASプロジェクトにアップロード

4. clasp deploy --description "v1.0.0"
   → 新しいデプロイバージョンを作成
```

### 7.3 環境

| 環境 | エンドポイント | 用途 |
|------|-------------|------|
| 開発 | /dev (テストデプロイ) | 開発・デバッグ |
| 本番 | /exec (デプロイ済URL) | 本番運用 |
