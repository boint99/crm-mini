#!/bin/bash

ENV_FILE=".env"

# Load biến từ .env
set -a
source "$ENV_FILE"
set +a

# Update HOST
IP=$(hostname -I | awk '{print $1}')
if grep -q "^HOST=" "$ENV_FILE"; then
    sed -i "s/^HOST=.*/HOST=$IP/" "$ENV_FILE"
else
    echo "HOST=$IP" >> "$ENV_FILE"
fi
echo "HOST=$IP"

# Encode password cho URL (dùng environment variable để tránh lỗi kí tự đặc biệt trong bash shell)
DB_PASSWORD_ENCODED=$(export DB_PASSWORD; python3 -c "import urllib.parse, os; print(urllib.parse.quote(os.environ.get('DB_PASSWORD', ''), safe=''))")


DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD_ENCODED}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"

# Cập nhật hoặc thêm DATABASE_URL
if grep -q "^DATABASE_URL=" "$ENV_FILE"; then
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"$DATABASE_URL\"|" "$ENV_FILE"
else
    echo "DATABASE_URL=\"$DATABASE_URL\"" >> "$ENV_FILE"
fi

echo "DATABASE_URL updated successfully."
