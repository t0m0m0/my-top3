# CLAUDE.md

## コミット前チェック

コミット前に以下を **すべて** 実行し、エラーがない状態でコミットすること（CIパイプラインと同じ内容）:

```bash
npm run lint              # ESLint
npm run format:check      # Prettier（失敗時: npx prettier --write 'src/**/*.{ts,tsx,css}'）
npm run typecheck         # TypeScript 型チェック
npm run test              # ユニット・統合テスト
```

## 開発方針

- t-wada流TDD（テスト駆動開発）で実装すること
  1. Red: まず失敗するテストを書く
  2. Green: テストを通す最小限のコードを書く
  3. Refactor: テストが通る状態を維持しつつリファクタリングする
- テストは実装より先に書く
- 一度に大きなステップを踏まず、小さいサイクルを回す

## ブランチ運用ルール

- 作業時は必ず `main` ブランチから新しいブランチを切って対応すること
- ブランチ名は `<type>/<説明>` 形式にする（例: `feat/add-login`, `fix/search-bug`, `chore/update-deps`）
- `main` ブランチに直接コミットしない

## 作業計画

- 実装に着手する前に、必ず作業計画を作成してユーザーに提示すること
- 計画には以下を含める:
  1. 現状の把握（関連ファイル・コードの確認）
  2. 変更内容の概要
  3. 実装ステップ（順序付き）
- 計画に合意を得てから実装を開始する

## スタイリングガイドライン (MUI + Tailwind CSS)

### 基本方針

スタイリングには以下の優先順位で使い分ける:

1. **Tailwind CSS** (レイアウト・装飾) — `className` で指定
   - レイアウト: `flex`, `grid`, `gap-*`, `p-*`, `m-*`, etc.
   - 装飾: `rounded-*`, `shadow-*`, `border-*`, etc.
   - アニメーション: `transition-*`, `animate-*`, etc.
   - レスポンシブ: `sm:`, `md:`, `lg:` プレフィックス

2. **CSS カスタムプロパティ** (デザイントークン) — `var(--color-*)` 等
   - 色: `var(--color-primary)`, `var(--color-text-secondary)`, etc.
   - フォント: `var(--font-display)`, `var(--font-body)`
   - シャドウ: `var(--shadow-primary)`, `var(--shadow-card)`
   - `style={{ color: 'var(--color-primary)' }}` または Tailwind arbitrary value `text-[var(--color-primary)]`

3. **MUI `sx` prop** (MUIコンポーネントのカスタマイズのみ)
   - MUI独自の内部構造のスタイリング (`'& .MuiTab-root'`, `'& .MuiChip-deleteIcon'`, etc.)
   - MUIテーマ連携が必要な場合 (`color: 'error.main'`, `borderColor: 'divider'`, etc.)
   - MUIのブレークポイント (`display: { xs: 'none', sm: 'flex' }`)
   - MUI固有の擬似要素スタイリング (`'&::before'`, `'&:hover'`, etc.)

### 禁止事項

- **`!important` は使わない** — 詳細度の問題はセレクタ設計で解決する
- **同じプロパティを複数の手法で指定しない** — 例: `className="text-red-500"` と `sx={{ color: 'red' }}` の併用は不可
- **MUI以外のHTML要素に `sx` prop を使わない** — `<div>` や `<span>` には `className` + `style` を使う

### 使い分け早見表

| 用途 | 手法 | 例 |
|------|------|----|---|
| レイアウト | Tailwind | `className="flex gap-4 p-3"` |
| テキストスタイル | Tailwind | `className="text-sm font-bold truncate"` |
| デザイントークン色 | CSS変数 + style | `style={{ color: 'var(--color-primary)' }}` |
| MUI内部構造 | sx | `sx={{ '& .MuiTab-root': { ... } }}` |
| MUIテーマ色参照 | sx | `sx={{ color: 'error.main' }}` |
| レスポンシブ表示切替(MUI) | sx | `sx={{ display: { xs: 'none', sm: 'flex' } }}` |
| アニメーション | CSS クラス | `className="animate-fade-in-up"` |

## スタイリングガイドライン

- **レイアウト・装飾**: Tailwind CSS ユーティリティクラス + CSS custom properties (`var(--color-*)`) を使用
- **MUI コンポーネント**: Button, Tabs, Snackbar, Dialog, TextField, Chip など「機能コンポーネント」に限定
- **MUI sx prop**: レスポンシブブレークポイント (`display: { xs: '...', sm: '...' }`) など Tailwind では困難なケースのみ許可
- **インライン style**: CSS custom properties の参照 (`style={{ color: 'var(--color-primary)' }}`) に限定
- **`!important` の使用禁止**: `prefers-reduced-motion` のアクセシビリティ対応を除き禁止
- **MUI Typography の代替**: `<span>`, `<p>`, `<h1>`〜`<h6>` + Tailwind クラス（`text-sm`, `font-bold` 等）を優先
- **MUI Box の代替**: `<div>` + Tailwind クラスを優先（MUI の `sx` レスポンシブが必要な場合を除く）
