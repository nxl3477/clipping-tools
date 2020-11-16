import React, { Component } from 'react'
import styles from './Screenshot.scss'

type direction = 'leftTop' | 'leftMiddle' | 'leftBottom' | 'middleTop' | 'middleBottom' | 'rightTop' | 'rightMiddler' | 'rightBottom' | ''

let isCanMove = false
let moveDirection: direction = ''
export default class Screenshot extends Component {
  public moveBox: any;
  public layerBox: any;
  public state = {
    source: '',
    originRect: {
      width: 0,
      height: 0,
      left: 0,
      top: 0
    },
    curRect: {
      width: 0,
      height: 0,
      left: 0,
      top: 0
    },
    containerStyle: ''
  };

  constructor(props:any) {
    super(props)
    this.state = {
      source: '',
      containerStyle: '',
      originRect: {
        width: 0,
        height: 0,
        left: 0,
        top: 0
      },
      curRect: {
        width: 100,
        height: 200,
        left: 200,
        top: 200
      },
    }

    window.customEventBus.on('deskTopRender', (source: any) => {
      console.log('哈哈哈', source)
      this.setState({
        source: source.thumbnail
      })
    })
  }
  componentDidMount() {
    // console.log('自定义事件', window.customEvent)

    // window.setTimeout(() => {
    //   const source = window.source.thumbnail
    //   this.setState(() => ({
    //     source: source
    //   }),() => {
    //     console.log(this.state.source, source)
    //   })
    // }, 3000)
    console.log('123132')
    document.addEventListener('mousemove', (e: MouseEvent) => {
      // if(  )
      console.log('e', e)
      if( isCanMove ) {
        // 左中节点缩放情况
        if( moveDirection === 'leftMiddle' ) {
          this.resizeXFromLeft(e)
        }
        // 左中
        if( moveDirection === 'middleTop' ) {
          this.resizeYFromTop(e)
        }
        // 左上
        if( moveDirection === 'leftTop' ) {
          this.resizeXFromLeft(e)
          this.resizeYFromTop(e)
        }

      }
    })

  }


  // 左拉缩放逻辑
  resizeXFromLeft(e: MouseEvent) {
    const diffX = e.clientX - this.state.originRect.left
    const originRect = { ...this.state.originRect }
    const curRect = { ...this.state.curRect }
    curRect.width = originRect.width - diffX
    curRect.left = Math.max( Math.min(originRect.left + diffX, originRect.left + originRect.width) , 0)
    this.setState(() => ({
      curRect
    }))
  }

  // 右拉缩放逻辑
  resizeXFromRight (e: MouseEvent) {
    const originRect = { ...this.state.originRect }
    const right = originRect.left + originRect.width
    const diffX = e.clientX - right
    
    const curRect = { ...this.state.curRect }
    curRect.width = originRect.width - diffX
    curRect.left = Math.max( Math.min(originRect.left + diffX, originRect.left + originRect.width) , 0)
    this.setState(() => ({
      curRect
    }))
  }

  // 上下缩放逻辑
  resizeYFromTop(e: MouseEvent) {
    const diffY = e.clientY - this.state.originRect.top
    const originRect = { ...this.state.originRect }
    const curRect = { ...this.state.curRect }
    curRect.height = originRect.height - diffY
    curRect.top = Math.max( Math.min(originRect.top + diffY, originRect.top + originRect.height) , 0)
    this.setState(() => ({
      curRect
    }))
  }

  onMouseDownHandle (e: React.MouseEvent, direction: direction) {
    console.log('鼠标点击下去', e)
    
    isCanMove = true
    moveDirection = direction
    const { width, height, top, left } = this.moveBox.getBoundingClientRect()
    const originRect = Object.assign({}, this.state, { width, height, top, left })
    this.setState(() => ({
      originRect
    }))
  } 
  onMouseUpHandle (e: React.MouseEvent ) {
    isCanMove = false
    console.log('鼠标弹起', e)
  }


  getMoveStyle () {
    const { width, height, left, top } = this.state.curRect
    return {
      width: width + 'px',
      height: height + 'px',
      left: left + 'px',
      top: top + 'px'
    }
  }


  render() {
    const source = this.state.source
    console.log('render', this)
    const moveBoxStyle = this.getMoveStyle()
    return (
      <div className={styles.container}>
        <img className={ styles.deskTopImg } src={source} alt=""/>
        <div className={styles.layer} ref={ (ele) => this.layerBox = ele } onMouseUp={(e) => this.onMouseUpHandle(e)}>
          <div className={ styles.moveInnerBox } style={moveBoxStyle} ref={(ele) => this.moveBox = ele}>
            {/* 左上角 */}
            <div className={ [styles.point, styles.leftTopPoint ].join(' ') }     onMouseDown={(e) => this.onMouseDownHandle(e, 'leftTop')}     ></div>
            {/* 左中 */}
            <div className={ [styles.point, styles.leftMiddlePoint ].join(' ') }     onMouseDown={(e) => this.onMouseDownHandle(e, 'leftMiddle')}     ></div>
            {/* 左下 */}
            <div className={ [styles.point, styles.leftBottomPoint ].join(' ') }  onMouseDown={(e) => this.onMouseDownHandle(e, 'leftBottom')}  ></div>
            {/* 中上 */}
            <div className={ [styles.point, styles.middleTopPoint ].join(' ') }  onMouseDown={(e) => this.onMouseDownHandle(e, 'middleTop')}  ></div>
            {/* 中下 */}
            <div className={ [styles.point, styles.middleBottomPoint ].join(' ') }  onMouseDown={(e) => this.onMouseDownHandle(e, 'middleBottom')}  ></div>
            {/* 右上 */}
            <div className={ [styles.point, styles.rightTopPoint ].join(' ') }    onMouseDown={(e) => this.onMouseDownHandle(e, 'rightTop')}    ></div>
            {/* 右中 */}
            <div className={ [styles.point, styles.rightMiddlerPoint ].join(' ') }  onMouseDown={(e) => this.onMouseDownHandle(e, 'rightMiddler')}  ></div>
            {/* 右下 */}
            <div className={ [styles.point, styles.rightBottomPoint ].join(' ') } onMouseDown={(e) => this.onMouseDownHandle(e, 'rightBottom')} ></div>
          </div>
        </div>
      </div>
    )
  }
}
