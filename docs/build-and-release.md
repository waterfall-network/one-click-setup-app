# Build and Release

## Build system

- Bundling/dev server: `electron-vite`
- Packaging: `electron-builder`
- Auto-updates: `electron-updater`

## Renderer/main entrypoints

Configured in `electron.vite.config.ts`:

- Main entry: `src/main/index.ts`
- Preload entry: `src/preload/index.ts`
- Renderer HTML:
  - `src/renderer/index.html`
  - `src/renderer/update.html`

## Packaging config

`electron-builder.yml` defines:

- App metadata:
  `appId`, `productName`, output directories
- File inclusion/exclusion rules
- Native module handling (`better-sqlite3`, `bcrypto`) and `asarUnpack`
- Extra runtime files:
  - `resources/bin/${os}/${arch}` -> packaged `Resources/bin`
  - `resources/genesis` -> packaged `Resources/genesis`
- Target outputs:
  - macOS: `dmg`, `zip` (notarized/hardened runtime)
  - Windows: NSIS installer
  - Linux: `AppImage`, `snap`, `deb`

## Publishing and updates

- Publish provider: `generic`
- Update URL/channel configured in `electron-builder.yml` (`storage.waterfall.network`, `beta`)
- Main process calls `autoUpdater.checkForUpdatesAndNotify()` on startup and from tray menu.

## Release commands

- `npm run build:win`
- `npm run build:mac`
- `npm run build:linux`

Artifacts are written to `dist/`.

## Signing and notarization notes

- macOS signing identity and entitlements are declared in `electron-builder.yml`.
- macOS build script expects an Apple keychain profile:
  `APPLE_KEYCHAIN_PROFILE=wf-notary`.
