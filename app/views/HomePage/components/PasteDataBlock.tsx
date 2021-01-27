import React, { Component, Fragment } from 'react';
// import { ipcRenderer, desktopCapturer } from 'electron'
import styles from '../homePage.scss'

console.log('styles🍉', styles)
// import { Link } from 'react-router-dom';

// import '../../main/homePage/index'
// const { clipboard, ipcRenderer: ipc } = require("electron");

interface IProps {
  type: 'image' | 'text'
  data: string,
  path: string,
  writeClipBordText: (text:string) => void,
  writeClipBordImg: (path:string) => void,
}



const textBlock = (data, writeClipBordText) => {
  const _data = data.replace(/\n/g, '')
  return <div className={styles.textBlock} title={data} onClick={() => writeClipBordText(data)}>
    <div className={styles.textBlock_inner}>
      <span>{_data}</span>  
    </div>
  </div>
}

const imgBlock = (data, path, writeClipBordImg) => {
  return <div className={styles.imgBlock} style={{ backgroundImage: `url(${data})` }} onClick={() => writeClipBordImg(path)}>
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

    const { type, data, path, writeClipBordText, writeClipBordImg } = this.props
    return <>
      {
        type === 'text' ? textBlock(data, writeClipBordText) : imgBlock(data, path, writeClipBordImg)
      }
    </>
  }
}
