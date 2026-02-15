# IPC API

This project uses `ipcMain.handle` / `ipcRenderer.invoke` request-response channels.

## App channels

- `app:quit`:
  Requests graceful application shutdown.
- `app:state`:
  Returns app-level state (currently includes `version`).

## OS/File channels (`FsHandle`)

- `os:selectDirectory(defaultPath?) -> string | null`
- `os:selectFile(defaultPath?, filters?) -> string | null`
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

## Bridge exposure in renderer

Preload exposes:

- `window.node`
- `window.worker`
- `window.os`
- `window.app`

Renderer-side wrapper modules are in `src/renderer/src/api/*`.

## Event-driven background coordination

In addition to IPC invokes, main-side modules coordinate through `EventBus`:

- Snapshot pause/resume/start/stop events
- Snapshot finish event used to trigger node start
