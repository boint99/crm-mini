#!/bin/bash

ENV_FILE=".env"

IP=$(hostname -I | awk '{print $1}')

if [ ! -f "$ENV_FILE" ]; then
    touch "$ENV_FILE"
fi

if grep -q "^SERVER_IP=" "$ENV_FILE"; then
    sed -i "s/^SERVER_IP=.*/SERVER_IP=$IP/" "$ENV_FILE"
else
    echo "SERVER_IP=$IP" >> "$ENV_FILE"
fi

echo "SERVER_IP=$IP"