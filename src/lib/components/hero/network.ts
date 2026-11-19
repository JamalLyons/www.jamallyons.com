import {
	AdditiveBlending,
	BufferAttribute,
	BufferGeometry,
	Color,
	Group,
	LineBasicMaterial,
	LineSegments,
	PerspectiveCamera,
	Points,
	Scene,
	ShaderMaterial,
	Vector3,
	WebGLRenderer
} from 'three';

/**
 * Interactive "server mesh" for the hero: nodes connected to their nearest
 * neighbours, with packets hopping along the edges. When the pointer is over
 * the canvas it becomes a client: packets greedily route toward the node
 * closest to it, and nearby nodes light up.
 */

export interface NetworkStats {
	nodes: number;
	edges: number;
	inFlight: number;
	delivered: number;
}

export interface NetworkOptions {
	/** Render a single frame and stop (prefers-reduced-motion). */
	still?: boolean;
}

export interface NetworkHandle {
	setPointer(x: number, y: number): void;
	clearPointer(): void;
	burst(): void;
	setRunning(running: boolean): void;
	stats(): NetworkStats;
	destroy(): void;
}

const COLOR_NODE = new Color('#5d6b7e');
const COLOR_ACTIVE = new Color('#22d3ee');
const COLOR_CURSOR = new Color('#a78bfa');
const COLOR_EDGE = new Color('#1b2633');
const COLOR_PACKET = new Color('#67e8f9');

const NEIGHBOURS = 3;
const MAX_HOPS = 40;

const pointVertex = /* glsl */ `
	attribute float aSize;
	attribute vec3 aColor;
	attribute float aGlow;
	uniform float uPixelRatio;
	varying vec3 vColor;
	varying float vGlow;
	varying float vFade;
	void main() {
		vec4 mv = modelViewMatrix * vec4(position, 1.0);
		gl_Position = projectionMatrix * mv;
		gl_PointSize = aSize * (1.0 + aGlow * 1.4) * uPixelRatio * (60.0 / -mv.z);
		vColor = aColor;
		vGlow = aGlow;
		vFade = 1.0 - clamp((-mv.z - 14.0) / 22.0, 0.0, 0.7);
	}
`;

const pointFragment = /* glsl */ `
	varying vec3 vColor;
	varying float vGlow;
	varying float vFade;
	void main() {
		float d = length(gl_PointCoord - 0.5);
		if (d > 0.5) discard;
		float core = 1.0 - smoothstep(0.04, 0.12, d);
		float halo = pow(1.0 - smoothstep(0.0, 0.5, d), 2.4) * (0.35 + vGlow * 0.65);
		gl_FragColor = vec4(vColor * (core + halo), (core + halo) * vFade);
	}
`;

function makePointMaterial(pixelRatio: number) {
	return new ShaderMaterial({
		uniforms: { uPixelRatio: { value: pixelRatio } },
		vertexShader: pointVertex,
		fragmentShader: pointFragment,
		transparent: true,
		depthWrite: false,
		blending: AdditiveBlending
	});
}

/** Deterministic PRNG so the graph looks the same on every load. */
function mulberry32(seed: number) {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export function createNetwork(canvas: HTMLCanvasElement, options: NetworkOptions = {}): NetworkHandle {
	const rand = mulberry32(1337);
	const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
	const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
	renderer.setPixelRatio(pixelRatio);
	renderer.setClearColor(0x000000, 0);

	const scene = new Scene();
	const camera = new PerspectiveCamera(50, 1, 0.1, 100);
	camera.position.set(0, 0, 24);

	const group = new Group();
	scene.add(group);

	// ---- Nodes -------------------------------------------------------------
	const compact = window.innerWidth < 768;
	const nodeCount = compact ? 80 : 150;
	const spread = new Vector3(compact ? 9 : 17, compact ? 11 : 9, 7);

	const nodePos: Vector3[] = [];
	for (let i = 0; i < nodeCount; i++) {
		// Rejection-sample inside an ellipsoid, biased slightly toward the rim
		// so the centre (where the headline sits) stays readable.
		let p: Vector3;
		do {
			p = new Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1);
		} while (p.lengthSq() > 1 || (Math.abs(p.x) < 0.28 && Math.abs(p.y) < 0.22 && rand() < 0.7));
		nodePos.push(p.multiply(spread));
	}

	// ---- Edges: k nearest neighbours, deduplicated ------------------------
	const adjacency: number[][] = nodePos.map(() => []);
	const edgeSet = new Set<number>();
	const edges: [number, number][] = [];
	for (let i = 0; i < nodeCount; i++) {
		const nearest = nodePos
			.map((p, j) => ({ j, d: p.distanceToSquared(nodePos[i]) }))
			.filter(({ j }) => j !== i)
			.sort((a, b) => a.d - b.d)
			.slice(0, NEIGHBOURS);
		for (const { j } of nearest) {
			const key = i < j ? i * nodeCount + j : j * nodeCount + i;
			if (edgeSet.has(key)) continue;
			edgeSet.add(key);
			edges.push([i, j]);
			adjacency[i].push(j);
			adjacency[j].push(i);
		}
	}

	const nodeGeo = new BufferGeometry();
	const nodePositions = new Float32Array(nodeCount * 3);
	const nodeSizes = new Float32Array(nodeCount);
	const nodeColors = new Float32Array(nodeCount * 3);
	const nodeGlow = new Float32Array(nodeCount);
	nodePos.forEach((p, i) => {
		p.toArray(nodePositions, i * 3);
		nodeSizes[i] = 2.2 + rand() * 2.4 + adjacency[i].length * 0.35;
	});
	nodeGeo.setAttribute('position', new BufferAttribute(nodePositions, 3));
	nodeGeo.setAttribute('aSize', new BufferAttribute(nodeSizes, 1));
	nodeGeo.setAttribute('aColor', new BufferAttribute(nodeColors, 3));
	nodeGeo.setAttribute('aGlow', new BufferAttribute(nodeGlow, 1));
	const nodeMat = makePointMaterial(pixelRatio);
	group.add(new Points(nodeGeo, nodeMat));

	const edgeGeo = new BufferGeometry();
	const edgePositions = new Float32Array(edges.length * 6);
	const edgeColors = new Float32Array(edges.length * 6);
	edges.forEach(([a, b], i) => {
		nodePos[a].toArray(edgePositions, i * 6);
		nodePos[b].toArray(edgePositions, i * 6 + 3);
	});
	edgeGeo.setAttribute('position', new BufferAttribute(edgePositions, 3));
	edgeGeo.setAttribute('color', new BufferAttribute(edgeColors, 3));
	const edgeMat = new LineBasicMaterial({
		vertexColors: true,
		transparent: true,
		depthWrite: false,
		blending: AdditiveBlending
	});
	group.add(new LineSegments(edgeGeo, edgeMat));

	// ---- Packets -----------------------------------------------------------
	const packetCount = compact ? 40 : 90;
	const pFrom = new Int32Array(packetCount);
	const pTo = new Int32Array(packetCount);
	const pT = new Float32Array(packetCount);
	const pSpeed = new Float32Array(packetCount);
	const pHops = new Int32Array(packetCount);
	/** Hops left during which a packet ignores the pointer (click bursts). */
	const pFree = new Int32Array(packetCount);

	const packetGeo = new BufferGeometry();
	const packetPositions = new Float32Array(packetCount * 3);
	const packetSizes = new Float32Array(packetCount).fill(2.6);
	const packetColors = new Float32Array(packetCount * 3);
	const packetGlow = new Float32Array(packetCount).fill(0.6);
	for (let i = 0; i < packetCount; i++) COLOR_PACKET.toArray(packetColors, i * 3);
	packetGeo.setAttribute('position', new BufferAttribute(packetPositions, 3));
	packetGeo.setAttribute('aSize', new BufferAttribute(packetSizes, 1));
	packetGeo.setAttribute('aColor', new BufferAttribute(packetColors, 3));
	packetGeo.setAttribute('aGlow', new BufferAttribute(packetGlow, 1));
	const packetMat = makePointMaterial(pixelRatio);
	group.add(new Points(packetGeo, packetMat));

	// Short comet trails behind each packet; the tail vertex is black, so
	// additive blending fades it out.
	const trailGeo = new BufferGeometry();
	const trailPositions = new Float32Array(packetCount * 6);
	const trailColors = new Float32Array(packetCount * 6);
	for (let i = 0; i < packetCount; i++) COLOR_PACKET.toArray(trailColors, i * 6);
	trailGeo.setAttribute('position', new BufferAttribute(trailPositions, 3));
	trailGeo.setAttribute('color', new BufferAttribute(trailColors, 3));
	const trailMat = new LineBasicMaterial({
		vertexColors: true,
		transparent: true,
		depthWrite: false,
		blending: AdditiveBlending
	});
	group.add(new LineSegments(trailGeo, trailMat));

	const randomNeighbour = (node: number, exclude = -1) => {
		const list = adjacency[node];
		if (list.length === 1) return list[0];
		let next: number;
		do next = list[Math.floor(Math.random() * list.length)];
		while (next === exclude);
		return next;
	};

	const spawn = (i: number, from = Math.floor(Math.random() * nodeCount), free = 0) => {
		pFrom[i] = from;
		pTo[i] = randomNeighbour(from);
		pT[i] = Math.random() * (free ? 0.2 : 1);
		pSpeed[i] = 0.5 + Math.random() * 0.7;
		pHops[i] = 0;
		pFree[i] = free;
	};
	for (let i = 0; i < packetCount; i++) spawn(i);

	// ---- Pointer -----------------------------------------------------------
	let pointerActive = false;
	const pointer = { x: 0, y: 0 };
	const pointerSmooth = { x: 0, y: 0 };
	const projected = new Float32Array(nodeCount * 2);
	const tmp = new Vector3();
	let targetNode = -1;
	let delivered = 0;
	let aspect = 1;

	const screenDistSq = (node: number) => {
		const dx = (projected[node * 2] - pointer.x) * aspect;
		const dy = projected[node * 2 + 1] - pointer.y;
		return dx * dx + dy * dy;
	};

	// ---- Loop --------------------------------------------------------------
	let running = false;
	let raf = 0;
	let last = performance.now();
	let elapsed = 0;

	const resize = () => {
		const { clientWidth: w, clientHeight: h } = canvas;
		if (!w || !h) return;
		aspect = w / h;
		renderer.setSize(w, h, false);
		camera.aspect = aspect;
		// Keep the whole mesh in frame on narrow screens.
		camera.position.z = aspect < 1 ? 24 / Math.max(aspect, 0.55) : 24;
		camera.updateProjectionMatrix();
	};

	const step = (dt: number) => {
		elapsed += dt;
		pointerSmooth.x += (pointer.x * (pointerActive ? 1 : 0) - pointerSmooth.x) * Math.min(dt * 2.5, 1);
		pointerSmooth.y += (pointer.y * (pointerActive ? 1 : 0) - pointerSmooth.y) * Math.min(dt * 2.5, 1);

		group.rotation.y = elapsed * 0.04 + pointerSmooth.x * 0.25;
		group.rotation.x = Math.sin(elapsed * 0.13) * 0.06 - pointerSmooth.y * 0.15;
		group.updateMatrixWorld();
		camera.updateMatrixWorld();

		// Project nodes to NDC for pointer proximity and routing.
		let best = Number.POSITIVE_INFINITY;
		targetNode = -1;
		for (let i = 0; i < nodeCount; i++) {
			tmp.copy(nodePos[i]).applyMatrix4(group.matrixWorld).project(camera);
			projected[i * 2] = tmp.x;
			projected[i * 2 + 1] = tmp.y;
			if (pointerActive) {
				const d = screenDistSq(i);
				if (d < best) {
					best = d;
					targetNode = i;
				}
			}
		}

		// Node glow: decay, plus pointer proximity, plus idle shimmer.
		const decay = Math.exp(-dt * 2.2);
		for (let i = 0; i < nodeCount; i++) {
			let glow = nodeGlow[i] * decay;
			let near = 0;
			if (pointerActive) near = Math.max(0, 1 - Math.sqrt(screenDistSq(i)) / 0.35);
			glow = Math.max(glow, near * 0.8);
			nodeGlow[i] = glow;
			const shimmer = 0.75 + 0.25 * Math.sin(elapsed * 1.3 + i * 1.7);
			const r = COLOR_NODE.r * shimmer;
			const g = COLOR_NODE.g * shimmer;
			const b = COLOR_NODE.b * shimmer;
			const tint = near > glow - 0.01 && near > 0 ? COLOR_CURSOR : COLOR_ACTIVE;
			nodeColors[i * 3] = r + (tint.r - r) * glow;
			nodeColors[i * 3 + 1] = g + (tint.g - g) * glow;
			nodeColors[i * 3 + 2] = b + (tint.b - b) * glow;
		}

		// Edges inherit brightness from their endpoints.
		edges.forEach(([a, b], i) => {
			for (const [slot, n] of [
				[0, a],
				[3, b]
			] as const) {
				const k = nodeGlow[n] * 0.7;
				edgeColors[i * 6 + slot] = COLOR_EDGE.r + (COLOR_ACTIVE.r * 0.45 - COLOR_EDGE.r) * k;
				edgeColors[i * 6 + slot + 1] = COLOR_EDGE.g + (COLOR_ACTIVE.g * 0.45 - COLOR_EDGE.g) * k;
				edgeColors[i * 6 + slot + 2] = COLOR_EDGE.b + (COLOR_ACTIVE.b * 0.45 - COLOR_EDGE.b) * k;
			}
		});

		// Packets.
		for (let i = 0; i < packetCount; i++) {
			const a = nodePos[pFrom[i]];
			const b = nodePos[pTo[i]];
			const len = a.distanceTo(b) || 1;
			pT[i] += (pSpeed[i] * (pointerActive ? 9 : 5) * dt) / len;

			if (pT[i] >= 1) {
				const arrived = pTo[i];
				nodeGlow[arrived] = Math.max(nodeGlow[arrived], 0.55);
				pHops[i]++;
				if (pFree[i] > 0) pFree[i]--;

				if (pointerActive && arrived === targetNode && pFree[i] === 0) {
					delivered++;
					nodeGlow[arrived] = 1;
					spawn(i);
					continue;
				}
				if (pHops[i] > MAX_HOPS) {
					spawn(i);
					continue;
				}

				let next: number;
				if (pointerActive && pFree[i] === 0 && Math.random() < 0.8) {
					// Greedy routing toward the pointer, avoiding immediate backtrack.
					next = -1;
					let bestD = Number.POSITIVE_INFINITY;
					for (const n of adjacency[arrived]) {
						if (n === pFrom[i]) continue;
						const d = screenDistSq(n);
						if (d < bestD) {
							bestD = d;
							next = n;
						}
					}
					if (next === -1) next = randomNeighbour(arrived);
				} else {
					next = randomNeighbour(arrived, pFrom[i]);
				}
				pFrom[i] = arrived;
				pTo[i] = next;
				pT[i] = 0;
			}

			const from = nodePos[pFrom[i]];
			const to = nodePos[pTo[i]];
			const t = pT[i];
			const tail = Math.max(0, t - 2.2 / (from.distanceTo(to) || 1));
			for (let k = 0; k < 3; k++) {
				const fk = from.getComponent(k);
				const tk = to.getComponent(k);
				const head = fk + (tk - fk) * t;
				packetPositions[i * 3 + k] = head;
				trailPositions[i * 6 + k] = head;
				trailPositions[i * 6 + 3 + k] = fk + (tk - fk) * tail;
			}
		}

		nodeGeo.attributes.aGlow.needsUpdate = true;
		nodeGeo.attributes.aColor.needsUpdate = true;
		edgeGeo.attributes.color.needsUpdate = true;
		packetGeo.attributes.position.needsUpdate = true;
		trailGeo.attributes.position.needsUpdate = true;
	};

	const frame = (now: number) => {
		const dt = Math.min((now - last) / 1000, 0.05);
		last = now;
		step(dt);
		renderer.render(scene, camera);
		if (running) raf = requestAnimationFrame(frame);
	};

	const setRunning = (next: boolean) => {
		if (options.still || next === running) return;
		running = next;
		if (running) {
			last = performance.now();
			raf = requestAnimationFrame(frame);
		} else {
			cancelAnimationFrame(raf);
		}
	};

	const observer = new ResizeObserver(() => {
		resize();
		if (!running) renderer.render(scene, camera);
	});
	observer.observe(canvas);
	resize();

	if (options.still) {
		// Settle the scene a little so packets are spread along edges.
		for (let i = 0; i < 30; i++) step(1 / 60);
		renderer.render(scene, camera);
	} else {
		setRunning(true);
	}

	return {
		setPointer(x, y) {
			pointer.x = x;
			pointer.y = y;
			pointerActive = true;
		},
		clearPointer() {
			pointerActive = false;
		},
		burst() {
			const origin = targetNode >= 0 ? targetNode : Math.floor(Math.random() * nodeCount);
			nodeGlow[origin] = 1;
			const count = Math.min(16, packetCount);
			for (let n = 0; n < count; n++) {
				const i = Math.floor(Math.random() * packetCount);
				spawn(i, origin, 4);
			}
			if (options.still) {
				step(1 / 60);
				renderer.render(scene, camera);
			}
		},
		setRunning,
		stats: () => ({
			nodes: nodeCount,
			edges: edges.length,
			inFlight: packetCount,
			delivered
		}),
		destroy() {
			running = false;
			cancelAnimationFrame(raf);
			observer.disconnect();
			for (const g of [nodeGeo, edgeGeo, packetGeo, trailGeo]) g.dispose();
			for (const m of [nodeMat, edgeMat, packetMat, trailMat]) m.dispose();
			renderer.dispose();
		}
	};
}
