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
  SELECTED_WORKS: 'あなたのセレクト',
  CREATE_TOP3: 'できた！シェアする 🎨',
  CREATE_TOP3_EMOJI: 'できた！シェアする 🎉',
  CREATE_TOP3_CTA: '作品を選ぶ ✨',
  BACK_TO_TOP: '← 戻る',
  BACK_TO_TOP_SIMPLE: '戻る',
  DOWNLOAD_IMAGE: '保存する 📥',
  GENERATING: '生成中...',
  IMAGE_SAVED: '画像を保存しました',
  NO_WORKS_SELECTED: '作品が選ばれていません。トップページから3つ選んでね！',
} as const
