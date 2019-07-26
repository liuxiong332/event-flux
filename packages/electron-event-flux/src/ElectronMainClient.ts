import { Log } from "./utils/loggerApply";
import IMainClientCallbacks from "./IMainClientCallbacks";
import IErrorObj from "./IErrorObj";
import { 
  mainInitName, mainDispatchName, mainReturnName, renderDispatchName, renderRegisterName, messageName, winMessageName
} from './constants';
import { ipcMain, WebContents, BrowserWindow, Event } from 'electron';
const findIndex = require('lodash/findIndex');

interface IClientInfo {
  webContents: WebContents;
  window: BrowserWindow;
  clientId: string;
};

export default class ElectronMainClient {
  clientInfos: IClientInfo[] = [];
  clientMap: { [key: string]: IClientInfo } = {};
  log: Log;
  mainClientCallbacks: IMainClientCallbacks;

  constructor(callbacks: IMainClientCallbacks, log: Log) {
    this.log = log;
    this.mainClientCallbacks = callbacks;

    // Need to keep track of windows, as when a window refreshes it creates a new
    // webContents, and the old one must be unregistered
  
    // Cannot delete data, as events could still be sent after close
    // events when a BrowserWindow is created using remote
    
  
    ipcMain.once(renderRegisterName, this.handleRegister);
  
    ipcMain.on(renderDispatchName, this.handleRendererDispatch);

    ipcMain.on(winMessageName, this.handleWinMessage);
  }
  
  private handleUnregisterRenderer(clientId: string) {
    let existIndex = findIndex(this.clientInfos, (item: IClientInfo) => item.clientId === clientId);
    if (existIndex !== -1) {
      this.clientInfos.splice(existIndex, 1);
      this.clientMap[clientId] = null;
      this.mainClientCallbacks.deleteWin(clientId);
    }
  };

  // Renderer process register self, Then the main process will send the store the initial state to the renderer process
  private handleRegister = ({ sender }: { sender: WebContents }, { clientId }: { clientId: string }) => {
    let existIndex = findIndex(this.clientInfos, (item: IClientInfo) => item.clientId === clientId);
    if (existIndex !== -1) {
      this.handleUnregisterRenderer(clientId);        
    }

    let clientInfo: IClientInfo = {
      webContents: sender,
      clientId,
      window: BrowserWindow.fromWebContents(sender), // sender.getOwnerBrowserWindow(),
    };
    this.clientInfos.push(clientInfo);
    this.clientMap[clientId] = clientInfo;
    
    // Add window first, then get window info, The window info should has prepared
    this.mainClientCallbacks.addWin(clientId);

    let browserWindow = BrowserWindow.fromWebContents(sender);
    
    // Webcontents aren't automatically destroyed on window close
    browserWindow.on('closed', () => this.handleUnregisterRenderer(clientId));

    this._sendForWebContents(
      sender,
      mainInitName, 
      this.mainClientCallbacks.getStores(clientId), 
      this.mainClientCallbacks.getInitStates(clientId) 
    );
  };

  // When renderer process dispatch an action to main process, the handleRendererDispatch will invoke
  // The main process will invoke handleRendererMessage to handle the message and send the result back to renderer process
  private handleRendererDispatch = (event: Event, clientId: string, invokeId: string, stringifiedAction: string) => {
    if (!this.clientMap[clientId]) return;
    let webContents = this.clientMap[clientId].webContents;

    this.mainClientCallbacks.handleRendererMessage(stringifiedAction).then(result => {
      this._sendForWebContents(webContents, mainReturnName, invokeId, undefined, result);
    }, (err) => {
      let errObj: IErrorObj = null;

      if (err) {
        errObj = { name: err.name, message: err.message };
        Object.keys(err).forEach(key => errObj[key] = err[key]);
      }
      
      this._sendForWebContents(webContents, mainReturnName, invokeId, errObj, undefined);
    });
  };

  handleWinMessage = (event: Event, clientId: string, data: any) => {
    if (!this.clientMap[clientId]) return;
    let webContents = this.clientMap[clientId].webContents;
    let existIndex = findIndex(this.clientInfos, (item: IClientInfo) => item.webContents === event.sender);
    if (existIndex !== -1) {
      this._sendForWebContents(webContents, winMessageName, this.clientInfos[existIndex].clientId, data);
    }
  };

  getForwardClients(): IClientInfo[] {
    return this.clientInfos;
  }

  checkWebContents(webContents: WebContents) {
    return !webContents.isDestroyed() && !webContents.isCrashed();
  }

  sendToRenderer(client, payload) {
    let webContents = client.webContents;
    // if (webContents.isDestroyed() || webContents.isCrashed()) {
    //   return this.unregisterRenderer(client.clientId);
    // }
    if (this.checkWebContents(webContents)) {
      webContents.send(mainDispatchName, payload);
    }
  }

  private _sendForWebContents(webContents: WebContents, channel: string, ...args: any[]) {
    if (this.checkWebContents(webContents)) {
      webContents.send(channel, ...args);
    }
  }

  sendMessage(win: BrowserWindow, message: string) {
    if (this.checkWebContents(win.webContents)) {
      win.webContents.send(messageName, message);
    }
  }

  sendMessageByWinName(winName: string, message: string) {

  }
  
  sendMessageByClientId(clientId: string, message: string) {
    let webContents = this.clientMap[clientId].webContents;
    if (this.checkWebContents(webContents)) {
      webContents.send(messageName, message);
    }
  }

  closeAllWindows() {
    this.clientInfos.slice().forEach(client => {
      if (!client.window.isDestroyed()) {
        client.window.close()
      }
    });
  }

  getWindowByClientId(clientId: string) {
    return this.clientMap[clientId].window;
  }

  changeClientAction(clientId: string, params: any) {
    if (this.clientMap[clientId]) {

      let webContents = this.clientMap[clientId].webContents;
      // this.sendMessage(win, { action: 'change-props', url });
      // win.webContents.send("__INIT_WINDOW__", params);
      this._sendForWebContents(webContents, "__INIT_WINDOW__", params);
      this.log((logger) => logger("ElectronMainClient", "init Window", params));

    } else {

      // 还没有初始化，则监听注册事件，当初始化之后 开始初始化
      ipcMain.on(renderRegisterName, (event: Event, { clientId: nowClientId }: { clientId: string }) => {
        if (nowClientId === clientId) {
          this.changeClientAction(clientId, params);
        }
      });

    }
  }
}