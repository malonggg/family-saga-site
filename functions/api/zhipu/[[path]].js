// EdgeOne Pages Functions：反代智谱 API
// 密钥存平台环境变量 ZHIPU_KEY（控制台配置），不进前端包
// 本地 dev 由 vite.config.ts 的 proxy 承担同样职责
const UPSTREAM = 'https://open.bigmodel.cn/api/paas/v4'

export async function onRequest({ request, env }) {
  const key = env && (env.ZHIPU_KEY || env.VITE_ZHIPU_KEY)
  if (!key) {
    return new Response(JSON.stringify({ error: { message: '服务端未配置 ZHIPU_KEY' } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const url = new URL(request.url)
  const target = UPSTREAM + url.pathname.replace(/^\/api\/zhipu/, '')

  const headers = new Headers()
  headers.set('Authorization', `Bearer ${key}`)
  headers.set('Content-Type', 'application/json')
  for (const h of ['Accept', 'Accept-Language', 'User-Agent']) {
    const v = request.headers.get(h)
    if (v) headers.set(h, v)
  }

  const body =
    request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer()

  try {
    const upstream = await fetch(target, { method: request.method, headers, body })
    const res = new Response(upstream.body, { status: upstream.status, headers: upstream.headers })
    res.headers.set('Access-Control-Allow-Origin', '*')
    return res
  } catch {
    return new Response(JSON.stringify({ error: { message: 'AI 通道异常，请稍后再试' } }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
