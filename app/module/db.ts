import Datastore from 'nedb'
import path from 'path'
import { localDirPath } from '../config'

const db = new Datastore({ 
  filename: path.join(localDirPath, "clipData.db"),
  autoload: true
});

console.log('存储路径', path.join(localDirPath, "clipData.db"))

// https://www.w3cschool.cn/nedbintro/nedbintro-t9z327mh.html
export {
  db
}