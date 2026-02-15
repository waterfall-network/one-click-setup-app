import { BrowserWindow, Event, HandlerDetails, shell } from 'electron'

interface CreateMainWindowParams {
  icon: string
  preloadPath: string
  indexHtmlPath: string
  isDev: boolean
  rendererUrl?: string
  onReadyToShow?: () => void
  onCloseRequest?: (event: Event, window: BrowserWindow) => void
}

export const createMainWindow = ({
  icon,
  preloadPath,
  indexHtmlPath,
  isDev,
  rendererUrl,
  onReadyToShow,
  onCloseRequest
}: CreateMainWindowParams): BrowserWindow => {
  const window = new BrowserWindow({
    width: 1200,
    height: 900,
    show: false,
    autoHideMenuBar: true,
    icon,
    center: true,
    title: 'Waterfall',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#1677ff',
      symbolColor: '#fff',
      height: 40
    },
    trafficLightPosition: { x: 10, y: 12 },
    webPreferences: {
      preload: preloadPath,
      sandbox: false
    }
  })

  window.on('ready-to-show', () => {
    onReadyToShow?.()
    window.show()
  })

  window.on('close', (event: Event) => {
    onCloseRequest?.(event, window)
  })

  window.webContents.setWindowOpenHandler((details: HandlerDetails) => {
    shell.openExternal(details.url).then(() => {
      return { action: 'deny' }
    })
    return { action: 'deny' }
  })

  if (isDev && rendererUrl) {
    window.loadURL(`${rendererUrl}/index.html`).then(() => {})
  } else {
    window.loadFile(indexHtmlPath).then(() => {})
  }

  return window
}
