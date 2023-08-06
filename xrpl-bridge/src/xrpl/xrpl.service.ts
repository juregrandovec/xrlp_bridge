import { Injectable } from '@nestjs/common';
import { Client as XrplClient } from 'xrpl';
import 'dotenv/config';

@Injectable()
export class XrplService {

  protected xrplClient: XrplClient;

  constructor(
  ) {
    this.connectXrplClient();
  }

  private connectXrplClient(): void {
    this.xrplClient = new XrplClient(process.env.XRPL_WSS_URL);
    this.xrplClient.connect();
  }

  onModuleDestroy() {
    this.xrplClient.disconnect();
  }
}