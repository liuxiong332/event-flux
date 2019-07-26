export interface IWinParams {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  title?: string;
  useContentSize?: boolean;
}

export interface IWinProps {
  path: string;   // The path of the window
  name?: string; // The name of this window
  groups?: string[];  // The groups that the window belongs to
}

export default interface IMultiWinStore {
  // Create new win if the name is not exists, else will change the window url only
  createWin(url: IWinProps | string, parentId: string, params: IWinParams, winProps: any): string;

  createOrOpenWin(winName: string, url: string | IWinProps, parentClientId: string, params: IWinParams): string;

  closeWin(clientId: string): void;

  closeWinByName(name: string): void;

  closeWinByGroup(group: string): void;

  activeWin(clientId: string): void;

  activeWinByName(name: string): void;

  activeWinByGroup(group: string): void;

  sendWinMsg(clientId: string, message: any): void;

  sendWinMsgByName(name: string, message: any): void;

  sendWinMsgByGroup(group: string, message: any): void;

  sendMsg(message: any): void;
}