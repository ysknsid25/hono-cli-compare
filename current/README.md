# current（`@hono/cli@0.1.11`）

latest の Hono CLI が持つ5つのサブコマンドをデモします。
以降のコマンドはすべてこのディレクトリで実行します。

```bash
cd current
npx hono --version   # 0.1.11
npx hono --help
```

## 1. `hono docs`

```bash
# トップ
npx hono docs

# パスを指定
npx hono docs /docs/concepts/motivation
```

## 2. `hono search`

```bash
# JSON で出力（AI 向け）
npx hono search middleware

# 人間向けの表示、件数を3件に
npx hono search middleware -l 3 -p
```

結果の `Command:` に表示される `hono docs ...` をそのまま実行すると、該当ページを読めます。

```bash
npx hono docs /docs/guides/middleware
```

## 3. `hono request`

パスは `-P` で指定します（デフォルトのエントリは `src/index.ts`）。

```bash
# GET
npx hono request -P /users
npx hono request -P /users/1

# POST
npx hono request -P /users -X POST \
  -H 'Content-Type: application/json' \
  -d '{"name":"Carol"}'

# ステータス・ヘッダーを含めて JSON で出力
npx hono request -P /users/1 -J
```

curl ライクなオプション:

```bash
# -i: ステータスとヘッダーを含めて出力
npx hono request -P /users/1 -i

# -I: ステータスとヘッダーのみ
npx hono request -P /users/1 -I

# -o: ファイル名を指定して保存
npx hono request -P /files/hello.txt -o out.txt

# -O: リモートのファイル名（hello.txt）で保存
npx hono request -P /files/hello.txt -O
cat hello.txt
```

`-w` を付けるとファイル変更を監視してリクエストを再送します。

```bash
npx hono request -P / -w
# 別ターミナルで src/index.ts の 'Hello Hono!' を書き換えると、自動で再送される
```

## 4. `hono serve`

```bash
npx hono serve src/index.ts --show-routes -p 3000
```

起動時に登録済みの route 一覧が表示されます。

```
GET     /
GET     /users
GET     /users/:id
POST    /users
DELETE  /users/:id
GET     /files/hello.txt
Listening on http://localhost:3000
```

別ターミナルからアクセスして確認し、`Ctrl+C` で終了します。

```bash
curl localhost:3000/users
```

## 5. `hono optimize`

```bash
npx hono optimize -m
```

```
[Optimized]
  Router: PreparedRegExpRouter
  Removed:
    Context response APIs (html, redirect)
    Hono APIs (route, mount, fire)
  Output: dist/index.js (11.02 KB)
```

## 後片付け

```bash
rm -rf dist hello.txt out.txt
```
