import React, { Component } from 'react';
import { ipcRenderer, desktopCapturer } from 'electron'
import styles from './homePage.scss'
import { Link } from 'react-router-dom';
import routes from '../../constants/routes.json'
// import '../../main/homePage/index'



ipcRenderer.on('shortcut-capture', ($event, displays) => {
  // 根据主进程给的屏幕数量和属性进行挨个截图
  const getDesktopCapturer = displays.map((display:any, i:number) => {
    return desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: display.size
    }).then( sources => {
      return {
        thumbnail: sources[i].thumbnail.toDataURL(),
        display
      }
    })
  })
  Promise.all(getDesktopCapturer).then((sources: any) => {
    ipcRenderer.send('shortcut-capture', sources)
  })
})



function clipScreen() {
  console.log('123123')
  ipcRenderer.send('capture-screen')
}

export default class HomePage extends Component  {
  public preView: string = '';

  constructor(props:any) {
    super(props)
  }

  componentDidMount() {


    




  }

  render() {
    return <div className={styles.homePage}>
      <div className={styles.clipBtn} onClick={clipScreen}>
        点击截图
      </div>
      <Link to={routes.SCREENSHOT}>
        <button>截屏页面</button>
      </Link>
    </div>
  }
}
