#!/usr/bin/env bash
set -euo pipefail

# setup-service.sh - my-top3 systemd サービスのセットアップスクリプト
# root 権限が必要です: sudo ./scripts/setup-service.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SERVICE_FILE="$PROJECT_DIR/my-top3.service"
SERVICE_NAME="my-top3.service"

if [[ $EUID -ne 0 ]]; then
  echo "エラー: このスクリプトは root 権限で実行してください" >&2
  echo "使い方: sudo $0" >&2
  exit 1
fi

if [[ ! -f "$SERVICE_FILE" ]]; then
  echo "エラー: サービスファイルが見つかりません: $SERVICE_FILE" >&2
  exit 1
fi

echo "==> サービスファイルをコピーしています..."
cp "$SERVICE_FILE" /etc/systemd/system/"$SERVICE_NAME"

echo "==> systemd デーモンをリロードしています..."
systemctl daemon-reload

echo "==> サービスを有効化しています..."
systemctl enable "$SERVICE_NAME"

echo "==> サービスを起動しています..."
systemctl start "$SERVICE_NAME"

echo "==> 完了！ステータスを確認します:"
systemctl status "$SERVICE_NAME" --no-pager
