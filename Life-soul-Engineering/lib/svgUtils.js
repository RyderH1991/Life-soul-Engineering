export function hexPts(cx, cy, r) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = Math.PI / 3 * i - Math.PI / 6
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`
  }).join(' ')
}

export function triPts(cx, cy, r) {
  return Array.from({ length: 3 }, (_, i) => {
    const a = Math.PI * 2 / 3 * i - Math.PI / 2
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`
  }).join(' ')
}

export function SoulCard({ color, bg, size = 96 }) {
  const c = color || '#C9A84C'
  const b = bg || '#FDF3DC'
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
      <rect width="100" height="100" rx="12" fill={b} />
      <polygon points={hexPts(50,50,38)} fill="none" stroke={c} strokeWidth="0.8" opacity="0.5" />
      <polygon points={hexPts(50,50,26)} fill="none" stroke={c} strokeWidth="0.5" opacity="0.35" />
      <polygon points={triPts(50,50,20)} fill={c} opacity="0.12" />
      <polygon points={triPts(50,50,20)} fill="none" stroke={c} strokeWidth="0.8" opacity="0.75" />
      <line x1="50" y1="12" x2="50" y2="88" stroke={c} strokeWidth="0.4" opacity="0.2" />
      <line x1="17" y1="31" x2="83" y2="69" stroke={c} strokeWidth="0.4" opacity="0.2" />
      <line x1="83" y1="31" x2="17" y2="69" stroke={c} strokeWidth="0.4" opacity="0.2" />
      <circle cx="50" cy="50" r="6" fill={c} opacity="0.65" />
      <circle cx="50" cy="50" r="10" fill="none" stroke={c} strokeWidth="0.6" opacity="0.45" />
      <circle cx="50" cy="50" r="32" fill="none" stroke={c} strokeWidth="0.3" opacity="0.18" strokeDasharray="3 5" />
    </svg>
  )
}

export function DirGlyph({ dirId, size = 72 }) {
  const colors = { 1: '#C9A84C', 2: '#B5522A', 3: '#3A6B9B' }
  const c = colors[dirId]

  if (dirId === 1) return (
    <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
      <circle cx="36" cy="36" r="32" fill="none" stroke={c} strokeWidth="0.7" opacity="0.28" />
      <polygon points={hexPts(36,36,26)} fill="none" stroke={c} strokeWidth="1" opacity="0.6" />
      <polygon points={hexPts(36,36,14)} fill="none" stroke={c} strokeWidth="0.5" opacity="0.35" />
      <circle cx="36" cy="36" r="5" fill={c} opacity="0.8" />
      {Array.from({length:6},(_,i)=>{const a=Math.PI/3*i-Math.PI/6;return(
        <circle key={i} cx={(36+26*Math.cos(a)).toFixed(1)} cy={(36+26*Math.sin(a)).toFixed(1)} r="2" fill={c} opacity="0.5"/>
      )})}
    </svg>
  )

  if (dirId === 2) return (
    <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
      <polygon points={triPts(36,36,28)} fill="none" stroke={c} strokeWidth="1" opacity="0.65" />
      <polygon points={triPts(36,36,16)} fill="none" stroke={c} strokeWidth="0.6" opacity="0.45" />
      <polygon points={Array.from({length:3},(_,i)=>{const a=Math.PI*2/3*i+Math.PI/6;return`${(36+16*Math.cos(a)).toFixed(1)},${(36+16*Math.sin(a)).toFixed(1)}`;}).join(' ')} fill="none" stroke={c} strokeWidth="0.4" opacity="0.3" />
      <circle cx="36" cy="36" r="5" fill={c} opacity="0.8" />
      <circle cx="36" cy="36" r="22" fill="none" stroke={c} strokeWidth="0.35" strokeDasharray="2 4" opacity="0.35" />
    </svg>
  )

  return (
    <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
      <circle cx="36" cy="36" r="30" fill="none" stroke={c} strokeWidth="0.7" opacity="0.28" />
      <polygon points={hexPts(36,36,22)} fill="none" stroke={c} strokeWidth="0.55" opacity="0.4" />
      {Array.from({length:8},(_,i)=>{const a=Math.PI/4*i;return(
        <line key={i} x1={(36+12*Math.cos(a)).toFixed(1)} y1={(36+12*Math.sin(a)).toFixed(1)} x2={(36+24*Math.cos(a)).toFixed(1)} y2={(36+24*Math.sin(a)).toFixed(1)} stroke={c} strokeWidth="0.5" opacity="0.5"/>
      )})}
      <circle cx="36" cy="36" r="6" fill={c} opacity="0.8" />
      <circle cx="36" cy="36" r="9" fill="none" stroke={c} strokeWidth="0.5" opacity="0.5" />
    </svg>
  )
}
