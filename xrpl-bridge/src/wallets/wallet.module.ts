import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './wallet.entity';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { XrplModule } from '../xrpl/xrpl.module'; // Import the XrplModule

@Module({
  imports: [TypeOrmModule.forFeature([Wallet]), XrplModule, CacheModule.register()], // Include the XrplModule in the imports
  providers: [WalletService],
  controllers: [WalletController],
})
export class WalletModule { }