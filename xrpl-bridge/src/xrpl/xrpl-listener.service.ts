import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '../transactions/transaction.entity';
import { Repository } from 'typeorm';
import { Payment, TransactionStream, Transaction as XrplTransaction } from 'xrpl';
import 'dotenv/config';
import { Wallet } from '../wallets/wallet.entity';
import { XrplService } from './xrpl.service';

@Injectable()
export class XrplListenerService extends XrplService {

  public subscribedWalletAddresses: string[];

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) {
    super();
    this.xrplClient.on('connected', () => {
      this.subscribeToTransactionStream();
    });
  }

  // Subscribe to Transactions Stream for all existing Wallets
  private async subscribeToTransactionStream(): Promise<void> {
    const wallets = await this.walletRepository.find();
    const walletAddresses = wallets.map((item) => item.address);

    if (walletAddresses.length === 0) {
      return;
    }

    await this.xrplClient.request({
      command: "subscribe",
      accounts: walletAddresses
    });

    console.log("Subscribing to adresses:", walletAddresses);

    this.subscribedWalletAddresses = walletAddresses;

    this.xrplClient.on(
      'transaction',
      (transactionStream: TransactionStream) => {
        console.log("Transaction happened!", transactionStream.transaction);

        const transaction = transactionStream.transaction;
        this.upsertWallet(wallets, transaction, transaction.Account);

        if (transactionStream.transaction.TransactionType === 'Payment') {
          const paymentTransaction = transaction as Payment;
          this.upsertWallet(wallets, paymentTransaction, paymentTransaction.Destination);
        }
      },
    );
  }

  // Refresh subscription to transaction stream
  public async refreshSubscription(): Promise<void> {
    console.log("Refreshing Subscription");

    try {
      this.xrplClient.removeAllListeners('transaction');
      await this.xrplClient.request({
        command: "unsubscribe",
        accounts: this.subscribedWalletAddresses,
      });
    } catch {

    }

    this.subscribeToTransactionStream();
  }

  // Check and Upsert a Wallet where Transaction address is in our wallets
  private upsertWallet(wallets: Wallet[], transaction: XrplTransaction, address: string) {
    const wallet = wallets.find(
      (wallet) => wallet.address === address
    );
    if (wallet) {
      this.upsertTransaction(wallet, transaction);
    }
  }

  // Handle an incoming transaction and save it to the database
  private async upsertTransaction(wallet: Wallet, transactionData: any): Promise<void> {

    try {
      const result = await this.transactionRepository.upsert({
        hash: transactionData.hash,
        sender: transactionData.Account,
        recipient: transactionData.Destination,
        wallet: wallet
      }, {
        skipUpdateIfNoValuesChanged: true,
        conflictPaths: ['wallet', 'hash'],
      },);

      console.log('Transaction saved:', result);
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  }
}