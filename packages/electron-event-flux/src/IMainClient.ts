import IMainClientCallbacks from "./IMainClientCallbacks";
import { Log } from "./utils/loggerApply";

export default interface IMainClient {
  new(callbacks: IMainClientCallbacks, log: Log): IMainClient;

  sendMsg(clientId: string, message: string): void;

  sendMsgByWin(win: any, message: string): void;

  closeWin(clientId: string): void;

  closeWins(clientIds: string[]): void;
}