import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  effect,
} from '@angular/core';
import {
  AmbientLight,
  Clock,
  Color,
  DirectionalLight,
  GridHelper,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  Vector2,
  WebGLRenderer,
  SRGBColorSpace,
  PCFSoftShadowMap,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BuilderStoreService } from '../services/builder-store.service';
import { createBrickMesh } from '../builder/mesh-factory';
import { PlacedBrick } from '../builder/lego-types';

@Component({
  selector: 'app-builder-canvas',
  standalone: true,
  template: `
    <div
      #host
      class="canvas-shell"
      (pointerdown)="handlePointerDown($event)"
    ></div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .canvas-shell {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 18rem;
        border-radius: 1.5rem;
        border: 1px solid rgba(30, 41, 59, 0.8);
        overflow: hidden;
        background: radial-gradient(circle at 50% 20%, rgba(30, 64, 175, 0.15), rgba(2, 6, 23, 0.95));
      }

      :host canvas {
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class BuilderCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('host', { static: true }) private hostRef!: ElementRef<HTMLDivElement>;

  private renderer!: WebGLRenderer;
  private scene!: Scene;
  private camera!: PerspectiveCamera;
  private controls!: OrbitControls;
  private resizeObserver!: ResizeObserver;
  private ground!: Mesh;
  private raycaster = new Raycaster();
  private pointer = new Vector2();
  private clock = new Clock();
  private brickGroups = new Map<string, Group>();
  private animationHandle: number | null = null;

  constructor(
    private readonly zone: NgZone,
    private readonly store: BuilderStoreService,
    private readonly destroyRef: DestroyRef,
  ) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.initScene();
      this.initRenderer();
      this.attachCanvas();
      this.initControls();
      this.syncBricks(this.store.placedBricks());

      this.resizeObserver = new ResizeObserver(() => this.updateSize());
      this.resizeObserver.observe(this.hostRef.nativeElement);
      this.updateSize();

      this.animationHandle = this.renderer.setAnimationLoop(() => this.renderFrame());
    });

    const syncEffect = effect(() => {
      const bricks = this.store.placedBricks();
      if (!this.renderer) {
        return;
      }
      this.zone.runOutsideAngular(() => this.syncBricks(bricks));
    });

    this.destroyRef.onDestroy(() => syncEffect.destroy());
  }

  ngOnDestroy(): void {
    if (this.animationHandle !== null) {
      this.renderer.setAnimationLoop(null);
      cancelAnimationFrame(this.animationHandle);
    }
    this.controls?.dispose();
    this.resizeObserver?.disconnect();
    this.disposeScene();
    this.renderer?.dispose();
  }

  handlePointerDown(event: PointerEvent): void {
    if (!this.hostRef || event.button !== 0) return;

    const rect = this.hostRef.nativeElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObject(this.ground, false);
    if (intersects.length) {
      const point = intersects[0].point.clone();
      this.zone.run(() => this.store.addBrickAtPoint(point));
    }
  }

  private initScene(): void {
    this.scene = new Scene();
    this.scene.background = new Color('#050713');

    this.camera = new PerspectiveCamera(50, 1, 0.1, 200);
    this.camera.position.set(18, 18, 18);

    const ambient = new AmbientLight(0xffffff, 0.55);
    this.scene.add(ambient);

    const keyLight = new DirectionalLight(0xffffff, 0.95);
    keyLight.position.set(15, 24, 18);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 120;
    this.scene.add(keyLight);

    const rimLight = new DirectionalLight(0x88c0ff, 0.35);
    rimLight.position.set(-18, 16, -12);
    this.scene.add(rimLight);

    const grid = new GridHelper(40, 50, 0x1f2937, 0x111827);
    this.scene.add(grid);

    const baseMaterial = new MeshStandardMaterial({
      color: '#0f172a',
      roughness: 0.8,
      metalness: 0.05,
    });
    const baseGeometry = new PlaneGeometry(60, 60);
    this.ground = new Mesh(baseGeometry, baseMaterial);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);
  }

  private initRenderer(): void {
    this.renderer = new WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
  }

  private attachCanvas(): void {
    const container = this.hostRef.nativeElement;
    container.appendChild(this.renderer.domElement);
  }

  private initControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 6;
    this.controls.maxDistance = 48;
    this.controls.target.set(0, 2, 0);
  }

  private updateSize(): void {
    const container = this.hostRef.nativeElement;
    const { clientWidth, clientHeight } = container;
    if (!clientWidth || !clientHeight) {
      return;
    }

    this.renderer.setSize(clientWidth, clientHeight);
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
  }

  private renderFrame(): void {
    const delta = this.clock.getDelta();
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private syncBricks(bricks: PlacedBrick[]): void {
    const seen = new Set<string>();

    for (const brick of bricks) {
      seen.add(brick.id);
      const existing = this.brickGroups.get(brick.id);
      if (existing) {
        existing.position.set(...brick.position);
        existing.rotation.y = brick.rotation;
        continue;
      }

      const group = createBrickMesh(brick);
      this.scene.add(group);
      this.brickGroups.set(brick.id, group);
    }

    for (const [id, group] of this.brickGroups) {
      if (!seen.has(id)) {
        this.scene.remove(group);
        group.traverse(child => {
          if (child instanceof Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach(material => material.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
        this.brickGroups.delete(id);
      }
    }
  }

  private disposeScene(): void {
    this.scene.traverse(object => {
      if (object instanceof Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  }
}
