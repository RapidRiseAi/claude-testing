import * as THREE from 'three'

// Each draw fn receives a canvas 2d context already translated to center (128,128)
// and scaled so 1 unit = ~6.3px. Draw in 0→24 SVG-coordinate space.
const DRAW = [
  // 0 Analytics
  ctx => {
    ctx.fillStyle = ctx.strokeStyle
    ctx.fillRect(3, 14, 4, 7); ctx.fillRect(10, 9, 4, 12); ctx.fillRect(17, 5, 4, 16)
    ctx.beginPath(); ctx.moveTo(2, 21); ctx.lineTo(22, 21)
    ctx.moveTo(2, 3); ctx.lineTo(2, 21); ctx.stroke()
  },
  // 1 IoT / Chip
  ctx => {
    ctx.strokeRect(7, 7, 10, 10)
    for (const y of [9, 12, 15]) {
      ctx.beginPath(); ctx.moveTo(3, y); ctx.lineTo(7, y); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(17, y); ctx.lineTo(21, y); ctx.stroke()
    }
    for (const x of [9, 12, 15]) {
      ctx.beginPath(); ctx.moveTo(x, 3); ctx.lineTo(x, 7); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(x, 17); ctx.lineTo(x, 21); ctx.stroke()
    }
  },
  // 2 Identity
  ctx => {
    ctx.strokeRect(2, 5, 20, 14)
    ctx.beginPath(); ctx.arc(8, 12, 2.5, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(13, 9.5); ctx.lineTo(20, 9.5)
    ctx.moveTo(13, 13); ctx.lineTo(18, 13)
    ctx.moveTo(13, 16); ctx.lineTo(16, 16)
    ctx.stroke()
  },
  // 3 Integrations (nodes connected)
  ctx => {
    for (const [x, y] of [[3,3],[17,3],[3,17],[17,17]]) ctx.strokeRect(x, y, 4, 4)
    ctx.beginPath(); ctx.arc(12, 12, 2, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath()
    for (const [x, y] of [[3,3],[17,3],[3,17],[17,17]])
      { ctx.moveTo(x + 2, y + 2); ctx.lineTo(12, 12) }
    ctx.stroke()
  },
  // 4 Automation (gear)
  ctx => {
    ctx.beginPath(); ctx.arc(12, 12, 7, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.arc(12, 12, 3, 0, Math.PI * 2); ctx.stroke()
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      ctx.beginPath()
      ctx.moveTo(12 + Math.cos(a) * 4.5, 12 + Math.sin(a) * 4.5)
      ctx.lineTo(12 + Math.cos(a) * 9.5, 12 + Math.sin(a) * 9.5)
      ctx.stroke()
    }
  },
  // 5 Code
  ctx => {
    ctx.beginPath()
    ctx.moveTo(15, 18); ctx.lineTo(21, 12); ctx.lineTo(15, 6); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(9, 6); ctx.lineTo(3, 12); ctx.lineTo(9, 18); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(14, 4); ctx.lineTo(10, 20); ctx.stroke()
  },
  // 6 Web Platform
  ctx => {
    ctx.strokeRect(2, 3, 20, 15)
    ctx.beginPath(); ctx.moveTo(2, 7); ctx.lineTo(22, 7); ctx.stroke()
    ctx.beginPath()
    ctx.arc(5.5, 5, 1, 0, Math.PI * 2)
    ctx.arc(9, 5, 1, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.arc(12, 13, 3, 0, Math.PI * 2); ctx.stroke()
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
      ctx.beginPath()
      ctx.moveTo(12 + Math.cos(a) * 4, 13 + Math.sin(a) * 4)
      ctx.lineTo(12 + Math.cos(a) * 5.5, 13 + Math.sin(a) * 5.5); ctx.stroke()
    }
    ctx.beginPath(); ctx.moveTo(8, 21); ctx.lineTo(16, 21)
    ctx.moveTo(12, 18); ctx.lineTo(12, 21); ctx.stroke()
  },
  // 7 AI / Robot
  ctx => {
    ctx.strokeRect(3, 8, 18, 11)
    ctx.beginPath()
    ctx.moveTo(8, 8); ctx.lineTo(8, 5); ctx.lineTo(16, 5); ctx.lineTo(16, 8); ctx.stroke()
    ctx.fillStyle = ctx.strokeStyle
    ctx.beginPath(); ctx.arc(9, 13, 1.5, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(15, 13, 1.5, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.moveTo(9, 17); ctx.quadraticCurveTo(12, 19.5, 15, 17); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(12, 5); ctx.lineTo(12, 3); ctx.stroke()
    ctx.beginPath(); ctx.arc(12, 2.5, 1, 0, Math.PI * 2); ctx.fill()
  },
  // 8 Database
  ctx => {
    for (const y of [5, 12, 19]) {
      ctx.beginPath(); ctx.ellipse(12, y, 8, 2.5, 0, 0, Math.PI * 2); ctx.stroke()
    }
    ctx.beginPath()
    ctx.moveTo(4, 5); ctx.lineTo(4, 19)
    ctx.moveTo(20, 5); ctx.lineTo(20, 19); ctx.stroke()
  },
  // 9 Cloud / Server
  ctx => {
    ctx.beginPath()
    ctx.moveTo(8, 19); ctx.lineTo(5, 19)
    ctx.arc(5, 15, 4, Math.PI * 0.5, Math.PI * 1.5)
    ctx.arc(8, 10, 5, Math.PI, Math.PI * 1.85)
    ctx.arc(14, 8, 6, Math.PI * 1.25, Math.PI * 0.1)
    ctx.arc(18, 14, 4, -0.4, Math.PI * 0.5)
    ctx.lineTo(8, 19); ctx.stroke()
  },
  // 10 Shield / Security
  ctx => {
    ctx.beginPath()
    ctx.moveTo(12, 2); ctx.lineTo(20, 6); ctx.lineTo(20, 13)
    ctx.quadraticCurveTo(20, 20, 12, 23)
    ctx.quadraticCurveTo(4, 20, 4, 13)
    ctx.lineTo(4, 6); ctx.closePath(); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(8.5, 12.5); ctx.lineTo(11, 15.5); ctx.lineTo(15.5, 9.5); ctx.stroke()
  },
  // 11 Workflow / Pipeline
  ctx => {
    for (const x of [2, 10, 18]) ctx.strokeRect(x, 9, 5, 6)
    ctx.beginPath()
    ctx.moveTo(7, 12); ctx.lineTo(10, 12)
    ctx.moveTo(15, 12); ctx.lineTo(18, 12); ctx.stroke()
    // Arrowheads
    ctx.beginPath()
    ctx.moveTo(8.5, 10.5); ctx.lineTo(10, 12); ctx.lineTo(8.5, 13.5); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(16.5, 10.5); ctx.lineTo(18, 12); ctx.lineTo(16.5, 13.5); ctx.stroke()
  },
]

export const ICON_LABELS = [
  'Analytics', 'IoT / Chip', 'Identity', 'Integrations',
  'Automation', 'Code', 'Web Platform', 'AI Assistant',
  'Database', 'Cloud', 'Security', 'Workflow',
]

export function createIconTexture(index) {
  const S = 256
  const c = document.createElement('canvas')
  c.width = c.height = S
  const ctx = c.getContext('2d')
  ctx.clearRect(0, 0, S, S)

  // Outer radial glow
  const g = ctx.createRadialGradient(128, 128, 60, 128, 128, 128)
  g.addColorStop(0, 'rgba(0, 110, 255, 0.30)')
  g.addColorStop(0.6, 'rgba(0, 60, 180, 0.10)')
  g.addColorStop(1, 'rgba(0, 20, 80, 0)')
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S)

  // Dark background disc
  ctx.fillStyle = 'rgba(0, 5, 20, 0.93)'
  ctx.beginPath(); ctx.arc(128, 128, 112, 0, Math.PI * 2); ctx.fill()

  // Outer border
  ctx.strokeStyle = '#0099dd'; ctx.lineWidth = 5
  ctx.beginPath(); ctx.arc(128, 128, 110, 0, Math.PI * 2); ctx.stroke()

  // Inner decorative ring
  ctx.strokeStyle = 'rgba(0, 160, 220, 0.40)'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.arc(128, 128, 90, 0, Math.PI * 2); ctx.stroke()

  // Icon: translate to center, scale from 24-unit SVG space
  const margin = 48
  const scale = (S - 2 * margin) / 24  // ≈ 6.67 px per SVG unit
  ctx.save()
  ctx.translate(margin, margin)
  ctx.scale(scale, scale)
  ctx.strokeStyle = '#44ddff'
  ctx.fillStyle = '#44ddff'
  ctx.lineWidth = 1.8 / scale
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  if (index < DRAW.length) DRAW[index](ctx)
  ctx.restore()

  return new THREE.CanvasTexture(c)
}
