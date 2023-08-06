
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Transaction } from '../transactions/transaction.entity';
import { IsNotEmpty, IsString, IsEmpty } from 'class-validator';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @IsString()
  @Column()
  address: string;

  @IsNotEmpty()
  @IsString()
  @Column()
  seed: string;

  @IsEmpty()
  @OneToMany(() => Transaction, (transaction) => transaction.wallet, { nullable: true })
  transactions: Transaction[];
}