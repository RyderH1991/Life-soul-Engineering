import { useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { DIRS, REPORTS, P1_QUESTIONS } from '../lib/data'
import { P2_DATA } from '../lib/questions'
import { SoulCard, DirGlyph } from '../lib/svgUtils'

function calcDir(p1Ans) {
  const t = [0, 0, 0]
  p1Ans.forEach((a, i) => { const s = P1_QUESTIONS[i].sc[a]; t[0]+=s[0]; t[1]+=s[1]; t[2]+=s[2] })
  return t.indexOf(Math.max(...t)) + 1
}

function calcMission(dir, p2Ans) {
  const qs = P2_DATA[dir]
  const scores = new Array(8).fill(0)
  p2Ans.forEach((a, i) => {
    const m = qs[i].sc[a]
    if (m) Object.entries(m).forEach(([k, v]) => { scores[parseInt(k)] += v })
  })
  const ti = scores.indexOf(Math.max(...scores))
  return { primary: DIRS[dir-1].missions[ti], scores, topIdx: ti }
}

function ProgressBar({ phase, p1Len, p2Len }) {
  let pct = 0
  if (phase==='p1') pct = Math.round((p1Len/10)*28)
  else if (phase==='dir_reveal') pct = 30
  else if (phase==='p2') pct = 30+Math.round((p2Len/26)*62)
  else pct = 100
  const pi = {info:0,p1:0,dir_reveal:1,p2:2,loading:3,result:3}[phase]||0
  return (
    <div style={{marginBottom:'1.75rem'}}>
      <div style={{height:1,background:'var(--bdr)'}}>
        <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#8B6914,#C9A84C,#E8C96B)',transition:'width .6s ease'}}/>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:11,color:'var(--ink3)',letterSpacing:'.06em'}}>
          {phase==='info'&&'輸入個人資料'}
          {phase==='p1'&&'PHASE I · 探索方向'}
          {phase==='dir_reveal'&&'靈魂大方向·已揭曉'}
          {phase==='p2'&&'PHASE II · 深度探索'}
          {phase==='loading'&&'解讀中...'}
          {phase==='result'&&'生命使命報告·完成'}
        </span>
        <div style={{display:'flex',gap:8}}>
          {[0,1,2,3].map(i=>(
            <div key={i} style={{width:5,height:5,borderRadius:'50%',background:i<pi?'#8B6914':i===pi?'#C9A84C':'var(--bdr)',transform:i===pi?'scale(1.8)':'none',transition:'all .4s'}}/>
          ))}
        </div>
      </div>
    </div>
  )
}

function Card({children,style={}}) {
  return <div style={{border:'0.5px solid var(--bdr)',borderRadius:'var(--rl)',padding:'1.5rem',background:'var(--sur)',...style}}>{children}</div>
}

function OptBtn({text,selected,onClick}) {
  return (
    <button onClick={onClick} style={{
      background:selected?'var(--gold4)':'var(--sur2)',
      border:`0.5px solid ${selected?'var(--gold)':'var(--bdr)'}`,
      borderRadius:'var(--r)',padding:'.7rem 1rem',fontSize:13,
      color:selected?'var(--gold3)':'var(--ink2)',textAlign:'left',
      lineHeight:1.55,transition:'all .18s',fontFamily:"'Noto Serif TC',serif",
      fontWeight:selected?500:400,cursor:'pointer',width:'100%'
    }}>{text}</button>
  )
}

function NavRow({onPrev,onNext,nextLabel,prevDisabled,nextDisabled}) {
  const base={padding:'.5rem 1.25rem',borderRadius:'var(--r)',fontSize:12,cursor:'pointer',fontFamily:"'Cinzel',serif",letterSpacing:'.04em',transition:'all .15s'}
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'1.25rem'}}>
      <button onClick={onPrev} disabled={prevDisabled} style={{...base,border:'0.5px solid var(--bdr2)',color:'var(--ink2)',background:'var(--sur)'}}>← 上一題</button>
      <button onClick={onNext} disabled={nextDisabled} style={{...base,background:'var(--gold)',color:'#fff',border:'0.5px solid var(--gold3)',fontWeight:500}}>{nextLabel}</button>
    </div>
  )
}

/* ── Info Phase ── */
function InfoPhase({onNext}) {
  const [lastName,setLastName] = useState('')
  const [firstName,setFirstName] = useState('')
  const [email,setEmail] = useState('')
  const [err,setErr] = useState('')

  const valid = lastName.trim() && firstName.trim() && email.includes('@')

  const handleNext = () => {
    if (!valid) { setErr('請填寫所有欄位，並確認 Email 格式正確'); return }
    onNext({lastName:lastName.trim(), firstName:firstName.trim(), email:email.trim()})
  }

  const inputStyle = {
    width:'100%',padding:'.65rem .9rem',fontSize:13,borderRadius:'var(--r)',
    border:'0.5px solid var(--bdr2)',background:'var(--sur2)',color:'var(--ink)',
    fontFamily:"'Noto Serif TC',serif",outline:'none',transition:'border .15s',
    boxSizing:'border-box'
  }
  const labelStyle = {fontSize:11,color:'var(--ink3)',letterSpacing:'.08em',fontFamily:"'Cinzel',serif",display:'block',marginBottom:6}

  return (
    <Card>
      <p style={{fontFamily:"'Cinzel',serif",fontSize:13,color:'var(--ink)',marginBottom:'1.25rem',lineHeight:1.6}}>請先填寫你的資料，測驗結束後報告將寄送到你的信箱。</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
        <div>
          <label style={labelStyle}>姓</label>
          <input style={inputStyle} value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="例：王" />
        </div>
        <div>
          <label style={labelStyle}>名</label>
          <input style={inputStyle} value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="例：小明" />
        </div>
      </div>
      <div style={{marginBottom:16}}>
        <label style={labelStyle}>Email</label>
        <input style={inputStyle} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" />
      </div>
      {err && <p style={{fontSize:12,color:'#A02A2A',marginBottom:12}}>{err}</p>}
      <div style={{borderTop:'0.5px solid var(--bdr)',paddingTop:12,marginTop:4}}>
        <p style={{fontSize:11,color:'var(--ink3)',lineHeight:1.6,margin:'0 0 12px'}}>你的資料僅用於寄送報告，我們承諾保護你的個人隱私。</p>
        <button onClick={handleNext} disabled={!valid} style={{
          width:'100%',padding:'.65rem',borderRadius:'var(--r)',background:'var(--gold)',
          color:'#fff',border:'0.5px solid var(--gold3)',fontSize:13,fontWeight:500,
          cursor:valid?'pointer':'default',fontFamily:"'Cinzel',serif",letterSpacing:'.04em',
          opacity:valid?1:.45,transition:'all .15s'
        }}>開始測評 →</button>
      </div>
    </Card>
  )
}

/* ── Phase 1 ── */
function Phase1({curQ,p1Ans,onSelect,onPrev,onNext}) {
  const q = P1_QUESTIONS[curQ], sel = p1Ans[curQ]
  return (
    <>
      <Card>
        <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:'1rem'}}>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:'.12em',color:'var(--ink3)',padding:'2px 10px',borderRadius:99,border:'0.5px solid var(--bdr)',background:'var(--sur2)'}}>Q{String(curQ+1).padStart(2,'0')}</span>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:10,padding:'2px 10px',borderRadius:99,background:'#FDF3DC',color:'#7A6230',border:'0.5px solid #C9A84C',letterSpacing:'.06em'}}>方向探索</span>
        </div>
        <p style={{fontSize:15,lineHeight:1.75,color:'var(--ink)',marginBottom:'1.25rem',fontFamily:"'Noto Serif TC',serif"}}>{q.q}</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {q.opts.map((o,i)=><OptBtn key={i} text={o} selected={sel===i} onClick={()=>onSelect(i)}/>)}
        </div>
      </Card>
      <NavRow onPrev={onPrev} onNext={onNext} prevDisabled={curQ===0} nextDisabled={sel===undefined} nextLabel={curQ===9?'揭示我的方向 →':'下一題 →'}/>
    </>
  )
}

/* ── Direction Reveal ── */
function DirReveal({dir,onStart}) {
  const d = DIRS[dir-1]
  return (
    <>
      <Card style={{textAlign:'center',padding:'1.75rem 1.5rem'}}>
        <div style={{width:72,height:72,margin:'0 auto 1rem'}}><DirGlyph dirId={dir}/></div>
        <div style={{display:'flex',justifyContent:'center',marginBottom:'.6rem'}}>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:10,padding:'2px 10px',borderRadius:99,background:d.bdgBg,color:d.bdgColor,border:`0.5px solid ${d.bdgBorder}`,letterSpacing:'.06em'}}>{d.name}</span>
        </div>
        <h2 style={{fontSize:19,fontWeight:500,color:'var(--ink)',fontFamily:"'Cinzel',serif",letterSpacing:'.06em',marginBottom:'.5rem'}}>你是一個「{d.name}」</h2>
        <p style={{fontSize:13,color:'var(--ink2)',lineHeight:1.8,marginBottom:'.75rem'}}>{d.desc}</p>
        <p style={{fontSize:11,color:'var(--ink3)',letterSpacing:'.04em'}}>接下來 26 個問題將精準定位你的生命使命</p>
      </Card>
      <div style={{display:'flex',justifyContent:'center',marginTop:'1.25rem'}}>
        <button onClick={onStart} style={{padding:'.5rem 1.5rem',borderRadius:'var(--r)',background:'var(--gold)',color:'#fff',border:'0.5px solid var(--gold3)',fontWeight:500,fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:'.04em',cursor:'pointer'}}>開始深度探索 →</button>
      </div>
    </>
  )
}

/* ── Phase 2 ── */
function Phase2({dir,curQ,p2Ans,onSelect,onPrev,onNext}) {
  const d = DIRS[dir-1], q = P2_DATA[dir][curQ], sel = p2Ans[curQ]
  return (
    <>
      <Card>
        <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:'1rem'}}>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:'.12em',color:'var(--ink3)',padding:'2px 10px',borderRadius:99,border:'0.5px solid var(--bdr)',background:'var(--sur2)'}}>Q{String(curQ+1).padStart(2,'0')}</span>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:10,padding:'2px 10px',borderRadius:99,background:d.bdgBg,color:d.bdgColor,border:`0.5px solid ${d.bdgBorder}`,letterSpacing:'.06em'}}>{d.name}</span>
        </div>
        <p style={{fontSize:15,lineHeight:1.75,color:'var(--ink)',marginBottom:'1.25rem',fontFamily:"'Noto Serif TC',serif"}}>{q.q}</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {q.opts.map((o,i)=><OptBtn key={i} text={o} selected={sel===i} onClick={()=>onSelect(i)}/>)}
        </div>
      </Card>
      <NavRow onPrev={onPrev} onNext={onNext} prevDisabled={curQ===0} nextDisabled={sel===undefined} nextLabel={curQ===25?'生成生命使命報告 ✦':'下一題 →'}/>
    </>
  )
}

/* ── Loading ── */
function Loading() {
  return (
    <div style={{textAlign:'center',padding:'3.5rem 1rem'}}>
      <div style={{width:52,height:52,margin:'0 auto 1.25rem',position:'relative'}}>
        <div style={{width:52,height:52,border:'1px solid var(--bdr)',borderTopColor:'#C9A84C',borderRadius:'50%',animation:'spin1 .8s linear infinite',position:'absolute'}}/>
        <div style={{width:28,height:28,border:'1px solid var(--bdr)',borderBottomColor:'#E8C96B',borderRadius:'50%',animation:'spin2 .5s linear infinite',position:'absolute',top:12,left:12}}/>
      </div>
      <p style={{fontSize:14,fontWeight:500,color:'var(--ink)',fontFamily:"'Cinzel',serif",letterSpacing:'.06em',marginBottom:6}}>正在解讀你的生命藍圖</p>
      <p style={{fontSize:12,color:'var(--ink3)'}}>分析你的 88 個生命印記中...</p>
      <style>{`@keyframes spin1{to{transform:rotate(360deg)}}@keyframes spin2{to{transform:rotate(-360deg)}}`}</style>
    </div>
  )
}

/* ── Report Card ── */
function ReportCard({label,value,color}) {
  return (
    <div style={{background:'var(--sur)',border:'0.5px solid var(--bdr)',borderRadius:'var(--rl)',padding:'1rem 1.1rem',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:0,left:0,width:2,height:'100%',background:color}}/>
      <p style={{fontSize:10,color:'var(--ink3)',letterSpacing:'.06em',marginBottom:6,fontFamily:"'Cinzel',serif"}}>{label}</p>
      <p style={{fontSize:13,color:'var(--ink)',lineHeight:1.7,whiteSpace:'pre-wrap'}}>{value}</p>
    </div>
  )
}

/* ── Result ── */
function Result({mRes,dir,userInfo,onRestart}) {
  const d = DIRS[dir-1]
  const rpt = REPORTS[mRes.primary] || REPORTS['豐盛成就者']
  const fullName = `${userInfo.lastName}${userInfo.firstName}`
  const [emailSent, setEmailSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [emailErr, setEmailErr] = useState('')

  const sendEmail = async () => {
    setSending(true)
    setEmailErr('')
    try {
      const res = await fetch('/api/send-report', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          email: userInfo.email,
          mission: mRes.primary,
          dirName: d.name,
          report: { ...rpt }
        })
      })
      if (res.ok) { setEmailSent(true) }
      else { setEmailErr('寄送失敗，請稍後再試') }
    } catch { setEmailErr('寄送失敗，請稍後再試') }
    setSending(false)
  }

  return (
    <>
      {/* Hero */}
      <div style={{border:'0.5px solid var(--bdr)',borderRadius:'var(--rl)',overflow:'hidden',background:'var(--sur)',marginBottom:'1rem'}}>
        <div style={{padding:'1.5rem',display:'flex',gap:'1.25rem',alignItems:'flex-start'}}>
          <div style={{flexShrink:0,width:96}}><SoulCard color={rpt.color} bg={rpt.bg}/></div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:10,padding:'2px 10px',borderRadius:99,marginBottom:'.6rem',fontFamily:"'Cinzel',serif",letterSpacing:'.06em',background:d.bdgBg,color:d.bdgColor,border:`0.5px solid ${d.bdgBorder}`}}>{d.name}</div>
            <p style={{fontSize:13,color:'var(--ink3)',letterSpacing:'.06em',marginBottom:'.25rem',fontFamily:"'Cinzel',serif"}}>{fullName} 的生命使命</p>
            <h1 style={{fontSize:20,fontWeight:500,color:'var(--ink)',fontFamily:"'Cinzel',serif",letterSpacing:'.04em',marginBottom:'.3rem',lineHeight:1.3}}>{mRes.primary}</h1>
            <p style={{fontSize:11,color:'var(--ink3)',letterSpacing:'.08em',marginBottom:'.6rem',fontFamily:"'Cinzel',serif"}}>{rpt.soulColor}</p>
            <p style={{fontSize:13,color:'var(--ink2)',lineHeight:1.8}}>{rpt.summary}</p>
          </div>
        </div>
      </div>

      {/* Email CTA */}
      <div style={{border:'0.5px solid var(--gold)',borderRadius:'var(--r)',background:'var(--gold4)',padding:'.85rem 1rem',marginBottom:'1rem',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
        <div>
          <p style={{fontSize:12,fontWeight:500,color:'var(--gold3)',margin:'0 0 2px',fontFamily:"'Cinzel',serif"}}>報告寄送到信箱</p>
          <p style={{fontSize:11,color:'var(--gold3)',margin:0,opacity:.8}}>{userInfo.email}</p>
        </div>
        {emailSent ? (
          <span style={{fontSize:12,color:'#2A8A6E',fontWeight:500}}>✓ 已寄送</span>
        ) : (
          <button onClick={sendEmail} disabled={sending} style={{padding:'.4rem 1rem',borderRadius:'var(--r)',background:'var(--gold)',color:'#fff',border:'none',fontSize:12,cursor:'pointer',fontFamily:"'Cinzel',serif",opacity:sending?.6:1,whiteSpace:'nowrap'}}>
            {sending?'寄送中...':'寄送報告'}
          </button>
        )}
        {emailErr && <p style={{fontSize:11,color:'#A02A2A',margin:0,width:'100%'}}>{emailErr}</p>}
      </div>

      {/* Report grid */}
      <p style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:10,padding:'2px 8px',borderRadius:99,background:'var(--gold4)',color:'var(--gold3)',border:'0.5px solid var(--gold)',marginBottom:'.75rem',fontFamily:"'Cinzel',serif",letterSpacing:'.04em'}}>✦ 生命使命解讀報告</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
        <ReportCard label="個性與行為特質" value={rpt.traits} color={rpt.color}/>
        <ReportCard label="執行使命的方式" value={rpt.mission} color={rpt.color}/>
        <ReportCard label="適合的工作方向" value={rpt.work} color={rpt.color}/>
        <ReportCard label="愛情與親密關係" value={rpt.love} color={rpt.color}/>
        <ReportCard label="貴人的種類" value={rpt.mentor} color={rpt.color}/>
        <ReportCard label="財富流入的方式" value={rpt.wealth} color={rpt.color}/>
        <ReportCard label="守護水晶礦石" value={rpt.crystal} color={rpt.color}/>
        <ReportCard label="靈魂守護動物" value={rpt.animal} color={rpt.color}/>
      </div>

      <button onClick={onRestart} style={{width:'100%',padding:'.7rem',borderRadius:'var(--r)',border:'0.5px solid var(--bdr2)',fontSize:11,cursor:'pointer',color:'var(--ink3)',background:'var(--sur2)',marginTop:'.75rem',fontFamily:"'Cinzel',serif",letterSpacing:'.08em'}}>↺ 重新測評</button>
    </>
  )
}

/* ── Main ── */
export default function Home() {
  const [phase, setPhase] = useState('info')
  const [userInfo, setUserInfo] = useState(null)
  const [p1Ans, setP1Ans] = useState([])
  const [dir, setDir] = useState(null)
  const [p2Ans, setP2Ans] = useState([])
  const [curQ, setCurQ] = useState(0)
  const [mRes, setMRes] = useState(null)

  const router = useRouter()
  const handleInfo = useCallback((info) => { setUserInfo(info); setPhase('p1') }, [])
  const selectP1 = useCallback((i) => { setP1Ans(prev=>{ const n=[...prev]; n[curQ]=i; return n }) }, [curQ])
  const selectP2 = useCallback((i) => { setP2Ans(prev=>{ const n=[...prev]; n[curQ]=i; return n }) }, [curQ])

  const nextP1 = useCallback(() => {
    if (curQ<9) { setCurQ(q=>q+1) }
    else { const d=calcDir(p1Ans); setDir(d); setCurQ(0); setPhase('dir_reveal') }
  }, [curQ, p1Ans])

  const startP2 = useCallback(() => { setPhase('p2'); setCurQ(0) }, [])

  const nextP2 = useCallback(() => {
    if (curQ<25) { setCurQ(q=>q+1) }
    else {
      setPhase('loading')
      setTimeout(() => {
        const mRes = calcMission(dir, p2Ans)
        const reportData = { mission: mRes.primary, dir, userInfo }
        sessionStorage.setItem('soulReport', JSON.stringify(reportData))
        router.push('/report')
      }, 1400)
    }
  }, [curQ, dir, p2Ans])

  const restart = useCallback(() => {
    setPhase('info'); setUserInfo(null); setP1Ans([]); setDir(null); setP2Ans([]); setCurQ(0); setMRes(null)
  }, [])

  const prog = { phase, p1Len: p1Ans.length, p2Len: p2Ans.length }

  return (
    <>
      <Head>
        <title>生命總體工程學</title>
        <meta name="description" content="成為自己人生的總工程師——精準定位你在這一生中真正要完成的事"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Noto+Serif+TC:wght@300;400;500&display=swap" rel="stylesheet"/>
      </Head>

      <main style={{maxWidth:680,margin:'0 auto',padding:'2rem 1.25rem',minHeight:'100vh'}}>

        {/* Header */}
        <div style={{textAlign:'center',marginBottom:'2.5rem'}}>
          <p style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:'.2em',color:'var(--ink3)',marginBottom:'.75rem'}}>LIFE TOTAL ENGINEERING</p>
          <h1 style={{fontSize:26,fontWeight:500,color:'var(--ink)',fontFamily:"'Cinzel',serif",letterSpacing:'.04em',marginBottom:'1rem'}}>生命總體工程學</h1>

          {phase === 'info' && (
            <div style={{maxWidth:500,margin:'0 auto',textAlign:'left'}}>
              <p style={{fontSize:16,color:'var(--ink)',lineHeight:1.9,marginBottom:'1rem',fontFamily:"'Noto Serif TC',serif",textAlign:'center',fontStyle:'italic'}}>── 成為自己人生的總工程師</p>
              <p style={{fontSize:13,color:'var(--ink2)',lineHeight:1.9,marginBottom:'1.5rem',fontFamily:"'Noto Serif TC',serif"}}>
                生命，是一場最需要被精密設計的總體工程。我們常在日常盲目奔波，卻忘了從全局視角審視自己的生命結構。<br/><br/>
                本測評結合系統思考與特質解密，可精準透視你的內在基石、能量調度、關係網絡與實踐藍圖。我們將抽象的人生狀態，轉化為可視化的數據圖譜，透過這套系統，你將獲得專屬的迭代建議，找到用最小力氣撬動最大改變的「關鍵槓桿點」，精準定位你在這一生中真正要完成的事，親手設計出兼具豐盛與平衡的理想人生。
              </p>
            </div>
          )}
        </div>

        <ProgressBar {...prog}/>

        {phase==='info' && <InfoPhase onNext={handleInfo}/>}
        {phase==='p1' && <Phase1 curQ={curQ} p1Ans={p1Ans} onSelect={selectP1} onPrev={()=>curQ>0&&setCurQ(q=>q-1)} onNext={nextP1}/>}
        {phase==='dir_reveal' && <DirReveal dir={dir} onStart={startP2}/>}
        {phase==='p2' && <Phase2 dir={dir} curQ={curQ} p2Ans={p2Ans} onSelect={selectP2} onPrev={()=>curQ>0&&setCurQ(q=>q-1)} onNext={nextP2}/>}
        {phase==='loading' && <Loading/>}
        {phase==='result' && mRes && <Result mRes={mRes} dir={dir} userInfo={userInfo} onRestart={restart}/>}
      </main>
    </>
  )
}
