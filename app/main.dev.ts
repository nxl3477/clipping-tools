/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, Tray, BrowserWindow, ipcMain, clipboard, globalShortcut } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';

import routes from './constants/routes.json';
// import { watchHandle } from './module/children'
// import MainProgress from './ipcMain/index'
// import clipboardWatch from './module/clipboardWatch'
// import child_process from 'child_process'

// picGo 
// https://github.com/Molunerfinn/PicGo/blob/0fe3ade5c3b6fa54b5944329904dd4e0605956bc/src/main/apis/app/system/index.ts


export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let childrenWin: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {

  // 开了debug就没法背景透明
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true' || true
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: true,
    width: 1024,
    height: 728,
    frame: true,
    // 窗体透明
    // transparent: true,
    webPreferences:
      process.env.NODE_ENV === 'development' || process.env.E2E_BUILD === 'true' || true
        ? {
            nodeIntegration: true
          }
        : {
            preload: path.join(__dirname, 'dist/renderer.prod.js')
          }
  });
  mainWindow.loadURL(`file://${__dirname}/app.html`);
  mainWindow.webContents.closeDevTools();


  // var appIcon = new Tray(path.join(__dirname,'./icon.png'));

  // appIcon.on('click', (event, bounds) => {
  //   console.log('icon click', event, bounds)

    
  // })

  // appIcon.on('double-click',()=>{    

  //   console.log(mainWindow);
  //   // mainWindow.show();
  // })





  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  await createWindow()
  // await createChildWindow(routes.CLIPBOARDWATCH)
  // MainProgress.appReady({ mainWindow })
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});



// 创建子窗口
const createChildWindow = async (router) => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  childrenWin = new BrowserWindow({
    show: false,
    width: 300,
    height: 300,
    frame: true,
    // transparent: true,
    webPreferences:
      process.env.NODE_ENV === 'development' || process.env.E2E_BUILD === 'true' || true
        ? {
            nodeIntegration: true
          }
        : {
            preload: path.join(__dirname, 'dist/renderer.prod.js')
          }
  });

  childrenWin.loadURL(`file://${__dirname}/app.html#${router}`);
  childrenWin.webContents.closeDevTools();


  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  childrenWin.webContents.on('did-finish-load', () => {
    if (!childrenWin) {
      throw new Error('"childrenWin" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      childrenWin.minimize();
    } else {
      childrenWin.show();
      childrenWin.focus();
    }
  });

  childrenWin.on('closed', () => {
    childrenWin = null;
  });
};


ipcMain.on('text-change', (event, data) => {
  mainWindow.webContents.send('text-change', data)
})
ipcMain.on('image-change', (event, data) => {
  mainWindow.webContents.send('image-change', data)
});
ipcMain.on('write-text', (event, data) => {
  childrenWin.webContents.send('write-text', data)
})
ipcMain.on('write-image', (event, data) => {
  childrenWin.webContents.send('write-image', data)
})