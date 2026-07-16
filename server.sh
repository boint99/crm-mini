ENV_FILE=".env"

IP=$(hostname -I | awk '{print $1}')

if [ ! -f "$ENV_FILE" ]; then
    touch "$ENV_FILE"
fi

# Update HOST
if grep -q "^HOST=" "$ENV_FILE"; then
    sed -i "s/^HOST=.*/HOST=$IP/" "$ENV_FILE"
else
    echo "HOST=$IP" >> "$ENV_FILE"
fi

echo "HOST=$IP"
