// pages/api/stats.js
// 讀取所有統計數據（需要管理員密碼）

const MISSIONS = {
  '顯化創造者': ['豐盛成就者','原力開拓者','秩序守護者','傳遞教育者','調度實踐者','指引啟蒙者','平衡締結者','和諧凝聚者'],
  '淬鍊蛻變者': ['重塑改革者','冒險淬鍊者','凝靜觀察者','規律循環者','療育蛻變者','蟄伏策畫者','守護調節者','熱力表演者'],
  '覺醒傳承者': ['勝利領導者','孕育培養者','扶持協助者','人際整合者','直覺流動者','儲存傳承者','光之覺醒者','穩固建構者'],
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  // 簡單密碼保護
  const { secret } = req.query
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'unauthorized' })
  }

  try {
    const url = process.env.KV_REST_API_URL
    const token = process.env.KV_REST_API_TOKEN
    const headers = { Authorization: `Bearer ${token}` }

    // 讀取總人數
    const totalRes = await fetch(`${url}/get/stats:total`, { headers })
    const totalData = await totalRes.json()
    const total = parseInt(totalData.result) || 0

    // 讀取各方向
    const directions = {}
    for (const [dir, missions] of Object.entries(MISSIONS)) {
      const dirRes = await fetch(`${url}/get/stats:direction:${encodeURIComponent(dir)}`, { headers })
      const dirData = await dirRes.json()
      directions[dir] = { count: parseInt(dirData.result) || 0, missions: {} }

      for (const m of missions) {
        const mRes = await fetch(`${url}/get/stats:mission:${encodeURIComponent(m)}`, { headers })
        const mData = await mRes.json()
        directions[dir].missions[m] = parseInt(mData.result) || 0
      }
    }

    // 讀取最近 7 天
    const daily = {}
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const dRes = await fetch(`${url}/get/stats:daily:${key}`, { headers })
      const dData = await dRes.json()
      daily[key] = parseInt(dData.result) || 0
    }

    return res.status(200).json({ total, directions, daily })
  } catch (err) {
    console.error('stats error:', err)
    return res.status(500).json({ error: 'server error' })
  }
}
