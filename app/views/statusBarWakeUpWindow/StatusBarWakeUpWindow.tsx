import React, { Component } from 'react';
import { message } from 'antd';
import { ipcRenderer } from 'electron'
import styles from './statusBarWakeUpWindow.scss'
import PasteDataBlock from '../../components/PasteDataBlock/PasteDataBlock'

export default class StatusBarWakeUpWindow extends Component {
  public dataList: any[] = [];

  state = {
    dataList: []
  }

  constructor(props: any) {
    super(props)
    this.writeClipBordText = this.writeClipBordText.bind(this)
    this.writeClipBordImg = this.writeClipBordImg.bind(this)
    this.lockDataBlock = this.lockDataBlock.bind(this)
    this.showHomeWindow = this.showHomeWindow.bind(this)
  }

  componentDidMount() {
    this.initDataList()
  }

  addPasteData(data) {
    const dataList = [...this.state.dataList]
    dataList.unshift(data)
    this.setState(() => ({
      dataList
    }))
  }

  writeClipBordText(item) {
    ipcRenderer.send('write-text', item)
    message.success('复制成功')
  }

  writeClipBordImg(item) {
    ipcRenderer.send('write-image', item)
    message.success('复制成功')
  }

  lockDataBlock(item) {
    const allLock = this.state.dataList.filter(item => item.lock)
    if (allLock.length >= 10) {
      message.success('锁定数量已达上线')
      return
    }
    if (item.lock && item.shortcut !== null) {
      return message.error('该记录已绑定快捷键无法解锁，请先解除快捷键')
    }

    message.success(item.lock ? '解锁成功' : '锁定成功')
    ipcRenderer.send('lock-data', item)
  }

  showHomeWindow() {
    ipcRenderer.send('show-home-window')
  }

  startWatch() {
    ipcRenderer.on('text-change', (event, data) => {
      data.data = data.data.trim()
      if (data.data) {
        this.addPasteData(data)
      }
    })

    ipcRenderer.on('image-change', (event, data) => {
      this.addPasteData(data)
    })

    ipcRenderer.on('update-data', (event, data) => {
      const dataList = [...this.state.dataList]
      dataList.forEach(item => {
        if (item._id === data._id) {
          Object.assign(item, data)
        }
      })
      this.setState(() => ({
        dataList
      }))
    })

    ipcRenderer.on('deleteDatablock', (event, item) => {
      const dataList = this.state.dataList.filter(i => i._id !== item._id)
      this.setState(() => ({
        dataList
      }))
    })
  }


  initDataList() {
    ipcRenderer.on('get-initData', (event, dataList) => {
      this.setState({ dataList })
      this.startWatch()
    })
    ipcRenderer.send('req-initData', 'statusBar')
  }

  render() {
    return (<div className={styles.statusBarWakeUpWindow}>
      {
        this.state.dataList.filter(i => !i.lock).sort((a, b) => b.date - a.date).slice(0, 3).map((item: any, index) => <div className={styles.line} key={index}><PasteDataBlock item={item} size="middle" writeClipBordText={this.writeClipBordText} writeClipBordImg={this.writeClipBordImg} lockDataBlock={this.lockDataBlock} /></div>)
      }
      <div className={styles.more} onClick={this.showHomeWindow} >查看更多</div>
    </div>
    )
  }
}
