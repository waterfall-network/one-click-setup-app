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

### Download binaries

### Mac arm64

- https://storage.waterfall.network/bin/latest/mac/arm64/coordinator-beacon-mainnet
- https://storage.waterfall.network/bin/latest/mac/arm64/coordinator-validator-mainnet
- https://storage.waterfall.network/bin/latest/mac/arm64/verifier-mainnet

Save to `./resources/bin/mac/arm64`

### Mac x64

- https://storage.waterfall.network/bin/latest/mac/x64/coordinator-beacon-mainnet
- https://storage.waterfall.network/bin/latest/mac/x64/coordinator-validator-mainnet
- https://storage.waterfall.network/bin/latest/mac/x64/verifier-mainnet

Save to `./resources/bin/mac/x64`

### Windows x64

- https://storage.waterfall.network/bin/latest/win/x64/coordinator-beacon-mainnet.exe
- https://storage.waterfall.network/bin/latest/win/x64/coordinator-validator-mainnet.exe
- https://storage.waterfall.network/bin/latest/win/x64/verifier-mainnet.exe

### Linux

- https://storage.waterfall.network/bin/latest/linux/x64/coordinator-beacon-mainnet
- https://storage.waterfall.network/bin/latest/linux/x64/coordinator-validator-mainnet
- https://storage.waterfall.network/bin/latest/linux/x64/verifier-mainnet

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

[APACHE LICENSE, VERSION 2.0](https://www.apache.org/licenses/LICENSE-2.0)
