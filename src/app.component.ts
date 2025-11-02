import { Component, ChangeDetectionStrategy, computed, signal } from '@angular/core';

type AppTab = 'builder' | 'library' | 'projects' | 'market' | 'learning';
type TouchMode = 'build' | 'pan' | 'erase' | 'inspect';
type OptimizationStatus = 'ready' | 'planned' | 'todo';

interface ColorOption {
  name: string;
  hex: string;
  finish: 'matte' | 'glossy' | 'transparent' | 'metallic';
}

interface Brick {
  id: string;
  name: string;
  studs: string;
  complexity: 'basic' | 'advanced' | 'technic';
  compatibleWith: string[];
  geometry: string;
  recommendedUse: string;
}

interface BrickCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface PlacedBrick {
  id: string;
  brickId: string;
  color: ColorOption;
  rotation: 0 | 90 | 180 | 270;
  metadata: {
    height: number;
    layerId: number;
    notes?: string;
  };
}

interface Layer {
  id: number;
  name: string;
  elevation: number;
  isLocked: boolean;
  grid: (PlacedBrick | null)[][];
}

interface ProjectCard {
  id: string;
  name: string;
  description: string;
  bricksUsed: number;
  lastEdited: string;
  progress: number;
  tags: string[];
  accent: string;
}

interface InstructionStep {
  order: number;
  title: string;
  description: string;
  highlightCells: { x: number; y: number }[];
  focus: string;
}

interface MarketplaceItem {
  id: string;
  title: string;
  designer: string;
  brickCount: number;
  price: string;
  rating: number;
  tags: string[];
  accent: string;
  optimizedFor: string[];
}

interface ActionLogItem {
  timestamp: string;
  type: 'build' | 'edit' | 'export' | 'info';
  label: string;
  details: string;
}

interface SessionStats {
  totalBricks: number;
  uniqueColors: number;
  lastAction: string | null;
  density: number;
  complexity: 'Starter' | 'Intermediate' | 'Expert';
  exportReady: boolean;
}

interface TouchModeConfig {
  id: TouchMode;
  label: string;
  description: string;
}

interface AndroidOptimization {
  id: string;
  title: string;
  description: string;
  status: OptimizationStatus;
  tool: string;
}

interface LearningTrack {
  id: string;
  title: string;
  focus: string;
  duration: string;
  checkpoints: string[];
}

interface InspectorFocus {
  row: number;
  column: number;
  layerId: number;
  brick: PlacedBrick;
}

interface ShareOption {
  id: string;
  label: string;
  target: string;
  description: string;
}

type LayerSnapshot = Layer[];

type DrawerView = 'library' | 'palette' | 'steps';

interface WorkspaceToolbarButton {
  id: string;
  label: string;
  icon: string;
  hint?: string;
  mode?: TouchMode;
  drawer?: DrawerView;
  action?: 'undo' | 'reset' | 'export';
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [],
})
export class AppComponent {
  readonly boardSize = 12;

  readonly appTabs: { id: AppTab; label: string; tagline: string }[] = [
    { id: 'builder', label: 'Studio Builder', tagline: 'Touch-first brick modeling workspace' },
    { id: 'library', label: 'Brick Library', tagline: 'Browse adaptive brick inventories' },
    { id: 'projects', label: 'Projects', tagline: 'Manage cloud-synced layouts' },
    { id: 'market', label: 'Marketplace', tagline: 'Curated mobile-ready kits' },
    { id: 'learning', label: 'Learning Lab', tagline: 'Guided missions & courses' },
  ];

  readonly menuBarItems: string[] = ['Studio', 'File', 'Edit', 'Model', 'View', 'Tools', 'BrickLink', 'Help'];

  readonly workspaceToolbar: WorkspaceToolbarButton[] = [
    {
      id: 'select',
      label: 'Select',
      icon: 'SEL',
      hint: 'Tap to place and adjust bricks',
      mode: 'build',
    },
    {
      id: 'pan',
      label: 'Pan',
      icon: 'PAN',
      hint: 'Drag the canvas view',
      mode: 'pan',
    },
    {
      id: 'erase',
      label: 'Erase',
      icon: 'DEL',
      hint: 'Remove placed bricks',
      mode: 'erase',
    },
    {
      id: 'inspect',
      label: 'Inspect',
      icon: 'INS',
      hint: 'Inspect brick metadata',
      mode: 'inspect',
    },
    {
      id: 'library',
      label: 'Library',
      icon: 'LIB',
      hint: 'Open the brick library panel',
      drawer: 'library',
    },
    {
      id: 'palette',
      label: 'Palette',
      icon: 'CLR',
      hint: 'Switch active brick colors',
      drawer: 'palette',
    },
    {
      id: 'steps',
      label: 'Steps',
      icon: 'STP',
      hint: 'Review instruction timeline',
      drawer: 'steps',
    },
    {
      id: 'undo',
      label: 'Undo',
      icon: '?',
      hint: 'Undo last change',
      action: 'undo',
    },
    {
      id: 'reset',
      label: 'Reset',
      icon: 'CLR',
      hint: 'Clear the workspace',
      action: 'reset',
    },
    {
      id: 'export',
      label: 'Export',
      icon: 'EXP',
      hint: 'Generate Android export payload',
      action: 'export',
    },
  ];

  readonly touchModes: TouchModeConfig[] = [
    { id: 'build', label: 'Build', description: 'Place bricks with snap assist' },
    { id: 'pan', label: 'Pan', description: 'Reposition the canvas' },
    { id: 'erase', label: 'Erase', description: 'Remove placed bricks' },
    { id: 'inspect', label: 'Inspect', description: 'Drill into brick metadata' },
  ];

  readonly colorPalette: ColorOption[] = [
    { name: 'Bright Red', hex: '#e11d48', finish: 'glossy' },
    { name: 'Bright Blue', hex: '#2563eb', finish: 'glossy' },
    { name: 'Sunflower', hex: '#facc15', finish: 'matte' },
    { name: 'Frost White', hex: '#f8fafc', finish: 'matte' },
    { name: 'Graphite', hex: '#1f2937', finish: 'matte' },
    { name: 'Trans Light Blue', hex: '#7dd3fc', finish: 'transparent' },
    { name: 'Chrome Gold', hex: '#fbbf24', finish: 'metallic' },
  ];

  readonly brickCategories: BrickCategory[] = [
    {
      id: 'core',
      name: 'Core System',
      icon: 'cube',
      description: '2x bricks for structure and stacking fundamentals.',
    },
    {
      id: 'plates',
      name: 'Plates & Base',
      icon: 'layers',
      description: 'Low-profile plates for floors, terrain, and micro builds.',
    },
    {
      id: 'technic',
      name: 'Technic Motion',
      icon: 'cog',
      description: 'Axles, beams, and gears for mobile-ready mechanisms.',
    },
    {
      id: 'details',
      name: 'Detailing & SNOT',
      icon: 'sparkles',
      description: 'Tiles, clips, and inverse studs for finishing touches.',
    },
  ];

  readonly brickCatalog: Record<string, Brick[]> = {
    core: [
      {
        id: 'brick-2x4',
        name: 'Brick 2x4',
        studs: '2 x 4',
        complexity: 'basic',
        compatibleWith: ['brick-2x2', 'plate-2x4', 'technic-pin-adapter'],
        geometry: 'Rectangular',
        recommendedUse: 'Primary structural backbone in larger builds.',
      },
      {
        id: 'brick-2x2',
        name: 'Brick 2x2',
        studs: '2 x 2',
        complexity: 'basic',
        compatibleWith: ['brick-1x2', 'tile-2x2'],
        geometry: 'Square',
        recommendedUse: 'Reinforcement for corners and compact volumes.',
      },
      {
        id: 'brick-1x4',
        name: 'Brick 1x4',
        studs: '1 x 4',
        complexity: 'basic',
        compatibleWith: ['brick-1x2', 'plate-1x4'],
        geometry: 'Rectangular',
        recommendedUse: 'Long edges and clean exterior lines.',
      },
    ],
    plates: [
      {
        id: 'plate-2x4',
        name: 'Plate 2x4',
        studs: '2 x 4',
        complexity: 'basic',
        compatibleWith: ['brick-2x4', 'tile-2x4'],
        geometry: 'Rectangular',
        recommendedUse: 'Layer transitions and sideways building anchors.',
      },
      {
        id: 'plate-6x6',
        name: 'Plate 6x6',
        studs: '6 x 6',
        complexity: 'advanced',
        compatibleWith: ['brick-2x2', 'technic-turntable'],
        geometry: 'Square',
        recommendedUse: 'Micro-scale terrain and structural foundations.',
      },
      {
        id: 'tile-2x2',
        name: 'Tile 2x2',
        studs: '2 x 2 (tile)',
        complexity: 'advanced',
        compatibleWith: ['brick-2x2', 'plate-2x2'],
        geometry: 'Square tile',
        recommendedUse: 'Smooth finishes for floors and exteriors.',
      },
    ],
    technic: [
      {
        id: 'technic-beam-5',
        name: 'Technic Beam 5',
        studs: '5 modules',
        complexity: 'technic',
        compatibleWith: ['technic-pin', 'technic-axle-5'],
        geometry: 'Beam with pinholes',
        recommendedUse: 'Structural frames for moving assemblies.',
      },
      {
        id: 'technic-gear-20',
        name: 'Gear 20T',
        studs: '20 teeth',
        complexity: 'technic',
        compatibleWith: ['technic-axle-4', 'technic-gear-12'],
        geometry: 'Circular gear',
        recommendedUse: 'Mobile gearing with smooth clutch power.',
      },
      {
        id: 'technic-pin-adapter',
        name: 'Brick w. Technic Pin',
        studs: '1 x 2',
        complexity: 'technic',
        compatibleWith: ['brick-2x4', 'technic-beam-5'],
        geometry: 'Hybrid brick',
        recommendedUse: 'Transitions between System and Technic assemblies.',
      },
    ],
    details: [
      {
        id: 'tile-1x2-grille',
        name: 'Tile 1x2 Grille',
        studs: '1 x 2',
        complexity: 'advanced',
        compatibleWith: ['brick-1x2', 'plate-1x2'],
        geometry: 'Textured tile',
        recommendedUse: 'Vents, intakes, and sci-fi surfaces.',
      },
      {
        id: 'snot-1x1-bracket',
        name: 'Bracket 1x1-1x1',
        studs: '1 x 1 offset',
        complexity: 'advanced',
        compatibleWith: ['tile-1x1', 'plate-1x1'],
        geometry: 'Right-angle bracket',
        recommendedUse: 'Studs Not On Top (SNOT) detail mounting.',
      },
      {
        id: 'curved-slope-2x2',
        name: 'Curved Slope 2x2',
        studs: '2 x 2',
        complexity: 'advanced',
        compatibleWith: ['plate-2x2', 'brick-2x2'],
        geometry: 'Rounded slope',
        recommendedUse: 'Aerodynamic shells and creature design.',
      },
    ],
  };

  readonly instructions: InstructionStep[] = [
    {
      order: 1,
      title: 'Lay the Mobile Foundation',
      description: 'Use plates to set a stable, low-profile base optimized for pocket play.',
      focus: 'Foundation',
      highlightCells: [
        { x: 3, y: 3 },
        { x: 4, y: 3 },
        { x: 5, y: 3 },
        { x: 6, y: 3 },
      ],
    },
    {
      order: 2,
      title: 'Stack the Core Structure',
      description: 'Layer 2x bricks for rigidity. Alternate direction to increase clutch power.',
      focus: 'Structure',
      highlightCells: [
        { x: 4, y: 5 },
        { x: 5, y: 5 },
        { x: 6, y: 5 },
        { x: 7, y: 5 },
      ],
    },
    {
      order: 3,
      title: 'Integrate Motion',
      description: 'Attach technic beams and gears to prepare for articulated play features.',
      focus: 'Mechanism',
      highlightCells: [
        { x: 5, y: 7 },
        { x: 6, y: 7 },
        { x: 7, y: 7 },
      ],
    },
    {
      order: 4,
      title: 'Polish the Surfaces',
      description: 'Finish with tiles, brackets, and SNOT techniques for premium detail.',
      focus: 'Finishing',
      highlightCells: [
        { x: 6, y: 4 },
        { x: 7, y: 4 },
        { x: 8, y: 4 },
      ],
    },
  ];

  readonly recentProjects: ProjectCard[] = [
    {
      id: 'micro-mech',
      name: 'Micro Mech Buddy',
      description: 'Poseable robot companion built for split-screen instructions.',
      bricksUsed: 168,
      lastEdited: '5 minutes ago',
      progress: 82,
      tags: ['Technic hybrid', 'Android 13 ready'],
      accent: 'from-cyan-400/70 to-blue-600/90',
    },
    {
      id: 'compact-speeder',
      name: 'Compact Speeder Bike',
      description: 'Sleek swoop bike engineered for portrait-mode building.',
      bricksUsed: 196,
      lastEdited: '1 hour ago',
      progress: 56,
      tags: ['Speed build', 'AR preview'],
      accent: 'from-amber-400/60 to-orange-600/80',
    },
    {
      id: 'city-rooftop',
      name: 'City Rooftop Diorama',
      description: 'Stacked modular scene featuring play-report overlays.',
      bricksUsed: 342,
      lastEdited: 'Yesterday',
      progress: 23,
      tags: ['Urban', 'Story mode'],
      accent: 'from-rose-400/60 to-purple-700/80',
    },
  ];

  readonly marketplaceItems: MarketplaceItem[] = [
    {
      id: 'sky-harbor',
      title: 'Sky Harbor Patrol',
      designer: 'BrickPilot',
      brickCount: 248,
      price: '$4.99',
      rating: 4.8,
      tags: ['Dual mode', 'Technic'],
      optimizedFor: ['Android Foldables', 'Chromebook'],
      accent: 'from-sky-400/70 to-indigo-700/90',
    },
    {
      id: 'holo-gardens',
      title: 'Holographic Gardens',
      designer: 'Plantastic',
      brickCount: 312,
      price: '$5.49',
      rating: 4.6,
      tags: ['Calming', 'Diorama'],
      optimizedFor: ['Android Tablets'],
      accent: 'from-emerald-400/70 to-teal-700/90',
    },
  ];

  readonly androidOptimizations: AndroidOptimization[] = [
    {
      id: 'haptics',
      title: 'Precision Haptics',
      description: 'Uses Android Vibrations API to pulse when studs snap.',
      status: 'planned',
      tool: 'Capacitor Haptics',
    },
    {
      id: 'gpu',
      title: 'GPU Brick Rendering',
      description: 'WebGL renderer throttled for 60fps on mid-range chipsets.',
      status: 'ready',
      tool: 'Three.js Mobile profile',
    },
    {
      id: 'offline',
      title: 'Offline Brick Cache',
      description: 'Stores brick library for offline cabin builds.',
      status: 'planned',
      tool: 'Capacitor Storage',
    },
    {
      id: 'gestures',
      title: 'Gesture Toolkit',
      description: 'Multi-touch pinch, rotate, and tilt controls tuned for Android.',
      status: 'todo',
      tool: 'HammerJS + Motion',
    },
  ];

  readonly learningTracks: LearningTrack[] = [
    {
      id: 'starter-campaign',
      title: 'Starter Builder Sprint',
      focus: 'Habits & fundamentals',
      duration: '45 minutes',
      checkpoints: [
        'Snap tracking basics',
        'Layer elevation strategy',
        'Android cadence optimizations',
      ],
    },
    {
      id: 'technic-lab',
      title: 'Technic Motion Lab',
      focus: 'Gear trains & robotics',
      duration: '90 minutes',
      checkpoints: [
        'Axle bracing',
        'Hybrid system joinery',
        'Motion stress testing',
      ],
    },
    {
      id: 'showcase',
      title: 'Showcase Studio Mode',
      focus: 'Presentation & AR',
      duration: '60 minutes',
      checkpoints: [
        'Scene lighting',
        'Story beats',
        'AR instruction export',
      ],
    },
  ];

  readonly shareOptions: ShareOption[] = [
    {
      id: 'bricklink',
      label: 'Export BrickLink Parts',
      target: 'BrickLink XML',
      description: 'Generate wanted lists for rapid sourcing.',
    },
    {
      id: 'studio',
      label: 'Open in Studio Desktop',
      target: 'BrickLink Studio',
      description: 'Continue with full 3D rendering and instructions.',
    },
    {
      id: 'apk',
      label: 'Prepare Android APK',
      target: 'Android Build',
      description: 'Bundle with Capacitor for mobile distribution.',
    },
  ];

  activeTab = signal<AppTab>('builder');
  selectedTouchMode = signal<TouchMode>('build');
  selectedColorIndex = signal(0);
  selectedCategoryId = signal<string>('core');
  selectedBrickId = signal<string | null>(null);
  activeLayerIndex = signal(0);
  selectedInstructionStep = signal<number>(1);
  selectedProjectId = signal<string | null>(null);
  exportPreview = signal<string | null>(null);
  inspectorFocus = signal<InspectorFocus | null>(null);
  actionLog = signal<ActionLogItem[]>([]);
  sessionStats = signal<SessionStats>({
    totalBricks: 0,
    uniqueColors: 0,
    lastAction: null,
    density: 0,
    complexity: 'Starter',
    exportReady: false,
  });

  private readonly history = signal<LayerSnapshot[]>([]);

  activeDrawer = signal<DrawerView | null>(null);

  layers = signal<Layer[]>([
    {
      id: 1,
      name: 'Base Layer',
      elevation: 0,
      isLocked: false,
      grid: this.createEmptyGrid(),
    },
  ]);

  visibleBricks = computed(() => this.brickCatalog[this.selectedCategoryId()] ?? []);

  activeBrick = computed(() => {
    const bricks = this.visibleBricks();
    const selectedId = this.selectedBrickId();
    if (!bricks.length) {
      return null;
    }
    if (!selectedId) {
      return bricks[0];
    }
    return bricks.find(brick => brick.id === selectedId) ?? bricks[0];
  });

  currentLayer = computed(() => {
    const layers = this.layers();
    const index = this.activeLayerIndex();
    return layers[index] ?? layers[0];
  });

  currentGrid = computed(() => this.currentLayer()?.grid ?? this.createEmptyGrid());

  activeInstruction = computed(() => {
    const step = this.selectedInstructionStep();
    return this.instructions.find(instruction => instruction.order === step) ?? this.instructions[0] ?? null;
  });

  activeProject = computed(() => {
    const projectId = this.selectedProjectId();
    if (!projectId) {
      return this.recentProjects[0] ?? null;
    }
    return this.recentProjects.find(project => project.id === projectId) ?? this.recentProjects[0] ?? null;
  });

  selectedColor = computed(() => this.colorPalette[this.selectedColorIndex()] ?? this.colorPalette[0]);

  constructor() {
    const initialCategory = this.brickCategories[0]?.id ?? 'core';
    this.selectedCategoryId.set(initialCategory);
    const initialBrick = this.brickCatalog[initialCategory]?.[0]?.id ?? null;
    this.selectedBrickId.set(initialBrick);
    const initialInstruction = this.instructions[0]?.order ?? 1;
    this.selectedInstructionStep.set(initialInstruction);
    const initialProject = this.recentProjects[0]?.id ?? null;
    this.selectedProjectId.set(initialProject);
    this.updateStats('Initialized workspace');
  }

  setActiveTab(tab: AppTab): void {
    this.activeTab.set(tab);
    this.logAction('info', 'Switched workspace', `Switched to ${tab} view.`);
  }

  selectTouchMode(mode: TouchMode): void {
    this.selectedTouchMode.set(mode);
    this.logAction('info', 'Touch mode', `Touch mode set to ${mode}.`);
  }

  handleToolbarButton(button: WorkspaceToolbarButton): void {
    if (button.mode) {
      this.selectTouchMode(button.mode);
    }
    if (button.drawer) {
      this.toggleDrawer(button.drawer);
    }
    if (button.action === 'undo') {
      this.undo();
    }
    if (button.action === 'reset') {
      this.clearBoard();
    }
    if (button.action === 'export') {
      this.generateExportPayload();
    }
  }

  isToolbarButtonActive(button: WorkspaceToolbarButton): boolean {
    if (button.mode) {
      return this.selectedTouchMode() === button.mode;
    }
    if (button.drawer) {
      return this.activeDrawer() === button.drawer;
    }
    return false;
  }

  selectColor(index: number): void {
    if (!this.colorPalette[index]) return;
    this.selectedColorIndex.set(index);
    this.logAction('info', 'Color updated', `Selected color ${this.colorPalette[index].name}.`);
  }

  selectCategory(categoryId: string): void {
    if (!this.brickCatalog[categoryId]) return;
    this.selectedCategoryId.set(categoryId);
    const firstBrick = this.brickCatalog[categoryId]?.[0]?.id ?? null;
    this.selectedBrickId.set(firstBrick);
    this.logAction('info', 'Category switched', `Viewing ${categoryId} bricks.`);
  }

  selectBrick(brickId: string): void {
    this.selectedBrickId.set(brickId);
    const brick = this.brickCatalog[this.selectedCategoryId()]?.find(item => item.id === brickId);
    if (brick) {
      this.logAction('info', 'Brick selected', `Focused ${brick.name}.`);
    }
  }

  setActiveLayer(index: number): void {
    if (index < 0 || index >= this.layers().length) return;
    this.activeLayerIndex.set(index);
    const layer = this.layers()[index];
    this.logAction('info', 'Layer activated', `${layer.name} is now active.`);
  }

  toggleLayerLock(layerId: number): void {
    const layers = this.cloneLayers(this.layers());
    const index = layers.findIndex(layer => layer.id === layerId);
    if (index === -1) return;
    layers[index].isLocked = !layers[index].isLocked;
    this.layers.set(layers);
    this.logAction('edit', 'Layer lock toggled', `${layers[index].name} locked: ${layers[index].isLocked}.`);
  }

  addLayer(): void {
    const layers = this.cloneLayers(this.layers());
    const layerCount = layers.length;
    const newLayer: Layer = {
      id: Date.now(),
      name: `Layer ${layerCount + 1}`,
      elevation: layerCount,
      isLocked: false,
      grid: this.createEmptyGrid(),
    };
    this.pushHistory();
    layers.push(newLayer);
    this.layers.set(layers);
    this.activeLayerIndex.set(layers.length - 1);
    this.logAction('build', 'Layer added', `${newLayer.name} created.`);
    this.updateStats('Added layer');
  }

  clearBoard(): void {
    this.pushHistory();
    this.layers.set([
      {
        id: Date.now(),
        name: 'Base Layer',
        elevation: 0,
        isLocked: false,
        grid: this.createEmptyGrid(),
      },
    ]);
    this.activeLayerIndex.set(0);
    this.inspectorFocus.set(null);
    this.logAction('edit', 'Workspace cleared', 'Reset all layers to empty.');
    this.updateStats('Cleared workspace');
  }

  undo(): void {
    const history = this.history();
    if (!history.length) return;
    const previous = history[history.length - 1];
    this.layers.set(this.cloneLayers(previous));
    this.history.set(history.slice(0, -1));
    const activeIndex = Math.min(this.activeLayerIndex(), this.layers().length - 1);
    this.activeLayerIndex.set(Math.max(activeIndex, 0));
    this.logAction('edit', 'Undo', 'Reverted the last canvas update.');
    this.updateStats('Undo');
  }

  toggleDrawer(drawer: DrawerView): void {
    this.activeDrawer.set(this.activeDrawer() === drawer ? null : drawer);
  }

  closeDrawer(): void {
    this.activeDrawer.set(null);
  }

  onCanvasCellTap(row: number, column: number): void {
    const layer = this.currentLayer();
    if (!layer || layer.isLocked) {
      this.logAction('info', 'Layer locked', 'Unlock the layer before editing.');
      return;
    }

    const mode = this.selectedTouchMode();
    const layers = this.cloneLayers(this.layers());
    const activeIndex = this.layers().findIndex(item => item.id === layer.id);
    if (activeIndex === -1) return;
    const targetLayer = layers[activeIndex];

    if (mode === 'inspect') {
      const cell = targetLayer.grid[row][column];
      if (cell) {
        this.inspectorFocus.set({ row, column, layerId: targetLayer.id, brick: cell });
        this.logAction('info', 'Inspect brick', `Inspecting ${cell.brickId} on layer ${targetLayer.name}.`);
      } else {
        this.inspectorFocus.set(null);
      }
      return;
    }

    if (mode === 'pan') {
      this.logAction('info', 'Pan mode', 'Use touch drag gestures to pan.');
      return;
    }

    const cell = targetLayer.grid[row][column];

    if (mode === 'erase') {
      if (!cell) return;
      this.pushHistory();
      targetLayer.grid[row][column] = null;
      this.layers.set(layers);
      this.inspectorFocus.set(null);
      this.logAction('edit', 'Removed brick', `Removed ${cell.brickId} at ${row},${column}.`);
      this.updateStats('Removed brick');
      return;
    }

    const brick = this.activeBrick();
    const color = this.selectedColor();
    if (!brick || !color) return;

    this.pushHistory();
    const brickId = `pb-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    targetLayer.grid[row][column] = {
      id: brickId,
      brickId: brick.id,
      color: { ...color },
      rotation: 0,
      metadata: {
        height: 1,
        layerId: targetLayer.id,
        notes: `Placed ${brick.name} via mobile builder.`,
      },
    };
    this.layers.set(layers);
    this.inspectorFocus.set({ row, column, layerId: targetLayer.id, brick: targetLayer.grid[row][column]! });
    this.logAction('build', 'Placed brick', `${brick.name} in ${color.name}.`);
    this.updateStats('Placed brick');
  }

  isCellHighlighted(row: number, column: number): boolean {
    const instruction = this.activeInstruction();
    if (!instruction) return false;
    return instruction.highlightCells.some(cell => cell.x === column && cell.y === row);
  }

  generateExportPayload(): void {
    const snapshot = {
      generatedAt: new Date().toISOString(),
      totalLayers: this.layers().length,
      stats: this.sessionStats(),
      layers: this.layers().map(layer => ({
        id: layer.id,
        name: layer.name,
        elevation: layer.elevation,
        bricks: layer.grid.flatMap((row, rowIndex) =>
          row
            .map((cell, columnIndex) =>
              cell
                ? {
                    row: rowIndex,
                    column: columnIndex,
                    brickId: cell.brickId,
                    color: cell.color.name,
                    hex: cell.color.hex,
                    rotation: cell.rotation,
                  }
                : null,
            )
            .filter(Boolean),
        ),
      })),
      android: {
        targetSdk: 35,
        minimumSdk: 26,
        bundle: 'com.lego.build.studio',
        renderingProfile: 'GLES3-mobile',
        primaryFeatures: ['Haptics', 'Offline cache', 'Gesture kit'],
      },
    };

    this.exportPreview.set(JSON.stringify(snapshot, null, 2));
    this.logAction('export', 'Generated export payload', 'Ready for Android bundling.');
    this.updateStats('Generated export');
  }

  closeExportPreview(): void {
    this.exportPreview.set(null);
  }

  setInstructionStep(step: number): void {
    this.selectedInstructionStep.set(step);
    const instruction = this.instructions.find(item => item.order === step);
    if (instruction) {
      this.logAction('info', 'Instruction focus', `Viewing step ${instruction.order}: ${instruction.title}.`);
    }
  }

  selectProject(projectId: string): void {
    this.selectedProjectId.set(projectId);
    const project = this.recentProjects.find(item => item.id === projectId);
    if (project) {
      this.logAction('info', 'Project switched', `Focused project ${project.name}.`);
    }
  }

  triggerShare(optionId: string): void {
    const option = this.shareOptions.find(item => item.id === optionId);
    if (!option) return;
    this.logAction('export', 'Share workflow', `Prepared ${option.target} handoff.`);
    if (option.id === 'apk') {
      this.generateExportPayload();
    }
  }

  getBricksForCategory(categoryId: string): Brick[] {
    return this.brickCatalog[categoryId] ?? [];
  }

  private pushHistory(): void {
    const snapshot = this.cloneLayers(this.layers());
    this.history.update(history => [...history.slice(-19), snapshot]);
  }

  private cloneLayers(layers: Layer[]): Layer[] {
    return layers.map(layer => ({
      ...layer,
      grid: layer.grid.map(row =>
        row.map(cell =>
          cell
            ? {
                ...cell,
                color: { ...cell.color },
                metadata: { ...cell.metadata },
              }
            : null,
        ),
      ),
    }));
  }

  private createEmptyGrid(): (PlacedBrick | null)[][] {
    return Array.from({ length: this.boardSize }, () =>
      Array.from({ length: this.boardSize }, () => null),
    );
  }

  private updateStats(lastAction: string | null): void {
    const layers = this.layers();
    const totalCells = this.boardSize * this.boardSize * layers.length;
    let brickCount = 0;
    const colors = new Set<string>();

    for (const layer of layers) {
      for (const row of layer.grid) {
        for (const cell of row) {
          if (cell) {
            brickCount += 1;
            colors.add(cell.color.name);
          }
        }
      }
    }

    const density = totalCells ? Number((brickCount / totalCells).toFixed(2)) : 0;
    const complexity = brickCount > 250 ? 'Expert' : brickCount > 100 ? 'Intermediate' : 'Starter';

    this.sessionStats.set({
      totalBricks: brickCount,
      uniqueColors: colors.size,
      lastAction,
      density,
      complexity,
      exportReady: brickCount > 0,
    });
  }

  private logAction(type: ActionLogItem['type'], label: string, details: string): void {
    const entry: ActionLogItem = {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      label,
      details,
    };
    this.actionLog.update(history => [entry, ...history].slice(0, 12));
  }
}