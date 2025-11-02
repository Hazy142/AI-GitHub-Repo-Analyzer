import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { BuilderStoreService } from './services/builder-store.service';
import { PartCategory, PartDefinition } from './builder/lego-types';
import { PARTS_BY_CATEGORY } from './builder/part-catalog';
import { BuilderCanvasComponent } from './components/builder-canvas.component';
import { ColorPickerComponent } from './components/color-picker.component';

interface CategoryMeta {
  id: PartCategory;
  label: string;
  summary: string;
  tag: string;
}

const CATEGORY_META: CategoryMeta[] = [
  { id: 'bricks', label: 'Core Bricks', summary: 'Structural bricks for solid stacking.', tag: 'BR' },
  { id: 'plates', label: 'Plates', summary: 'Low profile layers and foundations.', tag: 'PL' },
  { id: 'tiles', label: 'Tiles', summary: 'Smooth finishing surfaces.', tag: 'TL' },
  { id: 'slopes', label: 'Slopes', summary: 'Angles, contours, and aerodynamics.', tag: 'SL' },
  { id: 'rounds', label: 'Rounds', summary: 'Cylinders, domes, and cones.', tag: 'RD' },
  { id: 'specials', label: 'Specials', summary: 'Clips, hinges, and technical links.', tag: 'SP' },
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BuilderCanvasComponent, ColorPickerComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly categories = CATEGORY_META;
  readonly categoryLookup = CATEGORY_META.reduce((acc, meta) => {
    acc[meta.id] = meta;
    return acc;
  }, {} as Record<PartCategory, CategoryMeta>);

  readonly activeCategory = computed(() => this.store.getSelectedCategory());
  readonly parts = computed(() => this.store.parts);
  readonly activePart = computed(() => this.store.activePart());
  readonly colorHex = computed(() => this.store.getColorHex());
  readonly stats = this.store.stats;

  constructor(public readonly store: BuilderStoreService) {}

  selectCategory(category: PartCategory): void {
    this.store.selectCategory(category);
  }

  selectPart(partId: string): void {
    this.store.selectPart(partId);
  }

  clear(): void {
    this.store.clear();
  }

  undo(): void {
    this.store.undo();
  }

  partCount(category: PartCategory): number {
    return PARTS_BY_CATEGORY[category]?.length ?? 0;
  }

  trackPart(_: number, part: PartDefinition): string {
    return part.id;
  }
}