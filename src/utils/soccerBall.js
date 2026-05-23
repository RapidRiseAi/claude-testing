import * as THREE from 'three'

const PHI = (1 + Math.sqrt(5)) / 2

export function buildSoccerBall() {
  const raw = []

  // 60 vertices of truncated icosahedron (3 families of even permutations)
  for (const s1 of [-1, 1]) for (const s2 of [-1, 1]) {
    raw.push([0, s1, s2 * 3 * PHI], [s1, s2 * 3 * PHI, 0], [s2 * 3 * PHI, 0, s1])
  }
  for (const s1 of [-1, 1]) for (const s2 of [-1, 1]) for (const s3 of [-1, 1]) {
    raw.push(
      [s1, s2 * (2 + PHI), s3 * 2 * PHI],
      [s2 * (2 + PHI), s3 * 2 * PHI, s1],
      [s3 * 2 * PHI, s1, s2 * (2 + PHI)],
      [s1 * 2, s2 * (1 + 2 * PHI), s3 * PHI],
      [s2 * (1 + 2 * PHI), s3 * PHI, s1 * 2],
      [s3 * PHI, s1 * 2, s2 * (1 + 2 * PHI)]
    )
  }

  // Normalize to unit sphere
  const vertices = raw.map(([x, y, z]) => {
    const len = Math.sqrt(x * x + y * y + z * z)
    return new THREE.Vector3(x / len, y / len, z / len)
  })

  // Edges = all pairs at minimum distance
  let minDist = Infinity
  for (let i = 0; i < vertices.length; i++)
    for (let j = i + 1; j < vertices.length; j++) {
      const d = vertices[i].distanceTo(vertices[j])
      if (d < minDist) minDist = d
    }

  const edges = []
  const tol = minDist * 1.05
  for (let i = 0; i < vertices.length; i++)
    for (let j = i + 1; j < vertices.length; j++)
      if (vertices[i].distanceTo(vertices[j]) <= tol)
        edges.push([i, j])

  // 12 pentagon centers = icosahedron vertices (normalized)
  const pentagonCenters = [
    [0, 1, PHI], [0, -1, PHI], [0, 1, -PHI], [0, -1, -PHI],
    [1, PHI, 0], [-1, PHI, 0], [1, -PHI, 0], [-1, -PHI, 0],
    [PHI, 0, 1], [-PHI, 0, 1], [PHI, 0, -1], [-PHI, 0, -1],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z).normalize())

  return { vertices, edges, pentagonCenters }
}

// Great circle arc between two points on unit sphere, scaled to r
export function greatCircleArc(v1, v2, r = 1, n = 24) {
  const p1 = v1.clone().normalize()
  const p2 = v2.clone().normalize()
  const angle = p1.angleTo(p2)
  if (angle < 1e-6) return [p1.multiplyScalar(r).toArray()]
  const axis = new THREE.Vector3().crossVectors(p1, p2)
  if (axis.length() < 1e-6) axis.set(1, 0, 0)
  axis.normalize()
  return Array.from({ length: n + 1 }, (_, i) => {
    const q = new THREE.Quaternion().setFromAxisAngle(axis, (angle * i) / n)
    return p1.clone().applyQuaternion(q).multiplyScalar(r).toArray()
  })
}

// Small circle on sphere surface, centered at `center`, angular radius `alpha`
export function circleOnSphere(center, alpha, r = 1, n = 96) {
  const norm = center.clone().normalize()
  const ref = Math.abs(norm.y) > 0.85 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)
  const e1 = new THREE.Vector3().crossVectors(norm, ref).normalize()
  const e2 = new THREE.Vector3().crossVectors(e1, norm).normalize()
  return Array.from({ length: n + 1 }, (_, i) => {
    const φ = (i / n) * Math.PI * 2
    return norm.clone()
      .multiplyScalar(Math.cos(alpha))
      .addScaledVector(e1, Math.sin(alpha) * Math.cos(φ))
      .addScaledVector(e2, Math.sin(alpha) * Math.sin(φ))
      .normalize()
      .multiplyScalar(r)
      .toArray()
  })
}
