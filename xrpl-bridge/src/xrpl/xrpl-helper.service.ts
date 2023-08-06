import { Injectable } from '@nestjs/common';
import 'dotenv/config';
import { XrplService } from './xrpl.service';

@Injectable()
export class XrplHelperService extends XrplService {

  // Method to check if an address is a valid XRP Ledger address
  public async isValidXrpAddress(address: string): Promise<boolean> {
    try {
      const accountInfo = await this.xrplClient.request({
        command: 'account_info',
        account: address,
      });
      return accountInfo.result?.hasOwnProperty("account_data");
    } catch (error) {
      return false;
    }
  }
}