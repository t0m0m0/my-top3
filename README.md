# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## 本番デプロイ (Production Deployment)

### systemd サービスとして実行

このアプリケーションを systemd サービスとして永続化できます。

#### 前提条件

- Node.js がインストールされていること
- `npm install` で依存パッケージがインストール済みであること
- `.env` ファイルに API キーが設定されていること

#### 環境変数

| 変数名 | 必須 | 説明 |
|---|---|---|
| `CORS_ORIGIN` | **必須** | CORS 許可オリジン（カンマ区切りで複数指定可）。未設定の場合サーバーは起動しません。例: `https://myapp.example.com` |
| `GOOGLE_BOOKS_API_KEY` | 推奨 | Google Books API キー |
| `LASTFM_API_KEY` | 推奨 | Last.fm API キー |
| `TMDB_API_KEY` | 推奨 | TMDb API キー |
| `ADMIN_API_KEY` | 任意 | 管理用 API キー |
| `SHARES_DATA_PATH` | 任意 | SQLite DB ファイルパス（デフォルト: `data/shares.db`） |
| `PORT` | 任意 | サーバーポート（デフォルト: `8000`） |

#### セットアップ手順

1. セットアップスクリプトを実行します:

```bash
sudo ./scripts/setup-service.sh
```

これにより以下が行われます:

- `my-top3.service` を `/etc/systemd/system/` にコピー
- systemd デーモンをリロード
- サービスを有効化（OS 起動時に自動起動）
- サービスを起動

#### サービス管理コマンド

```bash
# ステータス確認
sudo systemctl status my-top3

# 停止
sudo systemctl stop my-top3

# 再起動
sudo systemctl restart my-top3

# ログ確認
sudo journalctl -u my-top3 -f
```

サーバーはデフォルトで `http://localhost:8000` で起動します。
