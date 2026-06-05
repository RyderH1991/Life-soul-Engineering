import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { firstName, lastName, email, mission, dirName, report, paid } = req.body
  if (!email || !mission) return res.status(400).json({ error: 'Missing fields' })
  const fullName = `${lastName}${firstName}`

  const paidSections = paid ? `
  <div style="margin-top:24px;">
    <div style="background:#FDF3DC;border-left:3px solid #C9A84C;padding:12px 16px;margin-bottom:16px;border-radius:0 8px 8px 0;">
      <p style="font-size:11px;color:#8B6914;letter-spacing:.1em;margin:0 0 4px;font-weight:500;">完整報告 · 已解鎖</p>
    </div>
    ${[
      ['靈魂自我保護與枷鎖', report.protection],
      ['工作行為能力', report.workAbility],
      ['適合工作類型', report.workType],
      ['財富卡點', report.wealthBlock],
      ['顯化承載物', report.manifestation],
      ['溝通風格', report.commStyle],
      ['社交地雷', report.socialLandmine],
      ['互補特質', report.complementary],
      ['靈魂潛意識盲點', report.blindspot],
    ].filter(([,v])=>v).map(([label, value]) => `
    <div style="background:#fff;border:1px solid #E8E0D0;border-radius:10px;padding:18px 22px;margin-bottom:10px;">
      <p style="font-size:10px;color:#999;letter-spacing:.1em;margin:0 0 8px;">${label}</p>
      <p style="font-size:13px;color:#333;line-height:1.8;margin:0;white-space:pre-line;">${value}</p>
    </div>`).join('')}
  </div>` : `
  <div style="background:#f5f5f5;border:1px dashed #ccc;border-radius:10px;padding:20px;text-align:center;margin-top:24px;">
    <p style="font-size:13px;color:#888;margin:0;">完整報告（頁3-5）需付費 NT$360 解鎖</p>
  </div>`

  const html = `<!DOCTYPE html><html lang="zh-TW"><head><meta charset="UTF-8"><title>生命總體工程學報告</title></head>
<body style="margin:0;padding:0;background:#FAF8F4;font-family:'Georgia',serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:28px;">
    <p style="font-size:10px;letter-spacing:.2em;color:#999;margin:0 0 6px;">LIFE TOTAL ENGINEERING</p>
    <h1 style="font-size:20px;font-weight:400;color:#1a1a1a;margin:0;letter-spacing:.04em;">生命總體工程學</h1>
  </div>
  <div style="background:#fff;border:1px solid #E8E0D0;border-radius:12px;padding:28px;margin-bottom:12px;text-align:center;">
    <p style="font-size:12px;color:#999;margin:0 0 4px;">${dirName}</p>
    <h2 style="font-size:26px;font-weight:400;color:#1a1a1a;margin:0 0 4px;letter-spacing:.04em;">${mission}</h2>
    <p style="font-size:11px;color:#C9A84C;letter-spacing:.08em;margin:0 0 16px;">${report.soulColor||''}</p>
    <p style="font-size:13px;color:#555;line-height:1.8;margin:0;">${report.summary||''}</p>
  </div>
  <div style="background:#FDF3DC;border:1px solid #C9A84C;border-radius:8px;padding:12px 16px;margin-bottom:12px;">
    <p style="font-size:13px;color:#7A6230;margin:0;">親愛的 <strong>${fullName}</strong>，這是你的生命使命報告。</p>
  </div>
  ${[
    ['個性與行為特質', report.traits],
    ['內在性格', report.inner],
    ['核心動力', report.coreDrive],
    ['靈魂在地球的挑戰', report.challenges],
    ['執行使命的方式', report.mission],
  ].filter(([,v])=>v).map(([label, value]) => `
  <div style="background:#fff;border:1px solid #E8E0D0;border-radius:10px;padding:18px 22px;margin-bottom:10px;">
    <p style="font-size:10px;color:#999;letter-spacing:.1em;margin:0 0 8px;">${label}</p>
    <p style="font-size:13px;color:#333;line-height:1.8;margin:0;white-space:pre-line;">${value}</p>
  </div>`).join('')}
  ${paidSections}
  <div style="text-align:center;margin-top:28px;padding-top:20px;border-top:1px solid #E8E0D0;">
    <p style="font-size:11px;color:#999;margin:0;">生命總體工程學 · 精準定位你在這一生中真正要完成的事</p>
  </div>
</div></body></html>`

  try {
    await resend.emails.send({ from:'onboarding@resend.dev', to:email, subject:`${fullName}，你的生命使命：${mission}`, html })
    res.status(200).json({ success: true })
  } catch(err) {
    console.error(err)
    res.status(500).json({ error:'Email failed' })
  }
}
