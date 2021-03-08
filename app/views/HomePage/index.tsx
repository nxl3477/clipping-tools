import React, { Component } from 'react';
import { message, Modal } from 'antd';
import { ipcRenderer } from 'electron'
import ShowDataModal from './components/showDataModal/ShowDataModal'
import ShowSettingModal from './components/showSettingModal/ShowSettingModal'
import styles from './homePage.scss'
import { CloseOutlined, MinusOutlined, FullscreenOutlined } from '@ant-design/icons';
import PasteDataBlock from '../../components/PasteDataBlock/PasteDataBlock'

export default class HomePage extends Component {
  public dataList: any[] = [];

  state = {
    dataList: [],
    count: 0,
    shortCutmap: null,
    curUseModalData: null,
    isShowDataModal: false, // 是否查看数据
    isShowSettingModal: false // 是否设置

  }

  constructor(props: any) {
    super(props)
    this.writeClipBordText = this.writeClipBordText.bind(this)
    this.writeClipBordImg = this.writeClipBordImg.bind(this)
    this.lockDataBlock = this.lockDataBlock.bind(this)
    this.closeDataModal = this.closeDataModal.bind(this)
    this.showSettingModal = this.showSettingModal.bind(this)
    this.closeSettingModal = this.closeSettingModal.bind(this)
    this.confirmSettingModal = this.confirmSettingModal.bind(this)
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
    if (allLock.length >= 10 && !item.lock) {
      message.success('锁定数量已达上线')
      return
    }
    if (item.lock && item.shortcut !== null) {
      return message.error('该记录已绑定快捷键无法解锁，请先解除快捷键')
    }
    message.success(item.lock ? '解锁成功' : '锁定成功')
    ipcRenderer.send('lock-data', item)
  }

  startWatch() {
    ipcRenderer.on('text-change', (event, data) => {
      data.data = data.data.trim()
      if (data.data) {
        this.addPasteData(data)
      }
    })

    ipcRenderer.on('image-change', (event, data) => {
      console.log('image-change', data)
      this.addPasteData(data)
    })

    ipcRenderer.on('update-data', (event, data) => {
      const dataList = [...this.state.dataList]
      dataList.forEach(item => {
        if (item._id === data._id) {
          console.log('item._id', item._id)
          Object.assign(item, data)
        }
      })
      this.setState(() => ({
        dataList
      }))
    })
    // 时间不多了，明天继续， 加油， 不要开其他东西
    // 1. 公司的项目
    // 2.完善剪贴板
    // 3. 完善面试题
    // 4. 看看hooks 和 dva

    ipcRenderer.on('deleteDatablock', (event, item) => {
      const dataList = this.state.dataList.filter(i => i._id !== item._id)
      this.setState(() => ({
        dataList
      }), () => {
        message.success('删除成功')
      })
    })

    ipcRenderer.on('showDataModal', (event, data) => {
      this.showDataModal(data)
    })

    ipcRenderer.on('showSettingModal', (event, data, shortCutmap) => {
      this.showSettingModal(data, shortCutmap)
    })
    ipcRenderer.on('see-path', (event, data) => {
      console.log('see-path', data)
    })
  }

  showDataModal(item) {
    this.setState({
      curUseModalData: item,
      isShowDataModal: true
    })
  }

  closeDataModal() {
    this.setState({
      curUseModalData: null,
      isShowDataModal: false
    })
  }


  showSettingModal(item, shortCutmap) {
    this.setState({
      curUseModalData: item,
      shortCutmap: shortCutmap,
      isShowSettingModal: true
    })
  }

  closeSettingModal() {
    this.setState({
      curUseModalData: null,
      shortCutmap: null,
      isShowSettingModal: false
    })
  }

  confirmSettingModal(item, shortcut) {
    this.closeSettingModal()
    console.log('shortcut', shortcut)
    ipcRenderer.send('setBlockShortCut', item, shortcut)
  }



  initDataList() {
    ipcRenderer.on('get-initData', (event, dataList) => {
      this.setState({ dataList })
      this.startWatch()
    })
    ipcRenderer.send('req-initData', 'homePage')
  }

  render() {
    const { curUseModalData, isShowDataModal, isShowSettingModal, shortCutmap } = this.state
    const [lockData, normalData] = this.state.dataList.sort((a, b) => b.date - a.date).reduce((total, curItem) => {
      if (curItem.lock) {
        total[0].push(curItem)
      } else {
        total[1].push(curItem)
      }
      return total
    }, [[], []])
    return (<div className={styles.homePage}>
      {/* 自己模拟标题栏 */}
      {/* <div className={styles.titleBar}>
        <div className={styles.actions}>
          <div className={styles.close}><CloseOutlined /></div>
          <div className={styles.minimize}><MinusOutlined /></div>
          <div className={styles.fullscreen}><FullscreenOutlined /></div>
        </div>
        <div className={styles.titleLine}>剪贴板</div>
      </div> */}
      <div className={styles.container}>
        {
          normalData.map((item: any, index) => <PasteDataBlock item={item} size="middle" writeClipBordText={this.writeClipBordText} writeClipBordImg={this.writeClipBordImg} lockDataBlock={this.lockDataBlock} key={index} />)
        }
      </div>
      <div className={styles.lockDrawer}>
        <div className={styles.innerScroll}>
          {
            lockData.map((item: any, index) => <PasteDataBlock item={item} size="middle" writeClipBordText={this.writeClipBordText} writeClipBordImg={this.writeClipBordImg} lockDataBlock={this.lockDataBlock} key={index} />)
          }
        </div>
        {/* <div className={styles.switch}>{'<'}</div> */}
      </div>
      <ShowDataModal visible={isShowDataModal} item={curUseModalData} closeDataModal={this.closeDataModal} ></ShowDataModal>
      <ShowSettingModal visible={isShowSettingModal} item={curUseModalData} shortCutmap={shortCutmap} confirmSettingModal={this.confirmSettingModal} closeSettingModal={this.closeSettingModal} ></ShowSettingModal>
    </div>
    )
  }
}
