
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Wallet } from './wallet.entity';
import { Cache } from 'cache-manager';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  async findAll(): Promise<Wallet[]> {
    return await this.walletRepository.find();
  }

  async findById(id: number): Promise<Wallet> {
    return await this.walletRepository.findOne({ where: { id: id } });
  }

  async create(walletData: Partial<Wallet>): Promise<Wallet> {
    const newWallet = this.walletRepository.create(walletData);
    return await this.walletRepository.save(newWallet);
  }

  async update(id: number, walletData: Partial<Wallet>): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({ where: { id: id } });
    if (!wallet) {
      throw new Error('Wallet not found.');
    }

    wallet.address = walletData.address || wallet.address;
    wallet.seed = walletData.seed || wallet.seed;

    return await this.walletRepository.save(wallet);
  }

  async remove(id: number): Promise<DeleteResult> {
    const wallet = await this.walletRepository.findOne({ where: { id: id } });
    if (!wallet) {
      throw new Error('Wallet not found.');
    }

    return await this.walletRepository.delete(id);
  }
}