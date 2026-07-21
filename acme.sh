#!/bin/bash
# fix-acme-permissions.sh

echo "🔧 Đang sửa quyền cho acme.json..."

if [ -f /home/crm-mini/letsencrypt/acme.json ]; then
    sudo chmod 644 /home/crm-mini/letsencrypt/acme.json
    sudo chown root:root /home/crm-mini/letsencrypt/acme.json
    
    ls -la /home/crm-mini/letsencrypt/acme.json
else
    sudo touch /home/crm-mini/letsencrypt/acme.json
    sudo chmod 600 /home/crm-mini/letsencrypt/acme.json
fi

echo "✅ Hoàn thành!"