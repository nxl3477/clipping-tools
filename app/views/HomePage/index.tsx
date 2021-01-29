import React, { Component } from 'react';
import { message, Button } from 'antd';
import { ipcRenderer, desktopCapturer, clipboard, nativeImage } from 'electron'
import styles from './homePage.scss'
import { Link } from 'react-router-dom';
import { b64ToFile } from '../../module/base64ToFile'
import PasteDataBlock from './components/PasteDataBlock'
import routes from '../../constants/routes.json'
// import '../../main/homePage/index'
// const { clipboard, ipcRenderer: ipc } = require("electron");


const makeLocalPath = (localPath) => `file://${encodeURI(localPath)}`

export default class HomePage extends Component  {
  public dataList: any[] = [];

  state = {
    dataList: [],
    count: 0
  }

  constructor(props:any) {
    super(props)

    this.writeClipBordText = this.writeClipBordText.bind(this)
    this.writeClipBordImg = this.writeClipBordImg.bind(this)
  }

  componentDidMount() {

    ipcRenderer.on('text-change', (event, data) => {
      console.log('data', data)
      data.data = data.data.trim()
      if( data.data ) {
        this.addPasteData(data)
      }
    })

    ipcRenderer.on('image-change', (event, data) => {
      console.log('image-change', data)
      data.srcPath = makeLocalPath(data.path)
      // const _url = URL.createObjectURL(b64ToFile(data, undefined, undefined) )
      this.addPasteData(data)
    })
  }


  addPasteData(data) {
    const dataList = [ ...this.state.dataList ]
    dataList.unshift(data)
    this.setState(() => ({
      dataList
    }))
  } 

  writeClipBordText(item) {
    // clipboard.writeText(text)
    ipcRenderer.send('write-text', item)
    message.success('复制成功')
  }

  writeClipBordImg(item) {
    console.log('path', item)
    try {
      // clipboard.writeImage(nativeImage.createFromPath(path))
      ipcRenderer.send('write-image', item)
      message.success('复制成功')
    }catch(e) {
      console.log('写入错误erroor', e)
    }
  }

  render() {
    return <div className={styles.homePage}>
      {
        this.state.dataList.map((item: any, index) => <PasteDataBlock item={item} writeClipBordText={this.writeClipBordText} writeClipBordImg={this.writeClipBordImg} key={index} /> )
      }
    </div>
  }
}
