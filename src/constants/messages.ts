/**
 * アプリ全体の日本語メッセージ定数
 * 将来の多言語対応への布石として一元管理
 */
export const MESSAGES = {
  // Error messages
  RATE_LIMITED: 'しばらく時間をおいて再度お試しください',
  FETCH_FAILED: (label: string) => `${label}の取得に失敗しました`,
  NOT_FOUND: (label: string, id: string) =>
    `${label}が見つかりませんでした (ID: ${id})`,
  IMAGE_CORS_ERROR:
    '画像の取得に失敗しました。外部画像のCORS設定が原因の可能性があります。',
  NO_SEARCH_RESULTS: '検索結果が見つかりませんでした',

  // UI labels
  UNSELECTED: '未選択',
  SELECTED_WORKS: '選択中の作品',
  CREATE_TOP3: 'Top3を作成',
  CREATE_TOP3_EMOJI: 'Top3を作成 🎉',
  CREATE_TOP3_CTA: 'Top3を作成する',
  BACK_TO_TOP: '← トップページに戻る',
  BACK_TO_TOP_SIMPLE: 'トップページに戻る',
  DOWNLOAD_IMAGE: '画像をダウンロード',
  GENERATING: '生成中...',
  IMAGE_SAVED: '画像を保存しました',
  NO_WORKS_SELECTED:
    '作品が選択されていません。トップページから3作品を選んでください。',
} as const
