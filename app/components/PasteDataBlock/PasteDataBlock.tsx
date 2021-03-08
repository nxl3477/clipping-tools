import React, { Component, Fragment } from 'react';
import { CloseOutlined, PushpinOutlined, LockOutlined, UnlockOutlined, ReadOutlined, SettingOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './pasteDataBlock.scss'
import { ipcRenderer } from 'electron'
import { Divider, Popover } from 'antd';
console.log('styles', styles)
type Item = {
  type: 'image' | 'text'
  data: string,
  lock: 0 | 1,
  srcPath: string,
  shortcut: string,
  path: string,
}

interface IProps {
  item: Item,
  size: 'middle' | 'small',
  lockDataBlock: (item: Item) => void,
  writeClipBordText: (item: Item) => void,
  writeClipBordImg: (item: Item) => void
}

const TextBlock = (props) => {
  const { item, size, writeClipBordText } = props
  const _data = item.data.replace(/\n/g, '')
  return <div className={[styles.textBlock, styles[size]].join(' ')} title={item.data} onClick={() => writeClipBordText(item)}>
    <div className={styles.textBlock_inner}>
      <span>{_data}</span>
    </div>
  </div>
}

const ImgBlock = (props) => {
  const { item, size, writeClipBordImg } = props
  return <div className={[styles.imgBlock, styles[size]].join(' ')} style={{ backgroundImage: `url(${item.srcPath})` }} onClick={() => writeClipBordImg(item)}>
  </div>
}

export default class PasteDataHistory extends Component<IProps>  {

  constructor(props: any) {
    super(props)
    this.showDataModal = this.showDataModal.bind(this)
    this.showSettingModal = this.showSettingModal.bind(this)
    this.deleteDataBlock = this.deleteDataBlock.bind(this)
  }

  componentDidMount() {
  }

  showDataModal(item) {
    ipcRenderer.send('showDataModal', item)
  }

  showSettingModal(item) {
    ipcRenderer.send('showSettingModal', item)
  }

  deleteDataBlock(item) {
    ipcRenderer.send('deleteDatablock', item)
  }

  render() {
    const { item, size, writeClipBordText, writeClipBordImg, lockDataBlock } = this.props
    return <div className={styles.dataBlock}>

      <div className={styles.actionLine}>
        <div className={styles.action} onClick={() => lockDataBlock(item)} >{item.lock ? <UnlockOutlined /> : <LockOutlined />}</div>
        <div className={styles.action} onClick={() => this.showDataModal(item)} ><ReadOutlined /></div>
        {item.lock ? <div className={styles.action} onClick={() => this.showSettingModal(item)}><SettingOutlined /></div> : <div className={[styles.action, styles.red].join(' ')} onClick={() => this.deleteDataBlock(item)}><DeleteOutlined /></div>}
      </div>

      {
        item.shortcut && <div className={styles.shortcut}>
          {item.shortcut}
        </div>
      }
      {item.type === 'text' ? <TextBlock item={item} size={size} writeClipBordText={writeClipBordText} /> : <ImgBlock item={item} size={size} writeClipBordImg={writeClipBordImg} />}
    </div>
  }
}
