# rwin-bot

Rwin という部屋予約システムのラッパーです。Rwin 自体をできるだけ操作せずにストレスフリーで部屋を予約できるようにするために作りました。

## Components

### save-schedules

Puppeteer を使って、Rwin に登録されている今日から 1 ヶ月間のスケジュールを定期的にデータベースに保存します。

### api-server

Express.js を使って、データベースに保存されたデータを REST API として公開します。

### web

Vue.js で作られた Web UI です。スケジュールの閲覧と新規スケジュールの登録ができます。

### register-schedule

Puppeteer を使って、Web UI からリクエストした新規スケジュールの登録作業を自動で行います。

## Architecture

![rwin-bot Architecture](architecture.svg)
