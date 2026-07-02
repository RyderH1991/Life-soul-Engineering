import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { DIRS, REPORTS } from '../lib/data'
import { STATIC_REPORTS } from '../lib/staticReports'
import { MISSION_OILS, CHAKRA_DATA, OIL_ELEMENTS } from '../lib/oilData'
import { SoulCard } from '../lib/svgUtils'

const UNLOCK_CODE = process.env.NEXT_PUBLIC_UNLOCK_CODE || 'LUCKY111'

function Tag({ label }) {
  return <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:99, fontSize:11, background:'var(--color-background-secondary)', border:'0.5px solid var(--color-border-tertiary)', color:'var(--color-text-secondary)', margin:'3px 3px 3px 0' }}>{label}</span>
}

function Section({ label, value, color }) {
  if (!value) return null
  return (
    <div style={{ background:'var(--color-background-primary)', border:'0.5px solid var(--color-border-tertiary)', borderRadius:'var(--border-radius-lg)', padding:'1rem 1.1rem', position:'relative', overflow:'hidden', marginBottom:8 }}>
      <div style={{ position:'absolute', top:0, left:0, width:2, height:'100%', background:color }} />
      <p style={{ fontSize:10, color:'var(--color-text-tertiary)', letterSpacing:'.08em', marginBottom:5, fontFamily:"'Cinzel',serif" }}>{label}</p>
      <p style={{ fontSize:13, color:'var(--color-text-primary)', lineHeight:1.75, whiteSpace:'pre-wrap', margin:0 }}>{value}</p>
    </div>
  )
}

function PageHeader({ num, title, subtitle, free }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', paddingBottom:'.75rem', borderBottom:'0.5px solid var(--color-border-tertiary)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:28, height:28, borderRadius:'50%', background:'#FDF3DC', border:'0.5px solid #C9A84C', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <span style={{ fontFamily:"'Cinzel',serif", fontSize:11, fontWeight:500, color:'#8B6914' }}>{num}</span>
        </div>
        <div>
          <p style={{ fontFamily:"'Cinzel',serif", fontSize:13, fontWeight:500, color:'var(--color-text-primary)', margin:0 }}>{title}</p>
          {subtitle && <p style={{ fontSize:11, color:'var(--color-text-tertiary)', margin:0, marginTop:2 }}>{subtitle}</p>}
        </div>
      </div>
      {free !== undefined && (
        <span style={{ fontSize:10, padding:'2px 8px', borderRadius:99, background: free ? '#EBF5E0' : '#FDF3DC', color: free ? '#3B6D11' : '#7A6230', border:`0.5px solid ${free ? '#97C459' : '#C9A84C'}`, fontFamily:"'Cinzel',serif" }}>
          {free ? '免費' : '付費解鎖'}
        </span>
      )}
    </div>
  )
}

export default function Report() {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [page, setPage] = useState(1)
  const [unlocked, setUnlocked] = useState(false)
  const [code, setCode] = useState('')
  const [codeErr, setCodeErr] = useState('')
  const [sending, setSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('soulReport')
    if (stored) {
      const parsed = JSON.parse(stored)
      setData(parsed)
      if (!parsed.report?.inner) generateFullReport(parsed)
    } else { router.push('/') }
  }, [])

  const generateFullReport = async (d) => {
    // 優先使用靜態報告
    if (STATIC_REPORTS && STATIC_REPORTS[d.mission]) {
      const newData = { ...d, report: STATIC_REPORTS[d.mission] }
      setData(newData)
      sessionStorage.setItem('soulReport', JSON.stringify(newData))
      setGenerating(false)
      return
    }
    setGenerating(true)
    const dir = DIRS[d.dir - 1]
    const prompt = `你是生命使命解讀師。根據以下資訊，用溫暖洞察的繁體中文生成完整報告。

使命：${d.mission}
方向：${dir.name}（${dir.desc}）

回傳純JSON，不要markdown：
{"summary":"2-3句使命本質描述","soulColor":"靈魂色彩名稱","traits":"4-5個個性特質，每點·開頭換行","inner":"內在性格：2-3句描述這個靈魂內部的真實樣貌","coreDrive":"核心動力：1-2句，什麼讓他最深層地驅動","behaviorTags":"5-7個外在行為標籤，格式：標籤1,標籤2,標籤3","challenges":"靈魂在地球的挑戰：3-4點，每點·開頭換行","missionExec":"執行使命的方式：3-4個具體方法，每點·開頭換行","protection":"靈魂自我保護與枷鎖：3-4點，每點·開頭換行","workAbility":"工作行為能力：3-4個核心能力，每點·開頭換行","workType":"適合工作類型：5-6種，格式：職業1,職業2,職業3","love":"愛情與親密關係：3-4點，每點·開頭換行","wealthBlock":"財富卡點：3-4點，每點·開頭換行","manifestation":"顯化承載物：5-7個物品，格式：物品1,物品2,物品3","mentor":"貴人的種類：3-4種，每點·開頭換行","commStyle":"溝通風格：3-4個特點，每點·開頭換行","socialLandmine":"社交地雷：3-4個，每點·開頭換行","complementary":"互補特質：2-3種互補使命及原因，每點·開頭換行","blindspot":"靈魂潛意識盲點：3-4點，每點·開頭換行"}

語言真實洞察，讓人感到「被看見」而非「被算命」。`

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 2000, messages: [{ role: 'user', content: prompt }] })
      })
      const apiData = await res.json()
      const text = apiData.content.map(x => x.text || '').join('')
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
      const newData = { ...d, report: parsed }
      setData(newData)
      sessionStorage.setItem('soulReport', JSON.stringify(newData))
    } catch (e) { console.error(e) }
    setGenerating(false)
  }

  const tryUnlock = useCallback(() => {
    if (code.trim().toUpperCase() === UNLOCK_CODE.toUpperCase()) {
      setUnlocked(true); setCodeErr(''); setPage(4)
    } else { setCodeErr('解鎖碼不正確，請確認付款後再試') }
  }, [code])

  const sendEmail = async () => {
    if (!data) return
    setSending(true)
    const dir = DIRS[data.dir - 1]
    try {
      const res = await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: data.userInfo.firstName, lastName: data.userInfo.lastName, email: data.userInfo.email, mission: data.mission, dirName: dir.name, report: data.report, paid: unlocked })
      })
      if (res.ok) setEmailSent(true)
    } catch (e) {}
    setSending(false)
  }

  if (!data) return <div style={{ textAlign:'center', padding:'4rem', fontFamily:'var(--font-sans)', color:'var(--color-text-secondary)' }}>載入中...</div>

  const dir = DIRS[data.dir - 1]
  const rpt = data.report || {}
  const baseReport = REPORTS[data.mission] || REPORTS['豐盛成就者']
  const { color, bg, crystal } = baseReport
  const oils = MISSION_OILS[data.mission] || {}
  const chakra = CHAKRA_DATA[data.mission] || {}
  const fullName = `${data.userInfo.lastName}${data.userInfo.firstName}`
  const behaviorTags = (rpt.behaviorTags || '').split(',').map(t => t.trim()).filter(Boolean)
  const workTypes = (rpt.workType || '').split(',').map(t => t.trim()).filter(Boolean)
  const manifestItems = (rpt.manifestation || '').split(',').map(t => t.trim()).filter(Boolean)

  // Page tabs config
  const freeTabs = [1,2,3]
  const paidTabs = unlocked ? [4,5] : []
  const allTabs = [...freeTabs, ...paidTabs]

  return (
    <>
      <Head>
        <title>生命使命報告 · {data.mission}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500&family=Noto+Serif+TC:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>
      <main style={{ maxWidth:680, margin:'0 auto', padding:'2rem 1.25rem', fontFamily:"'Noto Serif TC',serif" }}>

        {/* Top bar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {allTabs.map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ padding:'4px 12px', borderRadius:99, fontSize:11, cursor:'pointer', fontFamily:"'Cinzel',serif", background: page===p ? '#C9A84C' : 'var(--color-background-secondary)', color: page===p ? '#fff' : 'var(--color-text-secondary)', border:`0.5px solid ${page===p ? '#8B6914' : 'var(--color-border-tertiary)'}` }}>P{p}</button>
            ))}
            {!unlocked && (
              <button onClick={() => setPage('pay')} style={{ padding:'4px 12px', borderRadius:99, fontSize:11, cursor:'pointer', background: page==='pay' ? '#C9A84C' : 'var(--color-background-secondary)', color: page==='pay' ? '#fff' : 'var(--color-text-tertiary)', border:'0.5px solid var(--color-border-tertiary)', fontFamily:"'Cinzel',serif" }}>+ 解鎖</button>
            )}
          </div>
          {emailSent
            ? <span style={{ fontSize:12, color:'#2A8A6E' }}>✓ 已寄送</span>
            : <button onClick={sendEmail} disabled={sending} style={{ fontSize:11, padding:'4px 10px', borderRadius:'var(--border-radius-md)', background:'#FDF3DC', color:'#7A6230', border:'0.5px solid #C9A84C', cursor:'pointer' }}>{sending ? '寄送中...' : '寄送報告'}</button>
          }
        </div>

        {generating && (
          <div style={{ textAlign:'center', padding:'1.25rem', border:'0.5px solid var(--color-border-tertiary)', borderRadius:'var(--border-radius-lg)', background:'var(--color-background-secondary)', marginBottom:'1rem' }}>
            <p style={{ fontSize:13, color:'var(--color-text-secondary)', margin:0 }}>正在生成完整報告，請稍候...</p>
          </div>
        )}

        {/* ══ PAGE 1 · 免費 ══ */}
        {page === 1 && (
          <div>
            <PageHeader num="1" title="靈魂使命 · 基礎解析" free={true} />

            {/* Hero */}
            <div style={{ border:'0.5px solid var(--color-border-tertiary)', borderRadius:'var(--border-radius-lg)', overflow:'hidden', background:'var(--color-background-primary)', marginBottom:'1rem' }}>
              <div style={{ padding:'1.5rem', display:'flex', gap:'1.25rem', alignItems:'flex-start' }}>
                <div style={{ flexShrink:0 }}><SoulCard color={color} bg={bg} size={88} /></div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'inline-block', fontSize:10, padding:'2px 10px', borderRadius:99, background:dir.bdgBg, color:dir.bdgColor, border:`0.5px solid ${dir.bdgBorder}`, marginBottom:'.5rem', fontFamily:"'Cinzel',serif", letterSpacing:'.06em' }}>{dir.name}</div>
                  <p style={{ fontSize:12, color:'var(--color-text-tertiary)', letterSpacing:'.04em', margin:'0 0 3px', fontFamily:"'Cinzel',serif" }}>{fullName} 的生命使命</p>
                  <h1 style={{ fontSize:22, fontWeight:500, color:'var(--color-text-primary)', fontFamily:"'Cinzel',serif", letterSpacing:'.04em', margin:'0 0 3px', lineHeight:1.3 }}>{data.mission}</h1>
                  <p style={{ fontSize:11, color:'#C9A84C', letterSpacing:'.08em', margin:'0 0 .6rem', fontFamily:"'Cinzel',serif" }}>{rpt.soulColor || baseReport.soulColor || ''}</p>
                  <p style={{ fontSize:13, color:'var(--color-text-secondary)', lineHeight:1.8, margin:0 }}>{rpt.summary || baseReport.summary}</p>
                </div>
              </div>
              <div style={{ borderTop:'0.5px solid var(--color-border-tertiary)', padding:'.75rem 1.5rem', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#C9A84C', flexShrink:0 }} />
                <div>
                  <p style={{ fontSize:10, color:'var(--color-text-tertiary)', letterSpacing:'.08em', margin:0, fontFamily:"'Cinzel',serif" }}>幸運礦物</p>
                  <p style={{ fontSize:13, color:'var(--color-text-primary)', margin:0 }}>{crystal}</p>
                </div>
              </div>
            </div>

            <Section label="個性與行為特質" value={rpt.traits || baseReport.traits} color={color} />
            <Section label="內在性格" value={rpt.inner} color={color} />
            <Section label="核心動力" value={rpt.coreDrive} color={color} />

            {behaviorTags.length > 0 && (
              <div style={{ background:'var(--color-background-primary)', border:'0.5px solid var(--color-border-tertiary)', borderRadius:'var(--border-radius-lg)', padding:'1rem 1.1rem', marginBottom:8, position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, width:2, height:'100%', background:color }} />
                <p style={{ fontSize:10, color:'var(--color-text-tertiary)', letterSpacing:'.08em', marginBottom:8, fontFamily:"'Cinzel',serif" }}>外在行為標籤</p>
                <div>{behaviorTags.map((t,i) => <Tag key={i} label={t} />)}</div>
              </div>
            )}

            <button onClick={() => setPage(2)} style={{ width:'100%', marginTop:'.5rem', padding:'.65rem', borderRadius:'var(--border-radius-md)', background:'#C9A84C', color:'#fff', border:'0.5px solid #8B6914', fontSize:12, cursor:'pointer', fontFamily:"'Cinzel',serif" }}>下一頁 →</button>
          </div>
        )}

        {/* ══ PAGE 2 · 免費 ══ */}
        {page === 2 && (
          <div>
            <PageHeader num="2" title="使命執行與挑戰" free={true} />
            <Section label="執行使命的方式" value={rpt.missionExec || rpt.mission || baseReport.mission} color={color} />
            <Section label="靈魂在地球的挑戰" value={rpt.challenges} color={color} />

            {/* Chakra */}
            {chakra.main && (
              <div style={{ background:'var(--color-background-primary)', border:'0.5px solid var(--color-border-tertiary)', borderRadius:'var(--border-radius-lg)', padding:'1rem 1.1rem', marginBottom:8, position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, width:2, height:'100%', background:chakra.color || color }} />
                <p style={{ fontSize:10, color:'var(--color-text-tertiary)', letterSpacing:'.08em', marginBottom:6, fontFamily:"'Cinzel',serif" }}>對應脈輪能量</p>
                <p style={{ fontSize:14, fontWeight:500, color:'var(--color-text-primary)', fontFamily:"'Cinzel',serif", marginBottom:5 }}>{chakra.main}</p>
                <p style={{ fontSize:13, color:'var(--color-text-secondary)', lineHeight:1.75, margin:0 }}>{chakra.desc}</p>
              </div>
            )}

            <div style={{ display:'flex', gap:8, marginTop:'.75rem' }}>
              <button onClick={() => setPage(1)} style={{ flex:1, padding:'.6rem', borderRadius:'var(--border-radius-md)', background:'var(--color-background-secondary)', color:'var(--color-text-secondary)', border:'0.5px solid var(--color-border-secondary)', fontSize:12, cursor:'pointer' }}>← 上一頁</button>
              <button onClick={() => setPage(3)} style={{ flex:1, padding:'.6rem', borderRadius:'var(--border-radius-md)', background:'#C9A84C', color:'#fff', border:'0.5px solid #8B6914', fontSize:12, cursor:'pointer', fontFamily:"'Cinzel',serif" }}>下一頁 →</button>
            </div>
          </div>
        )}

        {/* ══ PAGE 3 · 免費 · 元素精油推薦 ══ */}
        {page === 3 && (
          <div>
            <PageHeader num="3" title="元素精油推薦" free={true} />

            <div style={{ border:'0.5px solid var(--color-border-tertiary)', borderRadius:'var(--border-radius-lg)', overflow:'hidden', background:'var(--color-background-primary)', marginBottom:'1rem' }}>
              <div style={{ padding:'1rem 1.25rem', borderBottom:'0.5px solid var(--color-border-tertiary)', background:'var(--color-background-secondary)', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background:'#C9A84C', flexShrink:0 }} />
                <span style={{ fontSize:13, fontWeight:500, color:'#C9A84C', fontFamily:"'Cinzel',serif" }}>{rpt.oilElement || '推薦複方精油'}</span>
                <span style={{ fontSize:10, color:'var(--color-text-tertiary)', marginLeft:'auto' }}>推薦複方</span>
              </div>
              <div style={{ padding:'1rem 1.25rem' }}>
                <p style={{ fontSize:13, color:'var(--color-text-primary)', margin:0, lineHeight:1.85 }}>{rpt.oilReason || '根據你的靈魂使命能量，為你配對最適合的元素複方精油。'}</p>
              </div>
            </div>

            {/* Paywall teaser */}
            {!unlocked && (
              <div style={{ border:'0.5px solid #C9A84C', borderRadius:'var(--border-radius-lg)', background:'var(--color-background-secondary)', padding:'1.25rem', textAlign:'center', marginBottom:'.75rem' }}>
                <p style={{ fontSize:12, fontWeight:500, color:'var(--color-text-primary)', marginBottom:'.4rem', fontFamily:"'Cinzel',serif" }}>解鎖完整報告 · 12 個深度模組</p>
                <p style={{ fontSize:11, color:'var(--color-text-tertiary)', lineHeight:1.7, marginBottom:'.85rem' }}>靈魂自我保護・工作與事業・愛情親密關係・財富卡點・顯化承載物<br />貴人種類・溝通風格・社交地雷・互補特質・靈魂潛意識盲點</p>
                <button onClick={() => setPage('pay')} style={{ padding:'.55rem 1.5rem', borderRadius:'var(--border-radius-md)', background:'#C9A84C', color:'#fff', border:'0.5px solid #8B6914', fontSize:13, cursor:'pointer', fontFamily:"'Cinzel',serif", fontWeight:500 }}>
                  解鎖完整報告 · NT$360
                </button>
              </div>
            )}

            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setPage(2)} style={{ flex:1, padding:'.6rem', borderRadius:'var(--border-radius-md)', background:'var(--color-background-secondary)', color:'var(--color-text-secondary)', border:'0.5px solid var(--color-border-secondary)', fontSize:12, cursor:'pointer' }}>← 上一頁</button>
              {unlocked && <button onClick={() => setPage(4)} style={{ flex:1, padding:'.6rem', borderRadius:'var(--border-radius-md)', background:'#C9A84C', color:'#fff', border:'0.5px solid #8B6914', fontSize:12, cursor:'pointer', fontFamily:"'Cinzel',serif" }}>下一頁 →</button>}
            </div>
          </div>
        )}

        {/* ══ PAYWALL ══ */}
        {page === 'pay' && (
          <div>
            <PageHeader num="+" title="解鎖完整報告" subtitle="NT$360 · 永久查看" />
            <div style={{ border:'0.5px solid var(--color-border-tertiary)', borderRadius:'var(--border-radius-lg)', padding:'1.25rem', background:'var(--color-background-primary)', marginBottom:'1rem' }}>
              {['靈魂自我保護與枷鎖','工作與事業（行為能力・適合職業）','愛情與親密關係','財富卡點','顯化承載物','貴人的種類','溝通風格','社交地雷','互補特質','靈魂潛意識盲點','溝通風格・社交地雷・互補特質'].slice(0,10).map((item,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
                  <div style={{ width:5, height:5, borderRadius:'50%', background:'#C9A84C', flexShrink:0 }} />
                  <span style={{ fontSize:13, color:'var(--color-text-secondary)' }}>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ border:'0.5px solid #C9A84C', borderRadius:'var(--border-radius-lg)', padding:'1.25rem', background:'#FDF3DC', marginBottom:'1rem' }}>
              <p style={{ fontSize:11, color:'#8B6914', marginBottom:'.6rem', fontFamily:"'Cinzel',serif", letterSpacing:'.04em' }}>步驟 1 · 完成付款</p>
              {/* ══ 付款方式 ══ 取代原本的付款區塊 ══ */}

{/* 付款按鈕群組 */}
<div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', marginBottom:'0.5rem' }}>

  {/* PayPal */}
  <a href="https://paypal.me/dianzhuh2019?country.x=TW&locale.x=zh_TW"
     target="_blank" rel="noopener noreferrer"
     style={{
       display:'block', textAlign:'center',
       padding:'0.75rem', borderRadius:'var(--border-radius-md)',
       background:'#003087', color:'#fff',
       fontSize:14, fontWeight:700, textDecoration:'none',
       letterSpacing:'0.03em'
     }}>
    💳 PayPal 付款 NT$360
  </a>

  {/* 銀行匯款 - 點擊展開 */}
  <details style={{ borderRadius:'var(--border-radius-md)', overflow:'hidden' }}>
    <summary style={{
      display:'block', textAlign:'center',
      padding:'0.75rem', cursor:'pointer',
      background:'#1a1a2e', color:'#fff',
      fontSize:14, fontWeight:700,
      letterSpacing:'0.03em', listStyle:'none',
      userSelect:'none'
    }}>
      🏦 銀行匯款 NT$360　▼
    </summary>
    <div style={{
      background:'#0f0f1a',
      border:'1px solid #333',
      borderTop:'none',
      borderRadius:'0 0 var(--border-radius-md) var(--border-radius-md)',
      padding:'1rem 1.25rem',
      fontSize:13, lineHeight:2.2, color:'#eee'
    }}>
      <div style={{ display:'flex', justifyContent:'space-between' }}>
        <span style={{ color:'#888' }}>銀行</span>
        <span style={{ color:'#C9A84C', fontWeight:600 }}>中國信託（822）</span>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between' }}>
        <span style={{ color:'#888' }}>帳號</span>
        <span style={{ color:'#C9A84C', fontWeight:600, letterSpacing:'0.1em' }}>190540112892</span>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between' }}>
        <span style={{ color:'#888' }}>戶名</span>
        <span style={{ color:'#C9A84C', fontWeight:600 }}>洪敏傑</span>
      </div>
      <div style={{
        marginTop:'0.6rem', paddingTop:'0.6rem',
        borderTop:'1px solid #333',
        fontSize:11, color:'#888', lineHeight:1.8
      }}>
        匯款後請截圖傳至 LINE 或 Email，確認後將寄出解鎖碼。
      </div>
    </div>
  </details>

  {/* 支付寶 - 點擊展開 */}
  <details style={{ borderRadius:'var(--border-radius-md)', overflow:'hidden' }}>
    <summary style={{
      display:'block', textAlign:'center',
      padding:'0.75rem', cursor:'pointer',
      background:'#1677FF', color:'#fff',
      fontSize:14, fontWeight:700,
      letterSpacing:'0.03em', listStyle:'none',
      userSelect:'none'
    }}>
      支 支付寶掃碼付款　▼
    </summary>
    <div style={{
      background:'#0f0f1a',
      border:'1px solid #333',
      borderTop:'none',
      borderRadius:'0 0 var(--border-radius-md) var(--border-radius-md)',
      padding:'1rem',
      display:'flex', flexDirection:'column', alignItems:'center', gap:'0.75rem'
    }}>
      <img
        src="https://raw.githubusercontent.com/RyderH1991/Life-soul-Engineering/main/alipay-qr.jpg"
        alt="支付寶收款碼"
        style={{
          width:180, height:180,
          borderRadius:8,
          border:'2px solid #1677FF',
          objectFit:'cover'
        }}
      />
      <p style={{ fontSize:12, color:'#aaa', margin:0, textAlign:'center' }}>
        打開支付寶 → 掃一掃 → 付款後截圖回傳確認
      </p>
    </div>
  </details>

  {/* LINE Pay - 申請中（不可點） */}
  <div style={{
    display:'flex', alignItems:'center', gap:'0.5rem'
  }}>
    <div style={{
      flex:1, textAlign:'center',
      padding:'0.75rem', borderRadius:'var(--border-radius-md)',
      background:'#1a2e1a', color:'#666',
      fontSize:14, fontWeight:700,
      letterSpacing:'0.03em', cursor:'not-allowed'
    }}>
      💚 LINE Pay NT$360
    </div>
    <div style={{
      flexShrink:0,
      padding:'0.4rem 0.6rem',
      borderRadius:'var(--border-radius-md)',
      background:'#2a1a00', color:'#C9A84C',
      fontSize:10, fontWeight:600,
      border:'1px solid #C9A84C',
      whiteSpace:'nowrap'
    }}>
      申請中
    </div>
  </div>

</div>


              <p style={{ fontSize:11, color:'#8B6914', margin:0, textAlign:'center' }}>付款後你將收到解鎖碼</p>
            </div>

            <div style={{ border:'0.5px solid var(--color-border-tertiary)', borderRadius:'var(--border-radius-lg)', padding:'1.25rem', background:'var(--color-background-primary)' }}>
              <p style={{ fontSize:11, color:'var(--color-text-secondary)', marginBottom:'.6rem', fontFamily:"'Cinzel',serif", letterSpacing:'.04em' }}>步驟 2 · 輸入解鎖碼</p>
              <div style={{ display:'flex', gap:8 }}>
                <input value={code} onChange={e => setCode(e.target.value)} placeholder="輸入解鎖碼" onKeyDown={e => e.key==='Enter' && tryUnlock()} style={{ flex:1, padding:'.5rem .75rem', borderRadius:'var(--border-radius-md)', border:'0.5px solid var(--color-border-secondary)', background:'var(--color-background-secondary)', color:'var(--color-text-primary)', fontSize:13, letterSpacing:'.08em', outline:'none' }} />
                <button onClick={tryUnlock} style={{ padding:'.5rem 1rem', borderRadius:'var(--border-radius-md)', background:'#C9A84C', color:'#fff', border:'0.5px solid #8B6914', fontSize:12, cursor:'pointer', fontFamily:"'Cinzel',serif", whiteSpace:'nowrap' }}>解鎖</button>
              </div>
              {codeErr && <p style={{ fontSize:11, color:'#A02A2A', margin:'6px 0 0' }}>{codeErr}</p>}
            </div>

            <button onClick={() => setPage(3)} style={{ width:'100%', marginTop:'.75rem', padding:'.6rem', borderRadius:'var(--border-radius-md)', background:'var(--color-background-secondary)', color:'var(--color-text-tertiary)', border:'0.5px solid var(--color-border-secondary)', fontSize:12, cursor:'pointer' }}>← 返回</button>
          </div>
        )}

        {/* ══ PAGE 4 · 付費 ══ */}
        {page === 4 && unlocked && (
          <div>
            <PageHeader num="4" title="靈魂深層解碼" free={false} />
            <Section label="靈魂自我保護與枷鎖" value={rpt.protection} color={color} />

            <div style={{ background:'var(--color-background-primary)', border:'0.5px solid var(--color-border-tertiary)', borderRadius:'var(--border-radius-lg)', padding:'1rem 1.1rem', marginBottom:8, position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, width:2, height:'100%', background:color }} />
              <p style={{ fontSize:10, color:'var(--color-text-tertiary)', letterSpacing:'.08em', marginBottom:6, fontFamily:"'Cinzel',serif" }}>工作與事業</p>
              {rpt.workAbility && <p style={{ fontSize:13, color:'var(--color-text-primary)', lineHeight:1.75, whiteSpace:'pre-wrap', marginBottom:workTypes.length ? 10 : 0 }}>{rpt.workAbility}</p>}
              {workTypes.length > 0 && (<>
                <p style={{ fontSize:10, color:'var(--color-text-tertiary)', letterSpacing:'.08em', margin:'8px 0 6px', fontFamily:"'Cinzel',serif" }}>適合工作類型</p>
                <div>{workTypes.map((t,i) => <Tag key={i} label={t} />)}</div>
              </>)}
            </div>

            <Section label="愛情與親密關係" value={rpt.love || baseReport.love} color={color} />
            <Section label="財富卡點" value={rpt.wealthBlock} color={color} />

            {manifestItems.length > 0 && (
              <div style={{ background:'var(--color-background-primary)', border:'0.5px solid var(--color-border-tertiary)', borderRadius:'var(--border-radius-lg)', padding:'1rem 1.1rem', marginBottom:8, position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, width:2, height:'100%', background:color }} />
                <p style={{ fontSize:10, color:'var(--color-text-tertiary)', letterSpacing:'.08em', marginBottom:8, fontFamily:"'Cinzel',serif" }}>顯化承載物</p>
                <div>{manifestItems.map((t,i) => <Tag key={i} label={t} />)}</div>
              </div>
            )}

            <Section label="貴人的種類" value={rpt.mentor || baseReport.mentor} color={color} />

            <div style={{ display:'flex', gap:8, marginTop:'.75rem' }}>
              <button onClick={() => setPage(3)} style={{ flex:1, padding:'.6rem', borderRadius:'var(--border-radius-md)', background:'var(--color-background-secondary)', color:'var(--color-text-secondary)', border:'0.5px solid var(--color-border-secondary)', fontSize:12, cursor:'pointer' }}>← 上一頁</button>
              <button onClick={() => setPage(5)} style={{ flex:1, padding:'.6rem', borderRadius:'var(--border-radius-md)', background:'#C9A84C', color:'#fff', border:'0.5px solid #8B6914', fontSize:12, cursor:'pointer', fontFamily:"'Cinzel',serif" }}>下一頁 →</button>
            </div>
          </div>
        )}

        {/* ══ PAGE 5 · 付費 ══ */}
        {page === 5 && unlocked && (
          <div>
            <PageHeader num="5" title="關係與潛意識解析" free={false} />
            <Section label="溝通風格" value={rpt.commStyle} color={color} />
            <Section label="社交地雷" value={rpt.socialLandmine} color={color} />
            <Section label="互補特質" value={rpt.complementary} color={color} />
            <Section label="靈魂潛意識盲點" value={rpt.blindspot} color={color} />

            <div style={{ display:'flex', gap:8, marginTop:'.75rem' }}>
              <button onClick={() => setPage(4)} style={{ flex:1, padding:'.6rem', borderRadius:'var(--border-radius-md)', background:'var(--color-background-secondary)', color:'var(--color-text-secondary)', border:'0.5px solid var(--color-border-secondary)', fontSize:12, cursor:'pointer' }}>← 上一頁</button>
              <button onClick={() => setPage(1)} style={{ flex:1, padding:'.6rem', borderRadius:'var(--border-radius-md)', background:'var(--color-background-secondary)', color:'var(--color-text-secondary)', border:'0.5px solid var(--color-border-secondary)', fontSize:12, cursor:'pointer' }}>↺ 從頭看</button>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
