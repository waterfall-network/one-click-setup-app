import { BrowserWindow, IpcMain, Menu, Tray } from 'electron'

interface InitializeTrayAndHandlersParams {
  trayIcon: string
  ipcMain: IpcMain
  appVersion: string
  checkForUpdates: () => void
  quit: () => Promise<void>
  getMainWindow: () => BrowserWindow | null
}

export const initializeTrayAndHandlers = ({
  trayIcon,
  ipcMain,
  appVersion,
  checkForUpdates,
  quit,
  getMainWindow
}: InitializeTrayAndHandlersParams): Tray => {
  const tray = new Tray(trayIcon)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: (): void => {
        const mainWindow = getMainWindow()
        if (mainWindow === null) {
          return
        }
        mainWindow.show()
      }
    },
    {
      label: 'Check Updates',
      click: (): void => {
        checkForUpdates()
      }
    },
    {
      label: 'Quit',
      click: async () => {
        await quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)
  tray.setToolTip('Waterfall')
  ipcMain.handle('app:quit', async () => await quit())
  ipcMain.handle('app:state', async () => ({
    version: appVersion
  }))

  return tray
}
