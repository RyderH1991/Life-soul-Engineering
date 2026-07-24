// pages/api/track-result.js
// 記錄每次測驗結果到 Upstash Redis

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { mission, direction } = req.body
  if (!mission || !direction) return res.status(400).json({ error: 'missing fields' })

  try {
    const url = process.env.KV_REST_API_URL
    const token = process.env.KV_REST_API_TOKEN

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }

    // 總人數 +1
    await fetch(`${url}/incr/stats:total`, { method: 'POST', headers })

    // 使命人數 +1
    await fetch(`${url}/incr/stats:mission:${encodeURIComponent(mission)}`, { method: 'POST', headers })

    // 方向人數 +1
    await fetch(`${url}/incr/stats:direction:${encodeURIComponent(direction)}`, { method: 'POST', headers })

    // 記錄日期（每日統計）
    const today = new Date().toISOString().split('T')[0]
    await fetch(`${url}/incr/stats:daily:${today}`, { method: 'POST', headers })

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('track-result error:', err)
    return res.status(500).json({ error: 'server error' })
  }
}
