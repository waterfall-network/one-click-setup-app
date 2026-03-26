# Waterfall One Click Setup App

An Electron application with React and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

If install fails on Intel macOS with native modules (`node-gyp`, `@chainsafe/blst`, `python`), see `docs/getting-started.md#troubleshooting-intel-macos--node-22-native-modules`.

### Binaries

Managed node binaries are downloaded automatically by the app when needed
(during startup for configured local nodes, and before local node start at runtime).

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

## License

This project is licensed under the Apache-2.0 License. See the [LICENSE](./LICENSE.md) file for details.
