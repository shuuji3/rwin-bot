#!/usr/bin/env bash
docker build -t shuuji3/rwin-bot .
docker run --rm --env-file .env -v $PWD:/app/ -w /app/ shuuji3/rwin-bot