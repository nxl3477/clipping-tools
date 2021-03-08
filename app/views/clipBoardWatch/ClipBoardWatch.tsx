import { ipcRenderer, clipboard, remote, app, nativeImage } from 'electron';
import React, { Component } from 'react';
import fs from 'fs'
import { localDirPath } from '../../config'
import * as UUID from 'uuid'
import { ClipData } from '../../object/clipData'

import clipBoardWatch from '../../module/clipboardWatch'



function writeLoaclImg(path, data) {
  if (!fs.existsSync(localDirPath)) {
    fs.mkdirSync(localDirPath);
  }
  const dataBuffer = Buffer.from(data, 'base64')
  return fs.writeFileSync(path, dataBuffer)
}


export default class ClipBoardWatch extends Component {
  componentDidMount() {
    clipBoardWatch.on('text-change', (data) => {

      const clipData = new ClipData('text', data, '')

      const clipTyps = clipboard.availableFormats()
      // TODO: 复制图片文件会携带文件名， 需要将旧的文本剪贴板重新写入
      if (!(clipTyps.length > 1 && clipTyps[1].indexOf('image') > -1)) {
        ipcRenderer.send('add-clipData', clipData)
      }
    }).on('image-change', (data) => {
      const suffix = data.match(/^data:image\/(\w+);base64,/)[1]
      const stream = data.replace(/^data:image\/\w+;base64,/, "")
      const fileName = UUID.v4().slice(0, 7)
      const localPath = `${localDirPath}/${fileName}.${suffix}`

      const clipData = new ClipData('image', data, localPath)

      writeLoaclImg(localPath, stream)
      ipcRenderer.send('add-clipData', clipData)
    }).startWatch()


    ipcRenderer.on('write-text', (event, data, showNotify = false) => {
      clipBoardWatch.setPreText(data.data)
      clipboard.writeText(data.data)

      if (showNotify) {
        new Notification('温馨提示', {
          body: '复制成功'
        });
      }
    })

    ipcRenderer.on('write-image', (event, data, showNotify = false) => {
      clipBoardWatch.setPreImage(data.data)
      clipboard.writeImage(nativeImage.createFromDataURL(data.data))

      if (showNotify) {
        new Notification('温馨提示', {
          body: '复制成功'
          // icon: "static/icon.png"
        });
      }
    })

  }
  render() {
    return <div>
      监听页面
    </div>
  }
}


