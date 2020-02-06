#!/usr/bin/env bash
docker run --rm --env-file .env -v $PWD:/app/ -w /app/ shuuji3/rwin-bot
