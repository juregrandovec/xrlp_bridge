import { Injectable } from '@nestjs/common';
import { Wallet as XrplWallet, xrpToDrops, getBalanceChanges, TransactionMetadata } from 'xrpl';
import { Wallet } from 'wallets/wallet.entity';
import { XrplService } from './xrpl.service';

@Injectable()
export class XrplPaymentService extends XrplService {

  public async createPayment(wallet: Wallet, destinationAddress: string, xrpAmount: number): Promise<boolean> {
    const xrplWallet = XrplWallet.fromSeed(wallet.seed);

    const preparedTransaction = await this.xrplClient.autofill({
      TransactionType: 'Payment',
      Account: xrplWallet.address,
      Destination: destinationAddress,
      Amount: xrpToDrops(xrpAmount),
    });

    const signedTransaction = xrplWallet.sign(preparedTransaction);

    const submittedTransaction = await this.xrplClient.submitAndWait(signedTransaction.tx_blob);

    const transactionMetadata = submittedTransaction.result.meta as TransactionMetadata;

    console.log("Transaction result:", transactionMetadata.TransactionResult);
    console.log("Balance changes:", JSON.stringify(getBalanceChanges(transactionMetadata), null, 2));

    return !!transactionMetadata.TransactionResult;
  }
}