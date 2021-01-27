import { ipcRenderer, remote, app } from 'electron';
import path from 'path'
const APP = process.type === "renderer" ? remote.app : app;
const STORE_PATH = APP.getPath("userData");
const localDirPath = path.join(STORE_PATH, 'clippingTools')

export {
  localDirPath
}

