# LEGO Build Studio Mobile

LEGO Build Studio Mobile is a touch-first workspace inspired by BrickLink Studio but streamlined for Android devices. The Angular application ships with a responsive builder surface, curated brick catalog, guided instruction timeline, export tooling for BrickLink parts lists, and an APK packaging checklist powered by Capacitor.

## Feature Highlights

- Builder workspace with touch-optimized stud canvas, multi-layer management, snap assist modes, and an inspector for brick metadata.
- Curated brick catalog grouped by build intent (core, plates, technic, detail) with quick-pick colour palettes.
- Guided instruction timeline that visually highlights recommended placement cells directly on the canvas grid.
- Android export generator that produces a JSON payload ready to drop into a Capacitor build pipeline.
- Roadmap tracker for mobile-specific optimisations (haptics, WebGL throttling, offline caches, gesture kits).
- Marketplace, project, and learning tabs to showcase how the mobile experience extends beyond the builder.

## Run Locally

**Prerequisites:** Node.js 18+

```bash
npm install
npm run dev
```

The app will be served through Angular's dev server (default: http://localhost:4200).

## Preparing an Android APK

1. **Add Capacitor**
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init lego-build-studio-mobile com.lego.build.studio
   npx cap add android
   ```

2. **Expose the build for Capacitor**
   ```bash
   npm run build
   npx cap copy android
   ```

3. **Open the Android project**
   ```bash
   npx cap open android
   ```
   From Android Studio you can run on device, configure signing, or create a release bundle/apk.

4. **Optional mobile enhancements**
   - Use `@capacitor/haptics` for precise stud-snap feedback.
   - Add `@capacitor/storage` to cache the brick library offline.
   - Integrate gesture helpers (e.g., `@use-gesture/vanilla`, HammerJS) for advanced canvas manipulation.

## Environment Notes

- The application is fully client side; no API keys are required for the current feature set.
- To customise the available bricks or instructions, edit `src/app.component.ts` and adjust the sample catalog arrays.
- Tailwind-style utility classes are authored via global styles; no additional CSS framework setup is necessary.

## Scripts

- `npm run dev` - start the Angular development server with live reload.
- `npm run build` - create a production build suitable for bundling with Capacitor.
- `npm run preview` - serve the production build locally.
