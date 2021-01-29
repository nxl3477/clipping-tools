import EventBus from './eventBus'
import { clipboard } from 'electron'
const $bus = new EventBus()

class ClipboardWatch {
  public timer: any
  public speed: number
  public prevText: any
  public prevImg: any
  constructor() {
    this.timer = null
    this.speed = 600
    this.prevText = clipboard.readText()
    const img = clipboard.readImage()
    if( !img.isEmpty() ) {
      this.prevImg = img.toDataURL()
    }
  }

  startWatch() {
    const _this = this
    function timeOutHandle() {
      _this.readClipBoard()
      _this.timer = setTimeout(timeOutHandle, _this.speed)
    }
    timeOutHandle()
  }

  stopWatch() {
    clearTimeout(this.timer)
    this.timer = null
  }

  setSpeed(speed:number) {
    this.stopWatch()
    this.speed = speed
    if( this.timer ) this.startWatch()
  }


  readClipBoard() {
    const clipBoardText = clipboard.readText()
    const clipBoardImage = clipboard.readImage()
    // 文本变化
    if( this.isDiffText(this.prevText, clipBoardText) ) {
      this.prevText = clipBoardText
      $bus.emit('text-change', clipBoardText)
    }


    if( !clipBoardImage.isEmpty() ) {
      const dataUrl = clipBoardImage.toDataURL()
      // 图片变化
      if( this.isDiffImage(this.prevImg, dataUrl) ) {
        console.log('???')
        this.prevImg = dataUrl
        $bus.emit('image-change', dataUrl)
      }
    }
  }

  runOnce() {
    this.readClipBoard()
  }


  isDiffText(prev, cur) {
    return cur && prev !== cur
  }

  isDiffImage(prev, cur) {
    return prev !== cur
  }


  setPreText(text:string='') {
    this.prevText = text
  }

  setPreImage(base64:string = '') {
    this.prevImg = base64
  }

  on(eventName, cb) {
    $bus.on(eventName, cb)
    return this
  }

  emit(eventName, ...args) {
    $bus.emit(eventName, ...args)
  }

  once(eventName, cb) {
    $bus.once(eventName, cb)
  }
}


export default new ClipboardWatch()