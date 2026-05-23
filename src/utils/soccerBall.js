import * as THREE from 'three'

const PHI = (1 + Math.sqrt(5)) / 2

export function buildSoccerBall() {
  const raw = []

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

  const vertices = raw.map(([x, y, z]) => {
    const len = Math.sqrt(x * x + y * y + z * z)
    return new THREE.Vector3(x / len, y / len, z / len)
  })

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
      if (vertices[i].distanceTo(vertices[j]) <= tol) edges.push([i, j])

  // Adjacency map for each vertex
  const adj = new Map()
  vertices.forEach((_, i) => adj.set(i, []))
  edges.forEach(([i, j]) => { adj.get(i).push(j); adj.get(j).push(i) })

  // Vertex triangles: midpoints of the 3 edges at each vertex form small triangles
  // These create the unique inner web pattern
  const vertexTriangles = vertices.map((v, i) => {
    const neighbors = adj.get(i)
    return neighbors.map(ni => v.clone().add(vertices[ni]).normalize())
  })

  // 12 pentagon centers = icosahedron vertex positions (normalized)
  const pentagonCenters = [
    [0, 1, PHI], [0, -1, PHI], [0, 1, -PHI], [0, -1, -PHI],
    [1, PHI, 0], [-1, PHI, 0], [1, -PHI, 0], [-1, -PHI, 0],
    [PHI, 0, 1], [-PHI, 0, 1], [PHI, 0, -1], [-PHI, 0, -1],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z).normalize())

  // 20 hexagon centers = icosahedron face centers (average of 3 nearest icosahedron vertices)
  // Icosahedron vertices for face detection
  const icoVerts = [
    [0, 1, PHI], [0, -1, PHI], [0, 1, -PHI], [0, -1, -PHI],
    [1, PHI, 0], [-1, PHI, 0], [1, -PHI, 0], [-1, -PHI, 0],
    [PHI, 0, 1], [-PHI, 0, 1], [PHI, 0, -1], [-PHI, 0, -1],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z).normalize())

  // Icosahedron edges (connect pairs within edge length ~1.051 on unit sphere)
  let icoMinDist = Infinity
  for (let i = 0; i < icoVerts.length; i++)
    for (let j = i + 1; j < icoVerts.length; j++) {
      const d = icoVerts[i].distanceTo(icoVerts[j])
      if (d < icoMinDist) icoMinDist = d
    }
  const icoAdj = new Map()
  icoVerts.forEach((_, i) => icoAdj.set(i, []))
  for (let i = 0; i < icoVerts.length; i++)
    for (let j = i + 1; j < icoVerts.length; j++)
      if (icoVerts[i].distanceTo(icoVerts[j]) <= icoMinDist * 1.05) {
        icoAdj.get(i).push(j); icoAdj.get(j).push(i)
      }

  // Icosahedron triangular faces = triples of mutually adjacent icosahedron vertices
  const hexCenters = []
  for (let i = 0; i < icoVerts.length; i++) {
    const ni = icoAdj.get(i)
    for (let a = 0; a < ni.length; a++) {
      for (let b = a + 1; b < ni.length; b++) {
        if (ni[b] > i && ni[a] > i && icoAdj.get(ni[a]).includes(ni[b])) {
          const center = icoVerts[i].clone().add(icoVerts[ni[a]]).add(icoVerts[ni[b]]).normalize()
          hexCenters.push(center)
        }
      }
    }
  }

  return { vertices, edges, adj, vertexTriangles, pentagonCenters, hexCenters }
}

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

// Fibonacci sphere — uniform point distribution on sphere surface
export function fibonacciSphere(count, r) {
  const out = new Float32Array(count * 3)
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const radius = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i
    out[i * 3] = Math.cos(theta) * radius * r
    out[i * 3 + 1] = y * r
    out[i * 3 + 2] = Math.sin(theta) * radius * r
  }
  return out
}
