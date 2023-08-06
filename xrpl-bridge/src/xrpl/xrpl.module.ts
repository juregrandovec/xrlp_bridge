import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../transactions/transaction.entity';
import { XrplListenerService } from './xrpl-listener.service';
import { Wallet } from 'wallets/wallet.entity';
import { XrplHelperService } from './xrpl-helper.service';
import { XrplPaymentService } from './xrpl-payment.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Wallet])],
  providers: [XrplListenerService, XrplHelperService, XrplPaymentService],
  exports: [XrplListenerService, XrplHelperService, XrplPaymentService],
})
export class XrplModule { }