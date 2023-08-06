import { CacheModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletModule } from './wallets/wallet.module';
import { TransactionModule } from './transactions/transaction.module';
import { XrplModule } from './xrpl/xrpl.module';
import { Transaction } from './transactions/transaction.entity';
import { Wallet } from './wallets/wallet.entity';
import { AuthModule } from 'auth/auth.module';
import 'dotenv/config';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: () => ({
        store: 'memory',
        ttl: 60,
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db',
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [Transaction, Wallet],
      synchronize: true,
    }),
    WalletModule,
    TransactionModule,
    XrplModule,
    AuthModule,
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '1h' },
    }),
  ],
})
export class AppModule { }