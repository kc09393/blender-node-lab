// Three.js 即時預覽場景封裝。
// 用途：把「目前的材質（THREE.Material）套在一個可切換的預覽物件上」這件事，
// 從沙盒/教學頁面的其他邏輯中完全隔離開來。
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// Wireframe 節點需要每個頂點的重心座標（barycentric coordinates）才能判斷片元離三角形
// 的哪條邊比較近；這個資料只能逐三角形指定（同一個頂點在不同三角形裡的重心座標不同），
// 所以要先把幾何體攤平成 non-indexed（每個三角形都有自己專屬的 3 個頂點，不共用索引），
// 再依三角形內的位置給 (1,0,0)/(0,1,0)/(0,0,1)。
function withBarycentric(geometry) {
  const flat = geometry.index ? geometry.toNonIndexed() : geometry;
  if (geometry.index) geometry.dispose();
  const vertexCount = flat.attributes.position.count;
  const barycentric = new Float32Array(vertexCount * 3);
  for (let i = 0; i < vertexCount; i++) {
    const corner = i % 3;
    barycentric[i * 3 + corner] = 1;
  }
  flat.setAttribute("barycentric", new THREE.BufferAttribute(barycentric, 3));
  return flat;
}

const GEOMETRIES = {
  sphere: () => withBarycentric(new THREE.SphereGeometry(1, 64, 48)),
  cube: () => withBarycentric(new THREE.BoxGeometry(1.5, 1.5, 1.5, 4, 4, 4)),
  plane: () => withBarycentric(new THREE.PlaneGeometry(2.2, 2.2, 32, 32)),
  torus: () => withBarycentric(new THREE.TorusKnotGeometry(0.8, 0.28, 180, 24)),
};

export class Preview3D {
  constructor(container) {
    this.container = container;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1b1b1e);

    this.camera = new THREE.PerspectiveCamera(40, 1, 0.05, 100);
    this.camera.position.set(2.4, 1.5, 2.8);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 1.2;
    this.controls.maxDistance = 10;

    // 沒有外部 HDRI 檔案，用 Three.js 內建的 RoomEnvironment 產生程序化環境反射光，
    // 對 Principled BSDF 這類需要環境反射的材質很重要（否則金屬/玻璃看起來像死黑一片）。
    this.pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envTexture = this.pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
    this.scene.environment = this.envTexture;

    // 三點打光：主光（會投影）＋補光（減少死黑陰影）＋輪廓光（讓邊緣，尤其玻璃/金屬的輪廓更立體），
    // 單一個平行光配上一片死黑背景很容易讓任何材質都顯得死板、沒有立體感。
    const keyLight = new THREE.DirectionalLight(0xfff4e6, 2.2);
    keyLight.position.set(3, 4.5, 2.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -3;
    keyLight.shadow.camera.right = 3;
    keyLight.shadow.camera.top = 3;
    keyLight.shadow.camera.bottom = -3;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 12;
    keyLight.shadow.bias = -0.0015;
    keyLight.shadow.radius = 3;
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdce8ff, 0.55);
    fillLight.position.set(-3, 1.5, -1.5);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.1);
    rimLight.position.set(-1.5, 2, -3.5);
    this.scene.add(rimLight);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.1));

    // 地板：接受陰影、給物體一個「站在地上」的立足點，避免懸空漂浮在純黑背景裡的廉價感。
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 24),
      new THREE.MeshStandardMaterial({ color: 0x232326, roughness: 0.9, metalness: 0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.4;
    ground.receiveShadow = true;
    this.scene.add(ground);

    this.mesh = null;
    this.currentMeshKind = null;
    this.setMesh("sphere");

    this._resizeObserver = new ResizeObserver(() => this._resize());
    this._resizeObserver.observe(container);
    this._resize();

    this._tick = this._tick.bind(this);
    this._raf = requestAnimationFrame(this._tick);
  }

  setMesh(kind) {
    if (!GEOMETRIES[kind]) throw new Error(`未知的預覽物件類型: ${kind}`);
    if (this.currentMeshKind === kind) return;
    const prevMaterial = this.mesh ? this.mesh.material : null;
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
    }
    const geometry = GEOMETRIES[kind]();
    const material = prevMaterial || new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.5, metalness: 0 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = false;
    this.scene.add(this.mesh);
    this.currentMeshKind = kind;
  }

  setMaterial(material) {
    if (this.mesh.material && this.mesh.material !== material) {
      this.mesh.material.dispose();
    }
    this.mesh.material = material;
  }

  getMaterial() {
    return this.mesh.material;
  }

  _resize() {
    const w = this.container.clientWidth || 1;
    const h = this.container.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  _tick() {
    this._raf = requestAnimationFrame(this._tick);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    cancelAnimationFrame(this._raf);
    this._resizeObserver.disconnect();
    this.controls.dispose();
    this.renderer.dispose();
    this.pmrem.dispose();
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
    }
    this.container.removeChild(this.renderer.domElement);
  }
}
