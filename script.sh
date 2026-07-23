#!/bin/bash
# setup-env-from-secrets.sh

set -e

echo "========================================="
echo "  SETUP .ENV FROM CONFIGURATION"
echo "========================================="

# ==========================================
# 1. Định nghĩa các biến mặc định
# ==========================================
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_NAME="${DB_NAME:-CRM}"
DB_PORT="${DB_PORT:-5432}"
PORT_BE="${PORT_BE:-8017}"
PORT_FE="${PORT_FE:-8080}"
JWT_ACCESS_SECRET="${JWT_ACCESS_SECRET:-$(openssl rand -base64 32)}"
JWT_EXPIRES_IN="${JWT_EXPIRES_IN:-7d}"
JWT_REFRESH_SECRET="${JWT_REFRESH_SECRET:-$(openssl rand -base64 32)}"
JWT_REFRESH_EXPIRES_IN="${JWT_REFRESH_EXPIRES_IN:-30d}"

# Email (tùy chọn)
MAIL_HOST="${MAIL_HOST:-smtp.gmail.com}"
MAIL_PORT="${MAIL_PORT:-587}"
SMTP_USER="${SMTP_USER:-}"
SMTP_PASS="${SMTP_PASS:-}"

# ==========================================
# 2. Tạo backend .env
# ==========================================
echo ""
echo "[1/2] Creating backend .env..."

HOST_IP=$(hostname -I | awk '{print $1}')
echo "📍 Detected IP: $HOST_IP"

cat > .env << EOF
# ==========================================
# DATABASE CONFIGURATION
# ==========================================
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
DB_HOST=db
DB_PORT=${DB_PORT}

# ==========================================
# APPLICATION PORTS
# ==========================================
PORT_BE=${PORT_BE}
PORT_FE=${PORT_FE}

# ==========================================
# EMAIL CONFIGURATION
# ==========================================
MAIL_HOST=${MAIL_HOST}
MAIL_PORT=${MAIL_PORT}
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}

# ==========================================
# JWT CONFIGURATION
# ==========================================
JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
JWT_EXPIRES_IN=${JWT_EXPIRES_IN}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_REFRESH_EXPIRES_IN=${JWT_REFRESH_EXPIRES_IN}

# ==========================================
# HOST (auto-detected)
# ==========================================
HOST=${HOST_IP}
EOF

echo "✅ Backend .env created"

# ==========================================
# 3. Cập nhật DATABASE_URL (tự động encode password)
# ==========================================
echo ""
echo "[2/2] Generating DATABASE_URL..."

# Load biến từ .env
set -a
source .env
set +a

# Encode password → sinh ra DB_PASSWORD_ENCODED
if command -v python3 &> /dev/null; then
    DB_PASSWORD_ENCODED=$(python3 -c "import urllib.parse, os; print(urllib.parse.quote(os.environ.get('DB_PASSWORD', ''), safe=''))")
    echo "✅ Password encoded using Python"
else
    DB_PASSWORD_ENCODED=$(echo "${DB_PASSWORD}" | sed 's/ /%20/g' | sed 's/#/%23/g' | sed 's/?/%3F/g' | sed 's/&/%26/g' | sed 's/=/%3D/g')
    echo "⚠️ Python not found, using manual encoding"
fi

# Tạo DATABASE_URL với password đã encode
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD_ENCODED}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"

# Cập nhật DATABASE_URL vào .env
if grep -q "^DATABASE_URL=" .env; then
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"$DATABASE_URL\"|" .env
else
    echo "DATABASE_URL=\"$DATABASE_URL\"" >> .env
fi

echo "✅ DATABASE_URL updated"

# ==========================================
# 4. Verification
# ==========================================
echo ""
echo "========================================="
echo "  VERIFICATION"
echo "========================================="
echo ""
echo "📁 Backend .env:"
ls -la .env
echo ""
echo "🔑 DATABASE_URL:"
grep "^DATABASE_URL=" .env | sed 's/DB_PASSWORD=[^@]*/DB_PASSWORD=********/'
echo ""
echo "📧 HOST:"
grep "^HOST=" .env
echo ""
echo "========================================="
echo "✅ Backend environment setup completed!"
echo "========================================="