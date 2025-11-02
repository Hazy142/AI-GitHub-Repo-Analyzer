import { Injectable, computed, effect, signal } from '@angular/core';
import { Vector3 } from 'three';
import { PARTS_BY_CATEGORY, PART_CATALOG, PART_IDS } from '../builder/part-catalog';
import { PartCategory, PartDefinition, PlacedBrick } from '../builder/lego-types';
import { calculateBrickPosition } from '../builder/stacking';

interface HslColor {
  hue: number;
  saturation: number;
  lightness: number;
}

export interface BuilderStats {
  totalBricks: number;
  uniqueColors: number;
  lastAction: string | null;
}

export interface ColorPreset {
  name: string;
  hex: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeHue(value: number): number {
  let result = value % 360;
  if (result < 0) {
    result += 360;
  }
  return result;
}

function hslToHex({ hue, saturation, lightness }: HslColor): string {
  const s = clamp(saturation, 0, 100) / 100;
  const l = clamp(lightness, 0, 100) / 100;
  const h = normalizeHue(hue) / 360;

  if (s === 0) {
    const v = Math.round(l * 255).toString(16).padStart(2, '0');
    return `#${v}${v}${v}`;
  }

  const hueToRgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = Math.round(hueToRgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hueToRgb(p, q, h) * 255);
  const b = Math.round(hueToRgb(p, q, h - 1 / 3) * 255);

  return `#${r.toString(16).padStart(2, '0')}${g
    .toString(16)
    .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function hexToHsl(hex: string): HslColor {
  let normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    normalized = normalized
      .split('')
      .map(char => char + char)
      .join('');
  }

  const bigint = parseInt(normalized, 16);
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue = 0;
  let saturation = 0;
  const lightness = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    saturation = lightness > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        hue = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        hue = (b - r) / d + 2;
        break;
      default:
        hue = (r - g) / d + 4;
        break;
    }
    hue /= 6;
  }

  return {
    hue: Math.round(hue * 360),
    saturation: Math.round(saturation * 100),
    lightness: Math.round(lightness * 100),
  };
}

@Injectable({ providedIn: 'root' })
export class BuilderStoreService {
  readonly categories: PartCategory[] = ['bricks', 'plates', 'tiles', 'slopes', 'rounds', 'specials'];

  readonly colorPresets: ColorPreset[] = [
    { name: 'Bright Red', hex: '#d32f2f' },
    { name: 'Bright Blue', hex: '#1976d2' },
    { name: 'Sunflower', hex: '#fbbc04' },
    { name: 'Emerald', hex: '#2ecc71' },
    { name: 'Graphite', hex: '#374151' },
    { name: 'Frost', hex: '#e2e8f0' },
    { name: 'Sand Green', hex: '#8ab593' },
    { name: 'Dark Tan', hex: '#b89f7a' },
    { name: 'Trans Light Blue', hex: '#7dd3fc' },
    { name: 'Chrome Gold', hex: '#f59e0b' },
  ];

  private readonly selectedCategory = signal<PartCategory>('bricks');
  private readonly selectedPart = signal<string>(PARTS_BY_CATEGORY.bricks[0]?.id ?? PART_IDS[0]);

  private readonly hsl = signal<HslColor>({ hue: 52, saturation: 96, lightness: 62 });
  private readonly selectedColorHex = computed(() => hslToHex(this.hsl()));

  readonly placedBricks = signal<PlacedBrick[]>([]);
  readonly history = signal<PlacedBrick[][]>([]);

  readonly partsForCategory = computed(() => PARTS_BY_CATEGORY[this.selectedCategory()]);
  readonly activePart = computed<PartDefinition | null>(() => PART_CATALOG[this.selectedPart()] ?? null);

  readonly currentColor = computed(() => this.selectedColorHex());

  readonly stats = computed<BuilderStats>(() => {
    const bricks = this.placedBricks();
    const colors = new Set(bricks.map(brick => brick.color));
    return {
      totalBricks: bricks.length,
      uniqueColors: colors.size,
      lastAction: this.lastAction(),
    };
  });

  private readonly lastAction = signal<string | null>(null);

  constructor() {
    effect(() => {
      const parts = this.partsForCategory();
      if (!parts.length) {
        return;
      }
      const active = this.activePart();
      if (!active || active.category !== this.selectedCategory()) {
        this.selectedPart.set(parts[0].id);
      }
    });
  }

  getSelectedCategory(): PartCategory {
    return this.selectedCategory();
  }

  selectCategory(category: PartCategory): void {
    if (!this.categories.includes(category)) {
      return;
    }
    this.selectedCategory.set(category);
    const firstPart = PARTS_BY_CATEGORY[category][0];
    if (firstPart) {
      this.selectedPart.set(firstPart.id);
    }
    this.setLastAction(`Category changed to ${category}`);
  }

  getSelectedPart(): string {
    return this.selectedPart();
  }

  selectPart(partId: string): void {
    if (!PART_CATALOG[partId]) {
      return;
    }
    this.selectedPart.set(partId);
    this.setLastAction(`Selected ${PART_CATALOG[partId].name}`);
  }

  get parts(): PartDefinition[] {
    return this.partsForCategory();
  }

  getColorHex(): string {
    return this.selectedColorHex();
  }

  getHsl(): HslColor {
    return this.hsl();
  }

  updateHue(value: number): void {
    this.hsl.update(color => ({ ...color, hue: normalizeHue(value) }));
  }

  updateSaturation(value: number): void {
    this.hsl.update(color => ({ ...color, saturation: clamp(value, 0, 100) }));
  }

  updateLightness(value: number): void {
    this.hsl.update(color => ({ ...color, lightness: clamp(value, 0, 100) }));
  }

  setColorFromPreset(hex: string): void {
    if (!/^#?[0-9a-f]{3,6}$/i.test(hex)) {
      return;
    }
    const hsl = hexToHsl(hex);
    this.hsl.set(hsl);
    this.setLastAction(`Color set to ${hex.toUpperCase()}`);
  }

  addBrickAtPoint(point: Vector3): void {
    const partId = this.selectedPart();
    const part = PART_CATALOG[partId];
    if (!part) {
      return;
    }

    const placed = this.placedBricks();
    const position = calculateBrickPosition(point, partId, placed);
    const brick: PlacedBrick = {
      id: `brick_${Date.now()}_${placed.length}`,
      partId,
      color: this.selectedColorHex(),
      position,
      rotation: 0,
      widthStuds: part.widthStuds,
      depthStuds: part.depthStuds,
      heightStuds: part.heightStuds,
    };

    this.pushHistory();
    this.placedBricks.set([...placed, brick]);
    this.setLastAction(`Placed ${part.name}`);
  }

  removeBrick(id: string): void {
    const next = this.placedBricks().filter(brick => brick.id !== id);
    this.pushHistory();
    this.placedBricks.set(next);
    this.setLastAction(`Removed brick ${id}`);
  }

  clear(): void {
    if (!this.placedBricks().length) {
      return;
    }
    this.pushHistory();
    this.placedBricks.set([]);
    this.setLastAction('Cleared all bricks');
  }

  undo(): void {
    const history = this.history();
    if (!history.length) {
      return;
    }
    const snapshot = history[history.length - 1];
    this.history.set(history.slice(0, -1));
    this.placedBricks.set(snapshot);
    this.setLastAction('Undo last change');
  }

  private pushHistory(): void {
    const snapshot = this.placedBricks().map(brick => ({ ...brick, position: [...brick.position] as [number, number, number] }));
    this.history.update(history => [...history.slice(-31), snapshot]);
  }

  private setLastAction(message: string): void {
    this.lastAction.set(message);
  }
}
