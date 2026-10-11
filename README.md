# hono-cli-compare

「Hono CLI の これまで と これから」（Hono Conference 2026）のデモ用リポジトリです。
npm workspaces で `@hono/cli` の latest と `@next` を隔離し、同じ Hono アプリに対してコマンドを比較できるようにしています。

| workspace | `@hono/cli` | デモするコマンド | 手順 |
| --- | --- | --- | --- |
| `current` | `0.1.11`（latest） | `docs` / `search` / `request` / `serve` / `optimize` | [current/README.md](./current/README.md) |
| `next` | `0.2.0-next.9`（next） | `request` / `batch` / `snapshot` | [next/README.md](./next/README.md) |

## 構成

```
.
├── package.json          # workspaces: ["current", "next"]
├── current/
│   ├── package.json      # @hono/cli@0.1.11
│   └── src/index.ts      # デモ用 Hono アプリ
└── next/
    ├── package.json      # @hono/cli@0.2.0-next.9
    ├── src/index.ts      # current と同じアプリ
    └── batch/            # hono batch 用の JSONL
```

`current` の `@hono/cli` はルートの `node_modules` に、`next` の `@hono/cli` は `next/node_modules` に入るため、各ディレクトリで `npx hono` を実行するとそれぞれのバージョンが使われます。

## セットアップ

```bash
npm install
```

バージョンを確認します。

```bash
cd current && npx hono --version   # 0.1.11
cd ../next && npx hono --version   # 0.2.0-next.9
```

ルートから実行したい場合は `-w` でワークスペースを指定します。

```bash
npm exec -w current -- hono --version
npm exec -w next -- hono --version
```

## デモ用アプリ

`current/src/index.ts` と `next/src/index.ts` は同じ内容の、インメモリのユーザー CRUD アプリです。

| Method | Path | 内容 |
| --- | --- | --- |
| GET | `/` | `Hello Hono!` |
| GET | `/users` | ユーザー一覧 |
| GET | `/users/:id` | ユーザー取得（いなければ 404） |
| POST | `/users` | ユーザー作成（201） |
| DELETE | `/users/:id` | ユーザー削除（204） |
| GET | `/files/hello.txt` | バイナリレスポンス（`-o` / `-O` の確認用） |

## 破壊的変更のまとめ

| | current（0.1.11） | next（0.2.0-next.9） |
| --- | --- | --- |
| `hono docs` | あり | **削除** |
| `hono search` | あり | **削除** |
| `hono serve` | あり | **削除** |
| `hono request` のパス指定 | `-P /users` | 第1引数 `hono request /users` |
| `hono request` の出力 | レスポンスボディ（`-J` で JSON） | 常に `{ "ok", "data" }` の JSON（`--plain` で人間向け） |
| エラー時 | 通常のエラーメッセージ | `{ "ok": false, "error": { "code", "message", "suggestions" } }` |
| `hono batch` / `hono snapshot` | なし | **追加** |

next では他に `agent-context` / `routes` / `benchmark` / `ssg` も追加されています（`npx hono --help` で確認できます）。
