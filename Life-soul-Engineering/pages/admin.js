// pages/admin.js
// 後台統計頁面（密碼保護）

import { useState } from 'react'

export default function AdminPage() {
  const [secret, setSecret] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function fetchStats() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/stats?secret=${secret}`)
      if (res.status === 401) { setError('密碼錯誤'); setLoading(false); return }
      const json = await res.json()
      setData(json)
    } catch {
      setError('讀取失敗')
    }
    setLoading(false)
  }

  const dirColors = { '顯化創造者': '#C9A84C', '淬鍊蛻變者': '#8B7BA8', '覺醒傳承者': '#5B8FA8' }

  return (
    <div style={{ minHeight:'100vh', background:'#0f0f0f', color:'#eee', fontFamily:'sans-serif', padding:'2rem' }}>
      <h1 style={{ color:'#C9A84C', fontSize:24, marginBottom:24 }}>生命總體工程學 · 後台統計</h1>

      {!data && (
        <div style={{ maxWidth:360 }}>
          <input
            type="password"
            placeholder="請輸入管理員密碼"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchStats()}
            style={{ width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid #333',
                     background:'#1a1a1a', color:'#eee', fontSize:14, marginBottom:12 }}
          />
          <button onClick={fetchStats} disabled={loading}
            style={{ width:'100%', padding:'10px', borderRadius:8, border:'none',
                     background:'#C9A84C', color:'#000', fontWeight:700, fontSize:14, cursor:'pointer' }}>
            {loading ? '讀取中...' : '登入查看'}
          </button>
          {error && <p style={{ color:'#f66', marginTop:8 }}>{error}</p>}
        </div>
      )}

      {data && (
        <div>
          {/* 總覽 */}
          <div style={{ display:'flex', gap:16, marginBottom:32, flexWrap:'wrap' }}>
            <div style={{ background:'#1a1a1a', border:'1px solid #333', borderRadius:12,
                          padding:'20px 32px', textAlign:'center' }}>
              <div style={{ fontSize:48, fontWeight:700, color:'#C9A84C' }}>{data.total}</div>
              <div style={{ color:'#888', marginTop:4 }}>總測驗人數</div>
            </div>
            {Object.entries(data.directions).map(([dir, d]) => (
              <div key={dir} style={{ background:'#1a1a1a', border:`1px solid ${dirColors[dir]}44`,
                                      borderRadius:12, padding:'20px 32px', textAlign:'center' }}>
                <div style={{ fontSize:36, fontWeight:700, color: dirColors[dir] }}>{d.count}</div>
                <div style={{ color:'#888', marginTop:4, fontSize:13 }}>{dir}</div>
                <div style={{ color:'#555', fontSize:11, marginTop:2 }}>
                  {data.total ? Math.round(d.count/data.total*100) : 0}%
                </div>
              </div>
            ))}
          </div>

          {/* 各使命詳細 */}
          {Object.entries(data.directions).map(([dir, d]) => (
            <div key={dir} style={{ marginBottom:32 }}>
              <h2 style={{ color: dirColors[dir], fontSize:18, marginBottom:12,
                           borderBottom:`1px solid ${dirColors[dir]}44`, paddingBottom:8 }}>
                {dir}（{d.count} 人）
              </h2>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {Object.entries(d.missions).sort((a,b) => b[1]-a[1]).map(([name, count]) => {
                  const pct = d.count ? Math.round(count/d.count*100) : 0
                  return (
                    <div key={name} style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:120, fontSize:13, color:'#ccc', flexShrink:0 }}>{name}</div>
                      <div style={{ flex:1, background:'#1a1a1a', borderRadius:4, height:20, overflow:'hidden' }}>
                        <div style={{ width:`${pct}%`, height:'100%', background: dirColors[dir],
                                      transition:'width 0.3s', minWidth: count>0?4:0 }} />
                      </div>
                      <div style={{ width:60, fontSize:13, color:'#888', textAlign:'right' }}>
                        {count} 人 ({pct}%)
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* 最近 7 天 */}
          <div>
            <h2 style={{ color:'#C9A84C', fontSize:18, marginBottom:12 }}>最近 7 天</h2>
            <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
              {Object.entries(data.daily).reverse().map(([date, count]) => (
                <div key={date} style={{ textAlign:'center', flex:1 }}>
                  <div style={{ background:'#C9A84C', borderRadius:'4px 4px 0 0',
                                height: `${Math.max(count*8, count>0?4:0)}px`,
                                minHeight: count>0?4:0, marginBottom:4 }} />
                  <div style={{ fontSize:10, color:'#555' }}>{date.slice(5)}</div>
                  <div style={{ fontSize:12, color:'#888' }}>{count}</div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => { setData(null); setSecret('') }}
            style={{ marginTop:32, padding:'8px 20px', borderRadius:8, border:'1px solid #333',
                     background:'transparent', color:'#888', cursor:'pointer' }}>
            登出
          </button>
        </div>
      )}
    </div>
  )
}
