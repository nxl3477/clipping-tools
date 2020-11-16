import os from 'os'
import path from 'path'

import WindowHelper from './module/windowHelper'
import { mainWindow } from '../interface/index'
import { app, ipcMain, globalShortcut, screen, desktopCapturer, BrowserWindowConstructorOptions, BrowserWindow } from 'electron';


const $windows: Array<BrowserWindow> = []

export default class HomePage {
  public mainWindow: mainWindow;
  
  constructor(mainWindow: mainWindow) {
    this.mainWindow = mainWindow;
  }

  init() {
    app.whenReady().then(() => {
      globalShortcut.register('Command+Control+x', () => {
        // 获取所有屏幕 数据
        const displays = screen.getAllDisplays()
        this.mainWindow!.webContents.send('shortcut-capture', displays)
      })
  
      // 渲染进程进行截图以后， 发送数据回主进程，主进程创建窗口绘制刚才的截图
      ipcMain.on('shortcut-capture', (e, sources) => {
        // console.log('截图之后', sources)
        sources.map((source: any) => {
          const windowHelper = new WindowHelper(source)
          // 窗口创建
          const $win = windowHelper.create()
          // 窗口全屏
          windowHelper.fullScreen()
          // 挂载窗口事件
          windowHelper.mountEvent()
          // 窗口加载相应页面，并注入截图数据
          windowHelper.loadHandle();
          // 窗口对象增加到队列
          windowHelper.pushWindow()
          
        })
      })
    })
  }
}
