# next（`@hono/cli@0.2.0-next.9`）

`npm i @hono/cli@next` で入る、AI コーディングエージェント向けにチューニングされた Hono CLI をデモします。
以降のコマンドはすべてこのディレクトリで実行します。

```bash
cd next
npx hono --version   # 0.2.0-next.9
npx hono --help
```

next では全コマンドが JSON で出力されます。

- 成功: `{ "ok": true, "data": ... }`（exit code 0）
- 失敗: `{ "ok": false, "error": { "code", "message", "suggestions" } }`（exit code 1）

## 0. 破壊的変更の確認

`docs` / `search` / `serve` は削除されています。

```bash
npx hono docs
```

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_ARGUMENTS",
    "message": "unknown command 'docs'",
    "suggestions": ["Check the usage: hono <command> --help"]
  }
}
```

## 1. `hono batch`

```bash
cat > batch/users.jsonl <<'EOF'
{"path":"/users","expect":{"status":200}}
{"method":"POST","path":"/users","headers":{"Content-Type":"application/json"},"body":{"name":"Momo"},"expect":{"status":201,"body":{"name":"Momo"}},"save":{"id":".id"}}
{"path":"/users/{{id}}","expect":{"status":200,"body":{"name":"Momo"}}}
{"method":"DELETE","path":"/users/{{id}}","expect":{"status":204}}
{"path":"/users/{{id}}","expect":{"status":404}}
EOF
```

```bash
npx hono batch batch/users.jsonl --compact
```

```json
{"ok":true,"data":{"steps":[],"summary":{"total":5,"passed":5,"failed":0}}}
```

`--compact` を外すと全ステップの結果が出力されます。

```bash
npx hono batch batch/users.jsonl
```

### 失敗するケース

[`batch/users-fail.jsonl`](./batch/users-fail.jsonl) は期待値が間違っているシナリオです。
`diff` に何が違うのかが具体的に出力されます。

```bash
npx hono batch batch/users-fail.jsonl --compact
```

```
"diff": ["body.name: expected \"Bob\", got \"Alice\""]
"diff": ["status: expected 2xx or 3xx, got 404 (set expect.status to accept it)"],
"suggestions": ["See which routes matched: hono request /users/999 --trace"]
```

## 2. `hono snapshot`

```bash
npx hono snapshot
```

```
{"path":"/","expect":{"status":200,"body":"Hello Hono!"}}
{"path":"/users","expect":{"status":200,"body":[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}]}}
{"path":"/users/:id"}
{"method":"POST","path":"/users"}
{"method":"DELETE","path":"/users/:id"}
{"path":"/files/hello.txt","expect":{"status":200,"body":"Hello from Hono!\n"}}
{"path":"/__no_such_path__","expect":{"status":404,"body":"404 Not Found"}}
```

パラメータを持たない GET の route は実際にリクエストされ、その結果が `expect` になります。
パラメータ付きの route や GET 以外は`expect` 無しで出力されます（自分で埋める前提）。

## 3. `hono request`

current の書き方（`-P`）で実行すると、エラーが正しいコマンドを教えてくれることを確認します。

```bash
npx hono request -P /users
```

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_ARGUMENTS",
    "message": "unknown option '-P'",
    "suggestions": ["The path is the first argument: hono request /api/users"]
  }
}
```

suggestion の通りに実行します。

```bash
npx hono request /users
```

```json
{
  "ok": true,
  "data": {
    "status": 200,
    "headers": { "content-type": "application/json" },
    "body": [
      { "id": 1, "name": "Alice" },
      { "id": 2, "name": "Bob" }
    ]
  }
}
```

### その他のオプション

```bash
# POST。--compact でヘッダー無しの1行 JSON
npx hono request /users -X POST \
  -H 'Content-Type: application/json' \
  -d '{"name":"Carol"}' --compact

# --trace: どの route がマッチしてレスポンスを返したか
npx hono request /users/999 --trace --compact

# --plain: 人間向けの表示（-i / -I は --plain と併用）
npx hono request /users/1 --plain -i

# stdin からアプリを渡す（app は定義済み）
echo 'app.get("/hello", (c) => c.json({ ok: true }))' | npx hono request /hello -
```
