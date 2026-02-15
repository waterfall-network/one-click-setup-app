# Security

This document defines security expectations for the Waterfall desktop app.

## Security boundaries

- Main process is trusted and has full OS access.
- Renderer is untrusted by default and must access privileged actions only through preload IPC.
- Preload bridge is the security gateway (`window.node`, `window.worker`, `window.settings`, `window.os`, `window.app`).

## Sensitive data handled by the app

- Mnemonic phrases (worker creation/import flows)
- Private keys entered for transaction signing
- Wallet passwords and keystore files
- Withdrawal addresses and validator-related credentials

## Mandatory rules

1. Never log secrets.
   - Do not log mnemonic, private key, wallet passwords, raw keystore content.
2. Never persist plaintext secrets unless explicitly required by current feature design.
   - If persistence is required, document where and why.
3. Keep renderer-memory lifetime of secrets minimal.
   - Clear secret-bearing UI state after action completion or cancellation.
4. Do not expose Node.js or Electron primitives directly to renderer.
   - Add new capabilities only via explicit preload wrappers.
5. Validate all IPC input in main-process handlers before use.
6. Treat all file paths selected from renderer as untrusted input.
7. Restrict external URL opening to trusted domains when possible.

## Current implementation notes

- Context bridge is used in preload, but code contains a fallback branch for non-isolated context.
  - Security baseline should remain `contextIsolation` enabled.
- `worker:sendActionTx` receives a raw private key from renderer for signing in main process.
  - Avoid logging this value and avoid storing it in DB or files.
- `window.os.fetchJSON` performs HTTPS requests from preload.
  - Use only trusted endpoints and validate response shape in renderer/main logic.

## Secrets handling guidance

- Mnemonic:
  - Use only for key derivation flows.
  - Do not write to logs.
  - If exported by user action, make user intent explicit.
- Private key:
  - Keep in volatile memory only.
  - Do not cache in persistent stores.
- Password files/keystore:
  - Keep filesystem permissions as restrictive as platform allows.
  - Avoid accidental inclusion in build artifacts or git.

## IPC hardening checklist (for new channels)

1. Channel name is namespaced (`domain:action`).
2. Input is validated (type, range, allowed values).
3. Output avoids leaking internal paths/secrets unless necessary.
4. Side effects are explicit and documented.
5. Errors are sanitized before returning to renderer.

## Dependency and release hygiene

1. Keep `electron`, `electron-builder`, `electron-updater`, `web3`, and native modules updated.
2. Review changes in signing/notarization/update settings before release.
3. Re-check packaging excludes to ensure `.env`, credentials, and local artifacts are not bundled.

## Incident response (minimal)

If secret leakage is suspected:

1. Rotate compromised keys/accounts immediately.
2. Revoke/replace affected credentials.
3. Identify source (logs, files, IPC payload capture, UI state).
4. Patch, document, and add regression checks in PR checklist.
