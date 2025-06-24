#!/usr/bin/env bash
ssh root@hetzner "cd spoti-picker && git pull && docker compose -f prod-compose.yml up --build -d"
