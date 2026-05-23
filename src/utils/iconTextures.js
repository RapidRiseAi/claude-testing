import * as THREE from 'three'

// ── Icon draw functions: 24-unit SVG coordinate space, ctx translated to (0,0) ─
// Thin crisp icy-white line icons — no fills except small accents
const DRAW = [
  // 0 Dashboard / Analytics
  ctx => {
    ctx.shadowColor = '#c0f0ff'; ctx.shadowBlur = 4
    // Browser window
    ctx.strokeRect(2, 3, 20, 16)
    ctx.beginPath(); ctx.moveTo(2, 7); ctx.lineTo(22, 7); ctx.stroke()
    // Three chart bars inside
    ctx.fillStyle = ctx.strokeStyle
    ctx.fillRect(5, 11, 2.5, 5); ctx.fillRect(9, 9, 2.5, 7); ctx.fillRect(13, 13, 2.5, 3)
    // Tiny sparkline
    ctx.beginPath(); ctx.moveTo(17, 14); ctx.lineTo(18.5, 12); ctx.lineTo(20, 13.5); ctx.stroke()
    // Traffic lights
    ctx.beginPath(); ctx.arc(4.5, 5, 0.8, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(7, 5, 0.8, 0, Math.PI * 2); ctx.fill()
  },
  // 1 IoT / Connected Chip
  ctx => {
    ctx.shadowColor = '#c0f0ff'; ctx.shadowBlur = 4
    ctx.strokeRect(7, 7, 10, 10)
    // Pins
    for (const y of [9.5, 12, 14.5]) {
      ctx.beginPath(); ctx.moveTo(3, y); ctx.lineTo(7, y); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(17, y); ctx.lineTo(21, y); ctx.stroke()
    }
    for (const x of [9.5, 12, 14.5]) {
      ctx.beginPath(); ctx.moveTo(x, 3); ctx.lineTo(x, 7); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(x, 17); ctx.lineTo(x, 21); ctx.stroke()
    }
    // Wifi signal in center
    ctx.beginPath(); ctx.arc(12, 12, 1.2, 0, Math.PI * 2); ctx.fillStyle = ctx.strokeStyle; ctx.fill()
    ctx.beginPath(); ctx.arc(12, 12, 2.8, -Math.PI * 0.75, -Math.PI * 0.25); ctx.stroke()
    ctx.beginPath(); ctx.arc(12, 12, 4.2, -Math.PI * 0.75, -Math.PI * 0.25); ctx.stroke()
  },
  // 2 Client Portal / User Card
  ctx => {
    ctx.shadowColor = '#c0f0ff'; ctx.shadowBlur = 4
    // Card shape
    ctx.beginPath()
    ctx.roundRect ? ctx.roundRect(2, 4, 20, 16, 2) : ctx.strokeRect(2, 4, 20, 16)
    ctx.stroke()
    // Avatar circle
    ctx.beginPath(); ctx.arc(8, 11, 3.5, 0, Math.PI * 2); ctx.stroke()
    // Head
    ctx.beginPath(); ctx.arc(8, 9.5, 1.5, 0, Math.PI * 2); ctx.stroke()
    // Info lines
    ctx.beginPath()
    ctx.moveTo(13.5, 9); ctx.lineTo(20, 9)
    ctx.moveTo(13.5, 12); ctx.lineTo(19, 12)
    ctx.moveTo(13.5, 15); ctx.lineTo(17, 15)
    ctx.stroke()
    // Secure badge
    ctx.fillStyle = ctx.strokeStyle
    ctx.beginPath(); ctx.arc(19, 7, 1.2, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.moveTo(19, 5.8); ctx.lineTo(20.2, 6.5); ctx.lineTo(20.2, 7.5); ctx.lineTo(19, 8.2); ctx.lineTo(17.8, 7.5); ctx.lineTo(17.8, 6.5); ctx.closePath(); ctx.stroke()
  },
  // 3 Integrations / Connected Modules
  ctx => {
    ctx.shadowColor = '#c0f0ff'; ctx.shadowBlur = 4
    // Central hub
    ctx.beginPath(); ctx.arc(12, 12, 2.5, 0, Math.PI * 2); ctx.stroke()
    // Four satellite nodes
    for (const [x, y] of [[4, 4],[20, 4],[4, 20],[20, 20]]) {
      ctx.strokeRect(x - 2, y - 2, 4, 4)
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(12, 12); ctx.stroke()
    }
    // Small dots on connection lines
    ctx.fillStyle = ctx.strokeStyle
    for (const [x, y] of [[4, 4],[20, 4],[4, 20],[20, 20]]) {
      const mx = (x + 12) / 2, my = (y + 12) / 2
      ctx.beginPath(); ctx.arc(mx, my, 0.8, 0, Math.PI * 2); ctx.fill()
    }
  },
  // 4 Automated Workflows
  ctx => {
    ctx.shadowColor = '#c0f0ff'; ctx.shadowBlur = 4
    // Gear outer
    ctx.beginPath(); ctx.arc(12, 12, 6.5, 0, Math.PI * 2); ctx.stroke()
    // Gear center
    ctx.beginPath(); ctx.arc(12, 12, 2.8, 0, Math.PI * 2); ctx.stroke()
    // Gear teeth
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      ctx.beginPath()
      ctx.moveTo(12 + Math.cos(a) * 4.2, 12 + Math.sin(a) * 4.2)
      ctx.lineTo(12 + Math.cos(a) * 8.8, 12 + Math.sin(a) * 8.8)
      ctx.stroke()
    }
    // Flow arrow through center
    ctx.beginPath(); ctx.moveTo(9, 12); ctx.lineTo(15, 12); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(13.2, 10.2); ctx.lineTo(15, 12); ctx.lineTo(13.2, 13.8); ctx.stroke()
  },
  // 5 Custom Software / Code
  ctx => {
    ctx.shadowColor = '#c0f0ff'; ctx.shadowBlur = 4
    // Code brackets
    ctx.lineWidth = ctx.lineWidth * 1.1
    ctx.beginPath()
    ctx.moveTo(14, 19); ctx.lineTo(21, 12); ctx.lineTo(14, 5); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(10, 5); ctx.lineTo(3, 12); ctx.lineTo(10, 19); ctx.stroke()
    // Slash
    ctx.beginPath(); ctx.moveTo(14.5, 3.5); ctx.lineTo(9.5, 20.5); ctx.stroke()
  },
  // 6 Custom Website / Browser
  ctx => {
    ctx.shadowColor = '#c0f0ff'; ctx.shadowBlur = 4
    // Browser frame
    ctx.strokeRect(2, 2.5, 20, 17)
    // Address bar
    ctx.beginPath(); ctx.moveTo(2, 7); ctx.lineTo(22, 7); ctx.stroke()
    // Nav dots
    ctx.fillStyle = ctx.strokeStyle
    for (const x of [5, 8.5]) {
      ctx.beginPath(); ctx.arc(x, 4.75, 1, 0, Math.PI * 2); ctx.fill()
    }
    // Responsive layout lines inside
    ctx.beginPath()
    ctx.moveTo(5, 10); ctx.lineTo(19, 10)
    ctx.moveTo(5, 13); ctx.lineTo(16, 13)
    ctx.moveTo(5, 16); ctx.lineTo(14, 16)
    ctx.stroke()
    // Cursor
    ctx.beginPath(); ctx.moveTo(18, 11.5); ctx.lineTo(18, 17); ctx.lineTo(20, 15); ctx.lineTo(21, 17.5); ctx.lineTo(22, 17); ctx.lineTo(20.5, 14.5); ctx.lineTo(23, 12.5); ctx.closePath(); ctx.stroke()
  },
  // 7 AI Communication / Chatbot
  ctx => {
    ctx.shadowColor = '#c0f0ff'; ctx.shadowBlur = 4
    // Robot head
    ctx.strokeRect(4, 7, 16, 11)
    // Antenna
    ctx.beginPath(); ctx.moveTo(12, 7); ctx.lineTo(12, 4); ctx.stroke()
    ctx.fillStyle = ctx.strokeStyle
    ctx.beginPath(); ctx.arc(12, 3.2, 1.2, 0, Math.PI * 2); ctx.fill()
    // Eyes with glow dots
    ctx.beginPath(); ctx.arc(9, 11.5, 1.8, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.arc(15, 11.5, 1.8, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.arc(9, 11.5, 0.7, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(15, 11.5, 0.7, 0, Math.PI * 2); ctx.fill()
    // Smile
    ctx.beginPath(); ctx.arc(12, 14, 3, 0.2, Math.PI - 0.2); ctx.stroke()
    // Chat bubble tail
    ctx.beginPath(); ctx.moveTo(8, 18); ctx.lineTo(6, 21); ctx.lineTo(11, 18); ctx.stroke()
  },
  // 8 Database
  ctx => {
    ctx.shadowColor = '#c0f0ff'; ctx.shadowBlur = 4
    for (const y of [5.5, 12, 18.5]) {
      ctx.beginPath(); ctx.ellipse(12, y, 8, 2.5, 0, 0, Math.PI * 2); ctx.stroke()
    }
    ctx.beginPath()
    ctx.moveTo(4, 5.5); ctx.lineTo(4, 18.5)
    ctx.moveTo(20, 5.5); ctx.lineTo(20, 18.5)
    ctx.stroke()
    // Active indicator
    ctx.fillStyle = ctx.strokeStyle
    ctx.beginPath(); ctx.arc(16, 12, 1.2, 0, Math.PI * 2); ctx.fill()
  },
  // 9 Cloud Infrastructure
  ctx => {
    ctx.shadowColor = '#c0f0ff'; ctx.shadowBlur = 4
    ctx.beginPath()
    ctx.moveTo(7.5, 18.5); ctx.lineTo(4.5, 18.5)
    ctx.arc(4.5, 14.5, 4, Math.PI * 0.5, Math.PI * 1.5)
    ctx.arc(7.5, 9.5, 5, Math.PI, Math.PI * 1.82)
    ctx.arc(13.5, 7.5, 6, Math.PI * 1.22, Math.PI * 0.12)
    ctx.arc(18, 13.5, 4.5, -0.35, Math.PI * 0.5)
    ctx.lineTo(7.5, 18.5)
    ctx.stroke()
    // Data line drops from cloud
    for (const x of [8, 12, 16]) {
      ctx.beginPath(); ctx.moveTo(x, 18.5); ctx.lineTo(x, 21.5); ctx.stroke()
      ctx.fillStyle = ctx.strokeStyle
      ctx.beginPath(); ctx.arc(x, 22, 0.8, 0, Math.PI * 2); ctx.fill()
    }
  },
  // 10 Security Shield
  ctx => {
    ctx.shadowColor = '#c0f0ff'; ctx.shadowBlur = 5
    ctx.beginPath()
    ctx.moveTo(12, 1.5); ctx.lineTo(21, 5.5); ctx.lineTo(21, 13)
    ctx.quadraticCurveTo(21, 21, 12, 24)
    ctx.quadraticCurveTo(3, 21, 3, 13)
    ctx.lineTo(3, 5.5); ctx.closePath(); ctx.stroke()
    // Checkmark inside
    ctx.beginPath()
    ctx.moveTo(7.5, 12.5); ctx.lineTo(10.5, 15.5); ctx.lineTo(16.5, 9.5); ctx.stroke()
    // Padlock detail
    ctx.beginPath(); ctx.arc(12, 7.5, 2, Math.PI, Math.PI * 2); ctx.stroke()
    ctx.strokeRect(9.5, 7.5, 5, 4)
  },
  // 11 Workflow / Pipeline
  ctx => {
    ctx.shadowColor = '#c0f0ff'; ctx.shadowBlur = 4
    // Three process nodes
    for (const [x, y] of [[3, 8], [10, 8], [17, 8]]) {
      ctx.strokeRect(x, y, 5, 7)
    }
    // Connections with arrows
    ctx.beginPath()
    ctx.moveTo(8, 11.5); ctx.lineTo(10, 11.5)
    ctx.moveTo(15, 11.5); ctx.lineTo(17, 11.5)
    ctx.stroke()
    // Arrowheads
    ctx.beginPath()
    ctx.moveTo(9, 10.2); ctx.lineTo(10, 11.5); ctx.lineTo(9, 12.8); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(16, 10.2); ctx.lineTo(17, 11.5); ctx.lineTo(16, 12.8); ctx.stroke()
    // Second row branching output
    ctx.beginPath()
    ctx.moveTo(12.5, 15); ctx.lineTo(12.5, 18)
    ctx.moveTo(7, 18); ctx.lineTo(18, 18)
    ctx.moveTo(7, 18); ctx.lineTo(7, 20); ctx.moveTo(12.5, 18); ctx.lineTo(12.5, 20)
    ctx.moveTo(18, 18); ctx.lineTo(18, 20)
    ctx.stroke()
    for (const x of [7, 12.5, 18]) {
      ctx.fillStyle = ctx.strokeStyle
      ctx.beginPath(); ctx.arc(x, 20.5, 1, 0, Math.PI * 2); ctx.fill()
    }
  },
]

export const ICON_LABELS = [
  'Dashboard', 'IoT / Chip', 'Client Portal', 'Integrations',
  'Automation', 'Custom Software', 'Website', 'AI Communication',
  'Database', 'Cloud', 'Security', 'Workflow',
]

// ── Shared glow dot texture ────────────────────────────────────────────────────
function makeGlowDotTex() {
  const S = 64
  const c = document.createElement('canvas'); c.width = c.height = S
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0,    'rgba(255,255,255,1.0)')
  g.addColorStop(0.15, 'rgba(200,240,255,0.95)')
  g.addColorStop(0.40, 'rgba(80,180,255,0.50)')
  g.addColorStop(0.70, 'rgba(0,90,220,0.15)')
  g.addColorStop(1,    'rgba(0,0,0,0)')
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S)
  return new THREE.CanvasTexture(c)
}
let _glowTex = null
export function getGlowDotTexture() {
  if (!_glowTex) _glowTex = makeGlowDotTex()
  return _glowTex
}

// ── Icon texture: small dark glass plate, large crisp icon, thin single rim ───
export function createIconTexture(index) {
  const S = 256
  const c = document.createElement('canvas'); c.width = c.height = S
  const ctx = c.getContext('2d')
  ctx.clearRect(0, 0, S, S)

  const plateR = 92   // icon plate radius in px
  const cx = 128, cy = 128

  // Dark glass plate — fades to transparent well inside the texture edge
  const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, plateR)
  bg.addColorStop(0,    'rgba(0, 14, 38, 0.92)')
  bg.addColorStop(0.50, 'rgba(0, 10, 26, 0.78)')
  bg.addColorStop(0.80, 'rgba(0,  5, 16, 0.28)')
  bg.addColorStop(1,    'rgba(0,  0,  8, 0)')
  ctx.fillStyle = bg
  ctx.beginPath(); ctx.arc(cx, cy, plateR, 0, Math.PI * 2); ctx.fill()

  // Subtle inner glow
  const halo = ctx.createRadialGradient(cx, cy, 20, cx, cy, plateR - 10)
  halo.addColorStop(0, 'rgba(0, 70, 180, 0.10)')
  halo.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = halo
  ctx.beginPath(); ctx.arc(cx, cy, plateR - 10, 0, Math.PI * 2); ctx.fill()

  // Single thin crisp rim — the ONLY circle in the texture
  ctx.shadowColor = '#5ad0ff'; ctx.shadowBlur = 5
  ctx.strokeStyle = 'rgba(100, 200, 255, 0.70)'
  ctx.lineWidth = 1.4
  ctx.beginPath(); ctx.arc(cx, cy, plateR - 2, 0, Math.PI * 2); ctx.stroke()
  ctx.shadowBlur = 0

  // Icon — large, fills most of the plate
  const iconMargin = 25    // px margin inside plate
  const iconR = plateR - iconMargin
  const iconX = cx - iconR, iconY = cy - iconR
  const scale = (iconR * 2) / 24   // 24-unit SVG → pixel scale

  ctx.save()
  ctx.translate(iconX, iconY)
  ctx.scale(scale, scale)
  ctx.strokeStyle = '#cceeff'
  ctx.fillStyle = '#cceeff'
  ctx.lineWidth = 1.3 / scale
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  if (index < DRAW.length) DRAW[index](ctx)
  ctx.restore()

  const tex = new THREE.CanvasTexture(c)
  tex.anisotropy = 8
  return tex
}
