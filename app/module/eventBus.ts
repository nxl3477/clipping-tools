/*
 * @Descripttion: 全局的事件通知， 兼容了vue的风格， 自己写的，还没仔细测试，有什么问题和需求可以跟我提
 * @version: 0.0.01
 * @Author: Nxl3477
 * @Date: 2020-11-13 16:17:52
 * @LastEditors: Nxl3477
 * @LastEditTime: 2021-01-20 22:38:23
 */
type eventName = string
type callback = (...args: any[]) => void

interface EventBus {
  observer: {
    [eventName: string]: callback[];
  };
  emitCache: {
    [eventName: string]: any;
  }
}

class EventBus {
  constructor () {
    this.observer = {}
    this.emitCache = {}
  }

  // 订阅
  subscribe (eventName: eventName, cb: callback) {
    // 判断该系列事件之前是否存在
    if (!this.observer[eventName]) {
      this.observer[eventName] = []
    }
    // 添加到该事件名称的队列中
    this.observer[eventName].push(cb)
    // 返回注销该事件的方法
    return () => this.unsubscribe(eventName, cb)
  }

  // 订阅一次
  subscribeOnce (eventName: eventName, cb: callback) {
    const _this = this
    function onceCallBacl (...args: any[]) {
      cb.apply(null, args)
      _this.unsubscribe(eventName, onceCallBacl)
    }
    return this.subscribe(eventName, onceCallBacl)
  }

  // 派发订阅
  dispatch (eventName: eventName, ...args: any[]) {
    const eventQueue = this.observer[eventName]
    let res:Promise<any> = Promise.resolve()
    // 缓存发送的事件参数
    this.emitCache[eventName] = args
    // 确保该事件队列存在
    if (!eventQueue || eventQueue.length === 0) {
      return res
    }
    const promiseAll = []
    // 挨个调用订阅的回调
    for (let i = 0; i < eventQueue.length; i++) {
      const itemCallback = eventQueue[i]
      const resolve = itemCallback.apply(null, args)
      promiseAll.push(resolve)
    }
    
    // 只有一个订阅的时候
    if( eventQueue.length === 1 ) {
      res = promiseAll[0] && !promiseAll[0].then ? Promise.resolve(promiseAll[0]) : promiseAll[0]
      // 非promise 需要包裹一下
      return res
    }
    res = Promise.all( promiseAll )
    return res
  }

  // 取消订阅
  unsubscribe (eventName: eventName, cb: callback) {
    return this.observer[eventName] = this.observer[eventName].filter(item => item !== cb)
  }

  // 订阅
  on (eventName: eventName, cb: callback) {
    return this.subscribe(eventName, cb)
  }

  // 订阅一次
  once (eventName: eventName, cb: callback) {
    return this.subscribeOnce(eventName, cb)
  }

  // 派发订阅
  emit (eventName: eventName, ...args: any[]) {
    return this.dispatch(eventName, ...args)
  }

  // 读取之前触发的缓存
  getCache(eventName: eventName) {
    return this.emitCache[eventName]
  }
}

export default EventBus