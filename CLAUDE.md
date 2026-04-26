# Project Template — Claude Code Instructions

## Tech Stack

| 役割 | ツール |
|---|---|
| Dev | Cursor + Claude Code |
| Repo | GitHub |
| Deploy | Vercel |
| Database | Supabase |
| AI | Claude API (claude-sonnet-4-6 を基本とする) |
| Secrets | 1Password |

## 基本方針

- すべての回答は日本語で行う
- コードを変更する前に、目的・変更内容・影響範囲を簡潔に説明する
- 1回の変更は必要最小限にする
- 既存ファイルを削除・大幅変更する前に確認を求める
- 不明点がある場合は推測で進めず、確認事項を先に示す

## Secrets 管理

- 環境変数は `.env.local` に記述し、`.gitignore` に必ず含める
- シークレットは 1Password で管理し、コードに直書きしない
- `.env.example` に変数名のみ（値なし）を記載してリポジトリに含める

## Git / GitHub

- コミットメッセージは日本語 or Conventional Commits 形式
- `main` ブランチへの直接プッシュは行わない
- PR を作成してレビュー後にマージする

## Deploy (Vercel)

- デプロイは GitHub 連携による自動デプロイを基本とする
- 環境変数は Vercel のダッシュボードで管理する
- Preview デプロイで動作確認後に本番マージする

## Database (Supabase)

- スキーマ変更は Supabase のマイグレーション機能を使う
- RLS (Row Level Security) を必ず有効化する
- 接続情報は 1Password で管理し、環境変数経由で参照する

## AI Integration (Claude API)

- モデルは `claude-sonnet-4-6` を基本とする
- API キーは 1Password で管理し、環境変数 `ANTHROPIC_API_KEY` で参照する
- コスト管理のため、不要なリクエストは避ける
