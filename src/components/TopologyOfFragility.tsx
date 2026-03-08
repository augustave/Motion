import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

const BENIGN_T = 0.340;
const PATH_T = 0.564;
const GRID_W = 13;
const SPACING = 1.25;
const MAX_H = 7.0;

// [name, chr, relPos, amScore, function]
// Scores approximate AlphaMissense mean pathogenicity by gene category
type GeneData = [string, number, number, number, string];
const GENES: GeneData[] = [
  ["TP53",17,0.31,0.93,"tumor suppressor"],
  ["MYCN",2,0.23,0.91,"proto-oncogene TF"],
  ["KRAS",12,0.25,0.89,"RAS GTPase"],
  ["PTEN",10,0.89,0.89,"phosphatase tumor suppressor"],
  ["MYC",8,0.13,0.88,"proto-oncogene TF"],
  ["BRCA1",17,0.58,0.88,"homologous recombination"],
  ["OCT4",6,0.46,0.87,"pluripotency TF"],
  ["SOX2",3,0.19,0.86,"neural stem cell TF"],
  ["CDKN2A",9,0.21,0.85,"CDK4/6 inhibitor"],
  ["BRCA2",13,0.32,0.85,"DNA strand break repair"],
  ["NRAS",1,0.11,0.84,"RAS GTPase"],
  ["NANOG",12,0.34,0.84,"pluripotency maintenance"],
  ["RUNX1",21,0.34,0.84,"hematopoietic TF"],
  ["RB1",13,0.48,0.84,"retinoblastoma protein"],
  ["ATM",11,0.10,0.83,"DNA damage kinase"],
  ["PALB2",16,0.23,0.82,"BRCA2 interactor"],
  ["NF1",17,0.21,0.82,"RAS GAP"],
  ["APC",5,0.11,0.82,"Wnt/β-catenin regulator"],
  ["MLL",11,0.11,0.82,"H3K4 methyltransferase"],
  ["TSC2",16,0.60,0.81,"mTORC1 repressor"],
  ["VHL",3,0.25,0.81,"HIF1α ubiquitin ligase"],
  ["SETD2",3,0.47,0.81,"H3K36 methyltransferase"],
  ["ATR",3,0.14,0.81,"replication stress kinase"],
  ["NOTCH1",9,0.14,0.79,"Notch receptor"],
  ["ARID1A",1,0.22,0.79,"SWI/SNF chromatin complex"],
  ["MLH1",3,0.37,0.79,"mismatch repair"],
  ["MSH2",2,0.47,0.78,"mismatch repair"],
  ["CTNNB1",3,0.41,0.78,"β-catenin Wnt effector"],
  ["EP300",22,0.12,0.78,"histone acetyltransferase"],
  ["NF2",22,0.31,0.78,"merlin ERM protein"],
  ["TET2",4,0.10,0.78,"5mC dioxygenase"],
  ["RAD51",15,0.40,0.78,"homologous recombination"],
  ["CHEK2",22,0.24,0.77,"cell cycle checkpoint"],
  ["CREBBP",16,0.34,0.77,"KAT3A acetyltransferase"],
  ["TSC1",9,0.34,0.77,"hamartin / mTOR"],
  ["NOTCH2",1,0.12,0.77,"Notch receptor 2"],
  ["ALK",2,0.29,0.77,"anaplastic lymphoma kinase"],
  ["TARDBP",1,0.12,0.77,"TDP-43 RNA binding"],
  ["BRAF",7,0.14,0.76,"serine/threonine kinase"],
  ["FGFR3",4,0.19,0.76,"FGF receptor 3"],
  ["FUS",16,0.31,0.76,"RNA-binding FET family"],
  ["DNMT3A",2,0.25,0.76,"de novo DNA methylase"],
  ["CASP8",2,0.20,0.76,"apoptosis initiator"],
  ["RET",10,0.43,0.75,"glial neurotrophic RTK"],
  ["JAK2",9,0.53,0.74,"Janus kinase 2"],
  ["EZH2",7,0.63,0.74,"H3K27 methyltransferase"],
  ["BCL6",3,0.46,0.74,"lymphoma proto-oncogene"],
  ["HBB",11,0.19,0.73,"hemoglobin beta chain"],
  ["BAX",19,0.21,0.73,"pro-apoptotic BCL2"],
  ["MET",7,0.12,0.73,"HGF receptor RTK"],
  ["JAK1",1,0.64,0.72,"Janus kinase 1"],
  ["CDK4",12,0.14,0.72,"G1 cyclin-dependent kinase"],
  ["CDKN1A",6,0.56,0.72,"p21 WAF1/CIP1"],
  ["KIT",4,0.77,0.72,"mast/stem cell RTK"],
  ["PIK3CA",3,0.17,0.72,"PI3K catalytic subunit"],
  ["HBA1",16,0.21,0.71,"hemoglobin alpha 1"],
  ["EGFR",7,0.55,0.71,"EGF receptor"],
  ["FLT3",13,0.28,0.71,"FMS-like tyrosine kinase"],
  ["FGFR1",8,0.38,0.71,"FGF receptor 1"],
  ["CDK6",7,0.92,0.71,"G1 cyclin-dependent kinase"],
  ["BCL2",18,0.58,0.71,"anti-apoptotic regulator"],
  ["SOD1",21,0.12,0.72,"Cu/Zn superoxide dismutase"],
  ["LDLR",19,0.12,0.69,"LDL receptor"],
  ["HEXA",15,0.27,0.68,"β-hexosaminidase A"],
  ["MCL1",1,0.19,0.68,"anti-apoptotic BCL2"],
  ["STAT3",17,0.43,0.68,"STAT transcription factor"],
  ["ATF1",12,0.23,0.68,"cAMP-responsive TF"],
  ["GBA",1,0.15,0.67,"glucocerebrosidase"],
  ["CCND1",11,0.69,0.67,"cyclin D1"],
  ["HIF1A",14,0.62,0.65,"hypoxia-inducible factor"],
  ["G6PD",23,0.15,0.65,"glucose-6-phosphate DH"],
  ["F8",23,0.23,0.66,"coagulation factor VIII"],
  ["F9",23,0.34,0.64,"coagulation factor IX"],
  ["MDM2",12,0.68,0.63,"p53 E3 ubiquitin ligase"],
  ["PSEN1",14,0.46,0.63,"presenilin / γ-secretase"],
  ["DMD",23,0.34,0.62,"dystrophin"],
  ["SNCA",4,0.90,0.61,"α-synuclein"],
  ["PCSK9",1,0.55,0.61,"LDLR degradation"],
  ["APP",21,0.19,0.59,"amyloid precursor"],
  ["VEGFA",6,0.43,0.58,"angiogenesis factor"],
  ["CFTR",7,0.11,0.58,"chloride channel"],
  ["PINK1",1,0.83,0.57,"mitophagy kinase"],
  ["PARKIN",6,0.16,0.56,"PARK2 ubiquitin ligase"],
  ["HTT",4,0.19,0.55,"huntingtin"],
  ["LRRK2",12,0.40,0.54,"Parkinson kinase"],
  ["APOE",19,0.44,0.48,"apolipoprotein E"],
  ["C9orf72",9,0.28,0.44,"dipeptide repeat / ALS"],
  ["OR5A1",11,0.32,0.21,"olfactory receptor"],
  ["OR2T2",1,0.45,0.19,"olfactory receptor"],
  ["OR1D2",17,0.23,0.22,"olfactory receptor"],
  ["OR4D9",17,0.67,0.18,"olfactory receptor"],
  ["OR6C65",12,0.45,0.20,"olfactory receptor"],
  ["OR8H1",11,0.71,0.17,"olfactory receptor"],
  ["MUC2",11,0.21,0.27,"mucin glycoprotein"],
  ["MUC5B",11,0.43,0.25,"mucin glycoprotein"],
  ["MUC16",19,0.67,0.22,"mucin / CA-125"],
  ["TAS2R38",7,0.45,0.28,"bitter taste receptor"],
  ["TAS1R2",1,0.23,0.26,"sweet taste receptor"],
  ["KIR2DL1",19,0.56,0.29,"NK killer receptor"],
  ["NBPF1",1,0.12,0.28,"neuroblastoma breakpoint"],
  ["SIGLEC1",20,0.34,0.31,"sialic acid lectin"],
];

function scoreToColor(s: number) {
  const c = new THREE.Color();
  if (s < BENIGN_T) {
    const t = s / BENIGN_T;
    c.setHSL(0.585, 0.88, 0.06 + t * 0.22);
  } else if (s < PATH_T) {
    const t = (s - BENIGN_T) / (PATH_T - BENIGN_T);
    c.setHSL(0.56 - t * 0.45, 0.92, 0.28 + t * 0.18);
  } else {
    const t = (s - PATH_T) / (1 - PATH_T);
    c.setHSL(0.09 - t * 0.09, 1.0, 0.32 + t * 0.18);
  }
  return c;
}

function classify(s: number) {
  if (s >= PATH_T) return { label: "PATHOGENIC", color: "#ef4444" };
  if (s >= BENIGN_T) return { label: "AMBIGUOUS", color: "#f59e0b" };
  return { label: "BENIGN", color: "#22d3ee" };
}

export default function TopologyOfFragility() {
  const mountRef = useRef<HTMLDivElement>(null);
  const s = useRef<{
    renderer: THREE.WebGLRenderer | null;
    scene: THREE.Scene | null;
    cam: THREE.PerspectiveCamera | null;
    mesh: THREE.InstancedMesh | null;
    mat: THREE.MeshStandardMaterial | null;
    raf: number | null;
    orbit: { phi: number; theta: number; dist: number };
    drag: { on: boolean; lx: number; ly: number };
    mv: THREE.Vector2;
    dummy: THREE.Object3D;
    offsets: { x: number; z: number; targetH: number }[];
    t: number;
    startTime: number;
  }>({
    renderer: null, scene: null, cam: null, mesh: null, mat: null, raf: null,
    orbit: { phi: 0.72, theta: 0.38, dist: 30 },
    drag: { on: false, lx: 0, ly: 0 },
    mv: new THREE.Vector2(),
    dummy: new THREE.Object3D(),
    offsets: [],
    t: 0, startTime: 0,
  });
  const [hovered, setHovered] = useState<{
    name: string;
    chr: number;
    score: number;
    fn: string;
    px: number;
    py: number;
  } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const r = s.current;
    const W = el.clientWidth, H = el.clientHeight;

    // ── Renderer ────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    el.appendChild(renderer.domElement);
    r.renderer = renderer;

    // ── Scene + Fog ──────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020710);
    scene.fog = new THREE.FogExp2(0x020710, 0.019);
    r.scene = scene;

    // ── Camera ───────────────────────────────────────────────────
    const cam = new THREE.PerspectiveCamera(52, W / H, 0.1, 200);
    r.cam = cam;

    // ── Lights ───────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x06122a, 5));
    const sun = new THREE.DirectionalLight(0xd8eeff, 2.0);
    sun.position.set(12, 25, 6);
    scene.add(sun);
    const back = new THREE.DirectionalLight(0x001444, 1.2);
    back.position.set(-14, 4, -14);
    scene.add(back);
    const glow = new THREE.PointLight(0xff2200, 1.2, 22);
    glow.position.set(6, 10, -10);
    scene.add(glow);

    // ── Ground ───────────────────────────────────────────────────
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({ color: 0x010407, roughness: 1, metalness: 0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    scene.add(ground);

    const grid = new THREE.GridHelper(60, 48, 0x040e1c, 0x040e1c);
    grid.material.transparent = true;
    grid.material.opacity = 0.7;
    scene.add(grid);

    // ── Gene Pillars ─────────────────────────────────────────────
    // Sort by chromosome then by score descending for regional clustering
    const sorted = [...GENES].sort((a, b) => a[1] !== b[1] ? a[1] - b[1] : b[3] - a[3]);
    const numRows = Math.ceil(sorted.length / GRID_W);

    // Precompute grid positions
    r.offsets = sorted.map((_, i) => ({
      x: (i % GRID_W - (GRID_W - 1) / 2) * SPACING,
      z: (Math.floor(i / GRID_W) - (numRows - 1) / 2) * SPACING,
      targetH: Math.max(0.05, sorted[i][3] * MAX_H),
    }));

    const geo = new THREE.BoxGeometry(0.98, 1, 0.98);
    const mat = new THREE.MeshStandardMaterial({
      metalness: 0.08,
      roughness: 0.72,
      emissive: new THREE.Color(0x00080f),
      emissiveIntensity: 0.4,
    });
    r.mat = mat;

    const mesh = new THREE.InstancedMesh(geo, mat, sorted.length);
    r.mesh = mesh;

    // Initialize all pillars flat
    sorted.forEach((_, i) => {
      const { x, z } = r.offsets[i];
      r.dummy.position.set(x, 0.025, z);
      r.dummy.scale.set(1, 0.05, 1);
      r.dummy.updateMatrix();
      mesh.setMatrixAt(i, r.dummy.matrix);
      mesh.setColorAt(i, scoreToColor(sorted[i][3]));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    scene.add(mesh);

    // Store for raycasting
    mesh.userData.sorted = sorted;

    // ── Interaction ──────────────────────────────────────────────
    const ray = new THREE.Raycaster();

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      r.mv.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      r.mv.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (r.drag.on) {
        r.orbit.phi += (e.clientX - r.drag.lx) * 0.004;
        r.orbit.theta = Math.max(0.08, Math.min(1.15,
          r.orbit.theta - (e.clientY - r.drag.ly) * 0.004));
        r.drag.lx = e.clientX;
        r.drag.ly = e.clientY;
      }

      ray.setFromCamera(r.mv, cam);
      const hits = ray.intersectObject(mesh);
      if (hits.length > 0 && hits[0].instanceId !== undefined) {
        const g = sorted[hits[0].instanceId];
        setHovered({ name: g[0], chr: g[1], score: g[3], fn: g[4], px: e.clientX, py: e.clientY });
      } else {
        setHovered(null);
      }
    };

    const onDown = (e: MouseEvent) => { r.drag = { on: true, lx: e.clientX, ly: e.clientY }; };
    const onUp = () => { r.drag.on = false; };
    const onWheel = (e: WheelEvent) => {
      r.orbit.dist = Math.max(10, Math.min(58, r.orbit.dist + e.deltaY * 0.04));
    };
    const onResize = () => {
      cam.aspect = el.clientWidth / el.clientHeight;
      cam.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mousedown", onDown);
    el.addEventListener("mouseup", onUp);
    window.addEventListener("mouseup", onUp);
    el.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("resize", onResize);

    // ── Animate ──────────────────────────────────────────────────
    const RISE_MS = 2400;
    r.startTime = performance.now();

    const animate = () => {
      r.raf = requestAnimationFrame(animate);
      r.t += 0.009;

      // Rising intro: cubic ease-out
      const elapsed = performance.now() - r.startTime;
      if (elapsed < RISE_MS) {
        const raw = Math.min(1, elapsed / RISE_MS);
        const eased = 1 - Math.pow(1 - raw, 3);
        r.offsets.forEach(({ x, z, targetH }, i) => {
          const h = 0.05 + (targetH - 0.05) * eased;
          r.dummy.position.set(x, h / 2, z);
          r.dummy.scale.set(1, h, 1);
          r.dummy.updateMatrix();
          mesh.setMatrixAt(i, r.dummy.matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
      }

      // Auto-orbit when not dragging
      if (!r.drag.on) r.orbit.phi += 0.0005;

      // Camera position from spherical coords
      const { phi, theta, dist } = r.orbit;
      cam.position.set(
        dist * Math.sin(phi) * Math.cos(theta),
        dist * Math.sin(theta),
        dist * Math.cos(phi) * Math.cos(theta)
      );
      cam.lookAt(0, 1.8, 0);

      // Subtle global emissive breathe
      mat.emissiveIntensity = 0.28 + Math.sin(r.t * 0.7) * 0.08;

      renderer.render(scene, cam);
    };

    animate();
    setTimeout(() => setReady(true), 500);

    return () => {
      if (r.raf) cancelAnimationFrame(r.raf);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mousedown", onDown);
      el.removeEventListener("mouseup", onUp);
      window.removeEventListener("mouseup", onUp);
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  const cls = hovered ? classify(hovered.score) : null;

  return (
    <div style={{ width: "100%", height: "100vh", background: "#020710", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'IBM Plex Mono', monospace; }
        .tof-mount { cursor: grab; user-select: none; -webkit-user-select: none; }
        .tof-mount:active { cursor: grabbing; }
      `}</style>

      {/* Three.js canvas */}
      <div ref={mountRef} className="tof-mount" style={{ width: "100%", height: "100%" }} />

      {/* ── Title ── */}
      <div style={{
        position: "absolute", top: 28, left: 32, pointerEvents: "none",
        opacity: ready ? 1 : 0, transition: "opacity 1.4s ease",
        fontFamily: "'IBM Plex Mono', monospace",
      }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#173a5a", marginBottom: 8 }}>
          ALPHAMISSENSE · DEEPMIND · GRCh38
        </div>
        <div style={{ fontSize: 21, fontWeight: 300, letterSpacing: "0.07em", color: "#c8dff0", lineHeight: 1.2 }}>
          TOPOLOGY<br />OF FRAGILITY
        </div>
        <div style={{ marginTop: 10, fontSize: 8, color: "#0b1e2f", letterSpacing: "0.22em" }}>
          {GENES.length} CANONICAL GENES · PATHOGENICITY TERRAIN
        </div>
      </div>

      {/* ── Legend ── */}
      <div style={{
        position: "absolute", bottom: 38, left: 32, pointerEvents: "none",
        opacity: ready ? 1 : 0, transition: "opacity 1.4s ease 0.6s",
        fontFamily: "'IBM Plex Mono', monospace",
      }}>
        {[
          ["BENIGN",     "#22d3ee", "< 0.340"],
          ["AMBIGUOUS",  "#f59e0b", "0.340–0.564"],
          ["PATHOGENIC", "#ef4444", "≥ 0.564"],
        ].map(([label, color, range]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
            <div style={{ width: 2, height: 13, background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 8, color, letterSpacing: "0.22em" }}>{label}</span>
            <span style={{ fontSize: 8, color: "#0a1f30", letterSpacing: "0.12em" }}>{range}</span>
          </div>
        ))}
      </div>

      {/* ── Corner credits ── */}
      <div style={{
        position: "absolute", bottom: 38, right: 32, textAlign: "right",
        pointerEvents: "none", opacity: ready ? 1 : 0, transition: "opacity 1.4s ease 0.8s",
        fontFamily: "'IBM Plex Mono', monospace",
      }}>
        {["SOURCE · DM_ALPHAMISSENSE GCS", "DRAG · ORBIT    SCROLL · ZOOM"].map((t, i) => (
          <div key={i} style={{ fontSize: 8, color: "#081828", letterSpacing: "0.18em", marginBottom: 4 }}>{t}</div>
        ))}
      </div>

      {/* ── Gene hover card ── */}
      {hovered && cls && (
        <div style={{
          position: "fixed",
          left: Math.min(hovered.px + 20, window.innerWidth - 195),
          top: Math.max(10, hovered.py - 85),
          width: 178,
          background: "rgba(2, 7, 16, 0.97)",
          border: `1px solid ${cls.color}22`,
          borderLeft: `2px solid ${cls.color}`,
          padding: "13px 16px",
          pointerEvents: "none",
          backdropFilter: "blur(14px)",
          fontFamily: "'IBM Plex Mono', monospace",
        }}>
          <div style={{ fontSize: 15, fontWeight: 400, color: "#dceefa", letterSpacing: "0.07em", marginBottom: 3 }}>
            {hovered.name}
          </div>
          <div style={{ fontSize: 8, color: cls.color, letterSpacing: "0.24em", marginBottom: 12 }}>
            {cls.label}
          </div>
          <div style={{ display: "flex", gap: 16, marginBottom: 11 }}>
            <div>
              <div style={{ fontSize: 7, color: "#102030", letterSpacing: "0.15em", marginBottom: 2 }}>AM SCORE</div>
              <div style={{ fontSize: 14, color: cls.color }}>{hovered.score.toFixed(3)}</div>
            </div>
            <div>
              <div style={{ fontSize: 7, color: "#102030", letterSpacing: "0.15em", marginBottom: 2 }}>CHR</div>
              <div style={{ fontSize: 14, color: "#3d7da8" }}>{hovered.chr === 23 ? "X" : hovered.chr}</div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #0b1e30", paddingTop: 9 }}>
            <div style={{ fontSize: 7, color: "#102030", letterSpacing: "0.15em", marginBottom: 3 }}>FUNCTION</div>
            <div style={{ fontSize: 8.5, color: "#3d7da8", lineHeight: 1.5 }}>{hovered.fn}</div>
          </div>
        </div>
      )}

      {/* ── Loading screen ── */}
      {!ready && (
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center", background: "#020710",
          fontFamily: "'IBM Plex Mono', monospace",
        }}>
          <div style={{ fontSize: 9, color: "#0e2840", letterSpacing: "0.35em" }}>
            RENDERING PROTEOME LANDSCAPE...
          </div>
        </div>
      )}
    </div>
  );
}
