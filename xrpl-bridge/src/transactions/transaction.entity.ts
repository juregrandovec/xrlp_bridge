import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { Wallet } from '../wallets/wallet.entity';

@Entity()
@Unique('unique_wallet_hash', ['wallet', 'hash'])
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  hash: string;

  @Column()
  sender: string;

  @Column()
  recipient: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions, {
    onDelete: 'CASCADE'
  })
  wallet: Wallet;
}
