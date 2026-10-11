import { Hono } from 'hono'

type User = { id: number; name: string }

const app = new Hono()

let nextId = 3
const users: User[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
]

app.get('/', (c) => c.text('Hello Hono!'))

app.get('/users', (c) => c.json(users))

app.get('/users/:id', (c) => {
  const user = users.find((u) => u.id === Number(c.req.param('id')))
  if (!user) return c.json({ message: 'Not Found' }, 404)
  return c.json(user)
})

app.post('/users', async (c) => {
  const { name } = await c.req.json<{ name: string }>()
  const user = { id: nextId++, name }
  users.push(user)
  return c.json(user, 201)
})

app.delete('/users/:id', (c) => {
  const index = users.findIndex((u) => u.id === Number(c.req.param('id')))
  if (index === -1) return c.json({ message: 'Not Found' }, 404)
  users.splice(index, 1)
  return c.body(null, 204)
})

// バイナリレスポンス（-o / -O の確認用）
app.get('/files/hello.txt', (c) => {
  c.header('Content-Type', 'application/octet-stream')
  return c.body(new TextEncoder().encode('Hello from Hono!\n'))
})

export default app
