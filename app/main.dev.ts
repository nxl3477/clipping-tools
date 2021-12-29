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
import { app, Tray, BrowserWindow, ipcMain, clipboard, globalShortcut, Menu, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import pkg from './package.json'
import log from 'electron-log';
import MenuBuilder from './menu';
import { db } from './module/db'
import fs from 'fs'
import routes from './constants/routes.json';
const isDev = process.env.NODE_ENV === 'development'
// import { watchHandle } from './module/children'
// import MainProgress from './ipcMain/index'
// import clipboardWatch from './module/clipboardWatch'
// import child_process from 'child_process'

const __static = path.join(__dirname, isDev ? '/static' : '/dist/static').replace(/\\/g, '\\\\')





const shortMap = {
  '1': null,
  '2': null,
  '3': null,
  '4': null,
  '5': null,
  '6': null,
  '7': null,
  '8': null,
  '9': null,
  '0': null
}
// picGo 
// https://github.com/Molunerfinn/PicGo/blob/0fe3ade5c3b6fa54b5944329904dd4e0605956bc/src/main/apis/app/system/index.ts

// https://github.com/Molunerfinn/PicGo/blob/0fe3ade5c3b6fa54b5944329904dd4e0605956bc/src/renderer/layouts/Main.vue

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let watchWindow: BrowserWindow | null = null;
let statusBarWakeWindow: BrowserWindow | null = null;
let appIcon: Tray = null
let canClose: Boolean = false

const contextMenu = Menu.buildFromTemplate([
  {
    label: '打开详细窗口',
    click() {
      statusBarWakeWindow.hide()
      mainWindow.show();
      mainWindow.focus();
    }
  },
  {
    label: '关于应用',
    click() {
      dialog.showMessageBox({
        title: '剪贴板',
        message: '剪贴板',
        buttons: ['Ok'],
        detail: `Version: ${pkg.version}\nAuthor: nxl3477\nGithub: https://github.com/nxl3477/clipping-tools`,
      });
    }
  },
  {
    // role: 'quit',
    label: '退出',
    click() {
      canClose = true
      app.quit()
    }
  }
])




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
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    frame: true,
    // icon: "resources/icon.png",
    backgroundColor: '#292733',
    // 窗体透明
    // transparent: true,
    webPreferences:
      process.env.NODE_ENV === 'development' || process.env.E2E_BUILD === 'true'
        ? {
          nodeIntegration: true
        }
        : {
          preload: path.join(__dirname, 'dist/renderer.prod.js')
        }
  });
  mainWindow.loadURL(`file://${__dirname}/app.html`);
  mainWindow.webContents.closeDevTools();
  // mainWindow.webContents.openDevTools()

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

  mainWindow.on('close', (event) => {
    if (!canClose) {
      mainWindow.hide()
      event.preventDefault();
    }
  });

  // mainWindow.setMenu(null)



  // const menuBuilder = new MenuBuilder(mainWindow);
  // menuBuilder.buildMenu();

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
  // 状态栏小窗页面
  statusBarWakeWindow = await createChildWindow(routes.STATUS_BAR_WAKEUP_WINDOW, { show: false, frame: false })
  // 监听剪贴板进程
  watchWindow = await createChildWindow(routes.CLIPBOARDWATCH, { show: isDev, width: 400, height: 400 })
  // MainProgress.appReady({ mainWindow })

  Menu.setApplicationMenu(null)
  // app.dock.hide()

  // 测试用
  // setInterval(() => {

  //   mainWindow.webContents.send('see-path', path.join(__static, 'statusbar-icon.png'))
  // }, 3000);


  // 小图标设置
  appIcon = new Tray(path.join(__static, 'statusbar-icon.png'));
  appIcon.on('click', (event, bounds) => {
    if (statusBarWakeWindow.isVisible()) {
      statusBarWakeWindow.hide()
    } else {
      const { x, y } = bounds
      statusBarWakeWindow.setBounds({ x: x - 50, y, width: 160, height: 380 })
      statusBarWakeWindow.show()
    }
  })



  appIcon.on('right-click', () => {
    appIcon.popUpContextMenu(contextMenu)
  })




  // 监听快捷键
  registerShortCut()

  appIcon.on('double-click', () => {
    console.log(mainWindow);
    mainWindow.show();
  })

});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.

  if (!mainWindow.isVisible()) {
    mainWindow.show()
  }
});



// 创建子窗口
const createChildWindow = async (router, option = {}) => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  let childrenWin = new BrowserWindow({
    show: true,
    width: 500,
    height: 500,
    frame: true,
    // transparent: true,
    webPreferences:
      process.env.NODE_ENV === 'development' || process.env.E2E_BUILD === 'true'
        ? {
          nodeIntegration: true
        }
        : {
          preload: path.join(__dirname, 'dist/renderer.prod.js')
        },
    ...option
  });

  childrenWin.loadURL(`file://${__dirname}/app.html#${router}`);
  childrenWin.webContents.closeDevTools();


  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  childrenWin.webContents.on('did-finish-load', () => {
    if (!childrenWin) {
      throw new Error('"childrenWin" is not defined');
    }
  });

  mainWindow.on('close', (event) => {
    if (!canClose) {
      mainWindow.hide()
      event.preventDefault();
    }
  });

  childrenWin.on('closed', () => {
    // childrenWin = null;
  });

  return childrenWin
};


ipcMain.on('show-home-window', (event, data) => {
  mainWindow.center()
  mainWindow.show()
})


// 完整展示全部数据
ipcMain.on('showDataModal', (event, data) => {
  if (!mainWindow.isVisible()) {
    mainWindow.center()
    mainWindow.show()
  }
  statusBarWakeWindow.hide()
  mainWindow.webContents.send('showDataModal', data)
})

// 设置操作
ipcMain.on('showSettingModal', (event, data) => {
  if (!mainWindow.isVisible()) {
    mainWindow.center()
    mainWindow.show()
  }
  statusBarWakeWindow.hide()
  mainWindow.webContents.send('showSettingModal', data, shortMap)
})

// 删除数据
ipcMain.on('deleteDatablock', (event, item) => {
  db.remove({ _id: item._id }, {}, function (err, numRemoved) {
    if (err) {
      return
    }
    // 删除成功
    if (item.type === 'image' && !item.lock) {
      fs.unlinkSync(item.path)
      console.log('删除成功')
    }
    mainWindow.webContents.send('deleteDatablock', item)
    statusBarWakeWindow.webContents.send('deleteDatablock', item)
  });
})

// 设置快捷键
ipcMain.on('setBlockShortCut', (event, item, shortcut) => {
  if (shortcut === null && item.shortcut !== null) {
    shortMap[item.shortcut] = null
    item.shortcut = null
  } else {
    if (item.shortcut !== null) {
      shortMap[item.shortcut] = null
    }
    item.shortcut = shortcut
    shortMap[shortcut] = item
  }

  db.update({ _id: item._id }, { $set: { shortcut: item.shortcut } }, {}, function (err, numReplaced) {
    if (err) {
      return false
    }
    mainWindow.webContents.send('update-data', item)
    statusBarWakeWindow.webContents.send('update-data', item)
  });
})


ipcMain.on('req-initData', (event, windowName) => {
  db.find({}).sort({ date: -1, lock: -1 }).limit(60).exec(function (err, docs) {
    docs.forEach(i => {
      if (i.shortcut !== null) {
        shortMap[i.shortcut] = i
      }
    })

    if (windowName === 'statusBar') {
      statusBarWakeWindow.webContents.send('get-initData', docs)
    }
    if (windowName === 'homePage') {
      mainWindow.webContents.send('get-initData', docs)
    }
  })
})


ipcMain.on('add-clipData', (event, data) => {
  db.insert(data, (err, insertData) => {
    if (insertData.type === 'text') {
      mainWindow.webContents.send('text-change', insertData)
      statusBarWakeWindow.webContents.send('text-change', insertData)
    }
    if (insertData.type === 'image') {
      mainWindow.webContents.send('image-change', insertData)
      statusBarWakeWindow.webContents.send('image-change', insertData)
    }
  });

  db.find({}).sort({ date: -1, lock: -1 }).skip(60).exec(function (err, docs) {
    docs.forEach((d) => {
      db.remove({ _id: d._id }, {}, function (err, numRemoved) {
        // 删除成功
        if (d.type === 'image' && !d.lock) {
          fs.unlinkSync(d.path)
          console.log('删除成功')
        }
      });
    })
  });
});

ipcMain.on('show-statusBarWakeupWindow', (event, data) => {

})


ipcMain.on('write-text', (event, data) => {
  watchWindow.webContents.send('write-text', data)
})
ipcMain.on('write-image', (event, data) => {
  watchWindow.webContents.send('write-image', data)
})

ipcMain.on('lock-data', (event, item) => {
  item.lock = +!item.lock
  item.date = +new Date()
  db.update({ _id: item._id }, { $set: { lock: item.lock, date: item.date } }, {}, function (err, numReplaced) {
    if (err) {
      return false
    }
    mainWindow.webContents.send('update-data', item)
    statusBarWakeWindow.webContents.send('update-data', item)
  });
})



// 监听快捷键
function registerShortCut() {
  Object.keys(shortMap).forEach(key => {
    globalShortcut.register(`Alt+CommandOrControl+${key}`, () => {
      const data = shortMap[key]
      if (data === null) {
        return
      }

      if (data.type === 'text') {
        watchWindow.webContents.send('write-text', data, true)
      }

      if (data.type === 'image') {
        watchWindow.webContents.send('write-image', data, true)
      }
    })
  })
}

app.on('will-quit', () => {
  // 注销所有快捷键
  globalShortcut.unregisterAll()
})