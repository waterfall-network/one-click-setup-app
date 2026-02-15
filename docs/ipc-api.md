# IPC API

This project uses `ipcMain.handle` / `ipcRenderer.invoke` request-response channels.
It also uses scoped one-way event channels for startup UI updates.

## App channels

- `app:quit`:
  Requests graceful application shutdown.
- `app:state`:
  Returns app-level state (currently includes `version`).

## Startup event channel

- `startup:status` (main -> renderer):
  Pushes startup progress status for the update window UI (`phase`, `title`, `detail`, `activeStep`, `completedSteps`, `totalSteps`).

## OS/File channels (`FsHandle`)

- `os:selectDirectory(defaultPath?) -> string | null`
- `os:selectFile(defaultPath?, filters?) -> string | null`
- `os:selectSavePath(title?, fileName?, filters?) -> string | null`
- `os:saveTextFile(text, title?, fileName?) -> boolean`
- `os:openExternal(url) -> void`

## Node channels

- `node:start(id) -> StatusResults | error`
- `node:stop(id) -> StatusResults | error`
- `node:restart(id) -> StatusResults | error`
- `node:getAll() -> Node[]`
- `node:getById(id) -> Node | null`
- `node:add(newNode) -> Node | error`
- `node:delete(ids, withData?) -> boolean[] | error`
- `node:checkPorts(ports) -> boolean[]`

## Worker channels

- `worker:genMnemonic() -> string`
- `worker:add(data) -> { status, message?, data? }`
- `worker:delete(ids) -> boolean[] | error`
- `worker:getAll(params?) -> Worker[]`
- `worker:getById(id) -> Worker | null`
- `worker:getAllByNodeId(id, params?) -> Worker[]`
- `worker:getCount(options?) -> number | null`
- `worker:getStats(options?) -> stats | null`
- `worker:getActionTx(action, id, amount?) -> ActionTx | error`
- `worker:sendActionTx(action, ids, pk) -> boolean[] | error`
- `worker:getDepositDataCount(path) -> number`
- `worker:getDelegateRules(path) -> object`
- `worker:getBalance(nodeId, address) -> { status, data? }`
- `worker:getTransactionCount(nodeId, address) -> { status, data? }`

## Settings channels

- `settings:get() -> Settings | null`
- `settings:update(data) -> Settings | null`
- `settings:exportConfig(filePath) -> { saved, exportedNodes, exportedWorkers }`
- `settings:importConfigFile(filePath) -> { settings, importedNodes, importedWorkers }`
  - Import accepts only validated backup payloads (`version = 1`, valid `exportedAt`,
    valid `settings` shape, and structurally valid `nodes`/`workers` arrays).
  - On success, import restores `nodes` and `workers` records from backup and applies imported settings.
- `settings:resetFactory() -> Settings | null`
  - Clears local `nodes` and `workers` data and restores default settings.
  - Does not perform running-node checks; UI is responsible for optional pre-reset stop confirmations.

## Bridge exposure in renderer

Preload exposes:

- `window.node`
- `window.worker`
- `window.settings`
- `window.os`
- `window.app`
- `window.startup`

Renderer-side wrapper modules are in `src/renderer/src/api/*`.
Update screen listens via `window.startup.onStatus(callback)`.

## Event-driven background coordination

In addition to IPC invokes, main-side modules coordinate through `EventBus`:

- Snapshot pause/resume/start/stop events
- Snapshot finish event used to trigger node start
