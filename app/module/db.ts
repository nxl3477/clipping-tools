import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import path from 'path'
import { localDirPath } from '../config'
console.log('存储路径', path.join(localDirPath, "clippingTool.json"))
const adapter = new FileSync(path.join(localDirPath, "clippingTool.json"));
const db = low(adapter)


db
  .defaults({ 
    clipData: []
  })
  .write()

export {
  db
}