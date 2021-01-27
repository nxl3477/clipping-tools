

class ClipboardWatch {

  constructor(clipboard) {
    this.timer = null
    this.speed = 1000
    this.prevText = clipboard.readText()
    this.prevImg = clipboard.readImage()
  }

  startWatch() {
    if(this.timer) return this.timer
    const _this = this
    function timeOutHandle() {
      _this.readClipBoard()
    }
    this.timer = setInterval(timeOutHandle, this.speed)
  }

  stopWatch() {
    clearTimeout(this.timer)
    this.timer = null
  }

  setSpeed(speed) {
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
      process.send('text-change', clipBoardText)
    }


    // 图片变化
    if( this.isDiffImage(this.prevImg, clipBoardImage) ) {
      this.prevImg = clipBoardImage
      process.send('img-change', clipBoardImage)
    }

  }

  isDiffText(prev, cur) {
    return cur && prev !== cur
  }

  isDiffImage(prev, cur) {
    return !cur.isEmpty() && prev.toDataURL() !== cur.toDataURL()
  }

}


// const clipboardWatch = new ClipboardWatch()


process.on('message', (...agrs) => {
  console.log('childen', agrs)
})

// clipboardWatch
//   .startWatch()



// process.send('img-change')


// clipboardWatch
//     .on('text-change', (data) => {
//       process.send('text-change', data)
//       // win!.webContents.send('text-changed', data)
//     })
//     .on('img-change', (data) => {
//       process.send('img-change', data)
//       // win!.webContents.send('image-changed', data.toDataURL())
//     })
//     .startWatch()