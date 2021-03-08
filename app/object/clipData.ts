import { makeFilePath } from '../module/util'

export class ClipData {
  public type: 'text' | 'image'
  public data: any
  public path: string
  public srcPath: string
  public date: number
  public lock: 0 | 1
  public shortcut: string
  constructor(type, data, path) {
    this.type = type
    this.data = data
    this.path = path
    this.srcPath = type === 'image' ? makeFilePath(path) : ''
    this.date = +new Date()
    this.lock = 0
    this.shortcut = null
  }
}