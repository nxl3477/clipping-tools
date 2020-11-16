import { BrowserWindow } from 'electron';

type mainWindow = BrowserWindow | null

interface params {
  mainWindow: mainWindow
}