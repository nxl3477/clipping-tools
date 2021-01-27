import { ipcRenderer, clipboard, remote, app } from 'electron';
import path from 'path'
import React, { Component } from 'react';
import { getBase64 } from '../../module/fileToBase64'
import { db } from '../../module/db'
import util from 'util';
import fs from 'fs'
import { localDirPath } from '../../config'
import * as UUID from 'uuid'
import { b64ToFile } from '../../module/base64ToFile'

import clipBoardWatch from '../../module/clipboardWatch'
clipBoardWatch.on('text-change', (data) => {
  console.log('event', data)
}).on('image-change', (data) => {
  console.log('图片变化', data)
}).startWatch()




const writeFile = util.promisify(fs.writeFile)

// import clipboardWatch from '../../module/clipboardWatch'
// import '../../main/homePage/index'

const clipHistory = {
  prevTxt: null,
  prevImage: null
}





// 解析复制的数据
function getCopyData(event) {
  return new Promise((resolve, reject) => {
    if ( event.clipboardData || event.originalEvent ) {
      //某些chrome版本使用的是event.originalEvent
      const clipboardData = (event.clipboardData || event.originalEvent.clipboardData);
      if( clipboardData.items ){
        // for chrome
        const items = clipboardData.items
        const fileMap = new Map()
        Array.from(items).forEach((item: any) => {
          console.log('items', item.type, item.kind)
          if( item.type.indexOf("image") !== -1 ) {
            fileMap.set('image', item)
          }
          if( item.type.indexOf("text") !== -1 ) {
            fileMap.set('text', item)
          }
        })
  
        // 文本
        if( fileMap.get('text') && !fileMap.get('image') ) {
          fileMap.get('text').getAsString(function (str) {
            resolve({
              type: 'text',
              fileName: str,
              data: str,
              path: ''
            })
          })
          // 图片
        } else if( fileMap.get('text') && fileMap.get('image') ) {
          const imgFile = fileMap.get('image').getAsFile()
          fileMap.get('text').getAsString(function (str) {
            resolve({
              type: 'image',
              fileName: str,
              data: imgFile,
              path: ''
            })
          })
          // 截图
        } else if( !fileMap.get('text') && fileMap.get('image') ) {
          const imgFile = fileMap.get('image').getAsFile()
          resolve({
            type: 'image',
            fileName: `tmp.png`,
            data: imgFile,
            path: ''
          })
        }
        
      }
    }
  })
}

// 判断不同文本
function isDiffText (data) {
  if ( clipHistory.prevTxt === null ) {
    clipHistory.prevTxt = data.data
    return false
  }
  const diff = clipHistory.prevTxt !== data.data
  clipHistory.prevTxt = data.data
  return diff
}

// 判断不同图片
function isDiffImage ( data ) {
  if ( clipHistory.prevImage === null ) {
    clipHistory.prevImage = data
    return false
  }

  const diff = clipHistory.prevImage.fileName !== data.fileName || clipHistory.prevImage.data.size !== data.data.size
  clipHistory.prevImage = data
  return diff
}


function writeLoaclImg(path, data) {
  if( !fs.existsSync(localDirPath) ) {
    fs.mkdirSync(localDirPath);
  }
  // const dataBuffer = Buffer.from(data, 'binary')
  // return writeFile(path, dataBuffer)
  return fs.writeFileSync(path, data)
}

function startPaste() {
  window.setTimeout(() => {
    console.log('Paste')
    document.execCommand("Paste");
  }, 500)
}


export default class ClipBoardWatch extends Component  {
  componentDidMount() {

    document.addEventListener('paste', function(event:any) {
      getCopyData(event).then((data: any) => {
        
        if( data.type === 'text' ) {
          if( isDiffText(data) ) {
            ipcRenderer.send('text-change', data)
          }
        }

        if( data.type === 'image' ) {
          console.log(clipboard.readImage().toDataURL(), clipboard.readImage().toDataURL())
          if( isDiffImage(data) ) {

            const $img:any = clipboard.readImage()
            // getBase64(data.data).then((b64: string) => {
            const _data = Object.assign({}, data)
            if( _data.fileName === 'tmp.png' ) {
              _data.fileName = `${UUID.v4()}.png`
            }
            // 获取图片保存路径
            const localPath = path.join(localDirPath, encodeURI(_data.fileName) )
            // const extname = path.extname(localPath)
  
            _data.path = localPath
            // 写入本地图片
            _data.data = encodeURI(`file://${localPath}`)


            // const stream = b64.replace(/^data:image\/\w+;base64,/, "")
  
            writeLoaclImg(localPath, $img.toPNG())
            console.log('图片保存成功')
            db.get('clipData')
              .push(_data)
              .write()
            ipcRenderer.send('image-change', _data)
          }
        }
      })
      .finally(() => {
        // startPaste()
      })
    })
    // startPaste()

  }
  render() {
    return <div>
      监听页面
    </div>
  }
}
