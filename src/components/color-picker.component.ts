import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BuilderStoreService } from '../services/builder-store.service';

@Component({
  selector: 'app-color-picker',
  standalone: true,
  template: `
    <div class="space-y-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Preset Colors</p>
        <div class="mt-3 grid grid-cols-5 gap-3">
          @for (preset of store.colorPresets; track preset.hex) {
            <button
              type="button"
              class="flex flex-col items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/70 p-3 text-center text-[0.6rem] font-semibold uppercase tracking-wide text-slate-300 transition hover:border-cyan-400/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
              [style.background]="store.getColorHex() === preset.hex ? 'rgba(14,116,144,0.28)' : 'rgba(10,12,24,0.85)'"
              [style.borderColor]="store.getColorHex() === preset.hex ? 'rgba(34,211,238,0.6)' : 'rgba(51,65,85,0.6)'"
              (click)="store.setColorFromPreset(preset.hex)"
            >
              <span class="h-10 w-10 rounded-xl border border-white/20 shadow-inner" [style.background]="preset.hex"></span>
              <span>{{ preset.name }}</span>
            </button>
          }
        </div>
      </div>

      <div class="space-y-3">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Custom HSL</p>

        <div class="space-y-1.5">
          <label class="flex items-center justify-between text-[0.65rem] uppercase tracking-wide text-slate-500">
            <span>Hue</span>
            <span>{{ store.getHsl().hue }}&deg;</span>
          </label>
          <input
            type="range"
            min="0"
            max="360"
            [value]="store.getHsl().hue"
            (input)="store.updateHue(($any($event.target).valueAsNumber))"
            class="slider-hue"
            [style.background]="hueGradient"
          />
        </div>

        <div class="space-y-1.5">
          <label class="flex items-center justify-between text-[0.65rem] uppercase tracking-wide text-slate-500">
            <span>Saturation</span>
            <span>{{ store.getHsl().saturation }}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            [value]="store.getHsl().saturation"
            (input)="store.updateSaturation(($any($event.target).valueAsNumber))"
            class="slider-generic"
            [style.background]="saturationGradient"
          />
        </div>

        <div class="space-y-1.5">
          <label class="flex items-center justify-between text-[0.65rem] uppercase tracking-wide text-slate-500">
            <span>Lightness</span>
            <span>{{ store.getHsl().lightness }}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            [value]="store.getHsl().lightness"
            (input)="store.updateLightness(($any($event.target).valueAsNumber))"
            class="slider-generic"
            [style.background]="lightnessGradient"
          />
        </div>

        <div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 text-xs uppercase tracking-[0.3em] text-slate-400">
          <div class="flex items-center justify-between">
            <span>Preview</span>
            <span>{{ store.getColorHex() }}</span>
          </div>
          <div class="mt-3 h-16 rounded-xl border border-white/10 shadow-inner" [style.background]="store.getColorHex()"></div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      input[type='range'] {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 0.9rem;
        border-radius: 9999px;
        background-color: rgba(15, 23, 42, 0.7);
        outline: none;
      }

      input[type='range']::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 9999px;
        background: #38bdf8;
        border: 2px solid rgba(15, 23, 42, 0.9);
        cursor: pointer;
        box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.4);
      }

      input[type='range']::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 9999px;
        background: #38bdf8;
        border: 2px solid rgba(15, 23, 42, 0.9);
        cursor: pointer;
        box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.4);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorPickerComponent {
  constructor(public readonly store: BuilderStoreService) {}

  get hueGradient(): string {
    return 'linear-gradient(to right, rgb(255,0,0), rgb(255,255,0), rgb(0,255,0), rgb(0,255,255), rgb(0,0,255), rgb(255,0,255), rgb(255,0,0))';
  }

  get saturationGradient(): string {
    const { hue, lightness } = this.store.getHsl();
    return `linear-gradient(to right, hsl(${hue},0%,${lightness}%), hsl(${hue},100%,${lightness}%))`;
  }

  get lightnessGradient(): string {
    const { hue, saturation } = this.store.getHsl();
    return `linear-gradient(to right, hsl(${hue},${saturation}%,0%), hsl(${hue},${saturation}%,50%), hsl(${hue},${saturation}%,100%))`;
  }
}
