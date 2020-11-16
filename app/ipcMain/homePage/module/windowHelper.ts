import path from 'path'
import { BrowserWindow } from 'electron'

// interface Item {
//   name: String
// } 
// const arr: Array<Item> = []
// const hasUndefined = arr.filter(item => item).some(item => item === undefined)
// if( !hasUndefined ) {
//   const itemObj: Item  = arr.pop()
//   console.log(itemObj.name)
// }



export default class WindowHelper {
  public $win!: BrowserWindow;
  public source: any
  static isClose: Boolean = false
  static $windows: Array<BrowserWindow> = []

  constructor(source: any) {
    this.source = source
  }

  // 根据截图数据 创建窗口
  create() {
    const { display } = this.source
    console.log(display.bounds)
    // display为屏幕相关信息
    // 特别再多屏幕的时候要定位各个窗口到对应的屏幕
    this.$win = new BrowserWindow({
      title: '屏幕截图',
      width: display.size.width,
      height: display.size.height,
      x: display.bounds.x,
      y: display.bounds.y,
      frame: false,
      show: false,
      transparent: true,
      resizable: false,
      alwaysOnTop: true,
      fullscreen: true,
      skipTaskbar: true,
      closable: true,
      maximizable: false,
      webPreferences: process.env.NODE_ENV === 'development' || process.env.E2E_BUILD === 'true'
        ? {
            nodeIntegration: true
          }
        : {
            preload: path.join(__dirname, '../../../dist/renderer.prod.js')
          }
    })

    
    return this.$win             
  }

  mountEvent() {
    const { $win, source } = this
    // 只能通过cancel-shortcut-capture的方式关闭窗口
    $win.on('close', e => {
      if (!WindowHelper.isClose) {
        e.preventDefault()
      }
    })

    // 页面初始化完成之后再显示窗口
    // 并检测是否有版本更新
    $win.once('ready-to-show', () => {
      $win!.show()
      $win!.focus()
      // 重新调整窗口位置和大小
      this.fullScreen()
    })

    // 当页面加载完成时通知截图窗口开始程序的执行
    $win.webContents.on('did-finish-load', () => {
      console.log('dom-ready')
      $win.webContents.executeJavaScript(`window.customEventBus.emit('deskTopRender', ${JSON.stringify(source)})`)
      $win.webContents.send('dom-ready')
      $win.focus()
    })
  }


  // 窗口全屏
  fullScreen() {
    const { $win, source: { display } } = this
    $win.setBounds({
      width: display.size.width,
      height: display.size.height,
      x: display.bounds.x,
      y: display.bounds.y
    })
    $win.setAlwaysOnTop(true)
    $win.setFullScreen(true)
  }


  // 窗口加载的相关处理
  loadHandle() {
    const { $win } = this
    // 加载地址
    $win.loadURL(`file://${path.join(__dirname, '../../../')}app.html#/screenshot`)
  }

  // 关闭窗口
  close () {
    const { $windows } = WindowHelper
    WindowHelper.isClose = true
    while ($windows.length) {
      const $winItem: BrowserWindow = $windows.pop()!
      $winItem.close()
    }
    WindowHelper.isClose = false
  }

  // 窗口对象增加到队列里
  pushWindow() {
    if( this.$win ) {
      WindowHelper.$windows.push(this.$win)
    }
  }
}