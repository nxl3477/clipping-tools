import { ipcRenderer, clipboard, remote, app, nativeImage } from 'electron';
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



// const writeFile = util.promisify(fs.writeFile)

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

function writeLoaclImg(path, data) {
  if( !fs.existsSync(localDirPath) ) {
    fs.mkdirSync(localDirPath);
  }
  const dataBuffer = Buffer.from(data, 'base64')
  return fs.writeFileSync(path, dataBuffer)
}


export default class ClipBoardWatch extends Component  {
  componentDidMount() {
    clipBoardWatch.on('text-change', (data) => {
      const _data = {
        type: 'text',
        path: '',
        data
      }
      
      const clipTyps = clipboard.availableFormats()
      if( !(clipTyps.length > 1 && clipTyps[1].indexOf('image') > -1) ) {
        console.log('🍌', clipTyps)
        ipcRenderer.send('text-change', _data)
      }
    }).on('image-change', (data) => {
      const suffix = data.match(/^data:image\/(\w+);base64,/)[1]
      const stream = data.replace(/^data:image\/\w+;base64,/, "")
      const fileName = UUID.v4().slice(0, 7)
      const localPath = `${localDirPath}/${fileName}.${suffix}`

      // console.log('🍉', clipboard.availableFormats())

      const _data = {
        type: 'image',
        data,
        path: localPath
      }

      writeLoaclImg(localPath, stream)
      db.get('clipData').push(_data).write()
      ipcRenderer.send('image-change', _data)
    }).startWatch()


    ipcRenderer.on('write-text', (event, data) => {
      clipBoardWatch.setPreText(data.data)
      clipboard.writeText(data.data)
    })

    ipcRenderer.on('write-image', (event, data) => {
      clipBoardWatch.setPreImage(data.data)
      clipboard.writeImage(nativeImage.createFromDataURL(data.data))
    })

  }
  render() {
    return <div>
      监听页面
    </div>
  }
}





// document.addEventListener('paste', function(event:any) {
//   getCopyData(event).then((data: any) => {
    
//     if( data.type === 'text' ) {
//       if( isDiffText(data) ) {
//         ipcRenderer.send('text-change', data)
//       }
//     }

//     if( data.type === 'image' ) {
//       console.log(clipboard.readImage().toDataURL(), clipboard.readImage().toDataURL())
//       if( isDiffImage(data) ) {

//         const $img:any = clipboard.readImage()
//         // getBase64(data.data).then((b64: string) => {
//         const _data = Object.assign({}, data)
//         if( _data.fileName === 'tmp.png' ) {
//           _data.fileName = `${UUID.v4()}.png`
//         }
//         // 获取图片保存路径
//         const localPath = path.join(localDirPath, encodeURI(_data.fileName) )
//         // const extname = path.extname(localPath)

//         _data.path = localPath
//         // 写入本地图片
//         _data.data = encodeURI(`file://${localPath}`)


//         // const stream = b64.replace(/^data:image\/\w+;base64,/, "")

//         writeLoaclImg(localPath, $img.toPNG())
//         console.log('图片保存成功')
//         db.get('clipData')
//           .push(_data)
//           .write()
//         ipcRenderer.send('image-change', _data)
//       }
//     }
//   })
//   .finally(() => {
//     // startPaste()
//   })
// })