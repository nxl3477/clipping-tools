import React, { Component, Fragment } from 'react';
// import { ipcRenderer, desktopCapturer } from 'electron'
import styles from '../homePage.scss'

console.log('styles🍉', styles)
// import { Link } from 'react-router-dom';

// import '../../main/homePage/index'
// const { clipboard, ipcRenderer: ipc } = require("electron");

type Item = {
  type: 'image' | 'text'
  data: string,
  srcPath: string,
  path: string,
}

interface IProps {
  item: Item
  writeClipBordText: (text:string) => void,
  writeClipBordImg: (path:string) => void,
}



const textBlock = (item, writeClipBordText) => {
  const _data = item.data.replace(/\n/g, '')
  return <div className={styles.textBlock} title={item.data} onClick={() => writeClipBordText(item)}>
    <div className={styles.textBlock_inner}>
      <span>{_data}</span>
    </div>
  </div>
}

const imgBlock = (item, writeClipBordImg) => {
  return <div className={styles.imgBlock} style={{ backgroundImage: `url(${item.srcPath})` }} onClick={() => writeClipBordImg(item)}>
    </div>
}







export default class PasteDataHistory extends Component<IProps>  {

  constructor(props:any) {
    super(props)
  }

  componentDidMount() {
  }


  watchClipBoard() {
    
  }

  addCount() {
  }

  render() {

    const { item, writeClipBordText, writeClipBordImg } = this.props
    return <>
      {
        item.type === 'text' ? textBlock(item, writeClipBordText) : imgBlock(item, writeClipBordImg)
      }
    </>
  }
}
