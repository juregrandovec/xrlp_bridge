import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, UseInterceptors, CacheTTL, CacheInterceptor, CacheKey, Inject, CACHE_MANAGER } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { Wallet } from './wallet.entity';
import { AuthGuard } from '../auth/auth.guard';
import { Cache } from 'cache-manager';
import { RefreshXrplListenerAccountListInterceptor } from './wallet.interceptor';
import { XrplHelperService } from '../xrpl/xrpl-helper.service';
import { XrplPaymentService } from '../xrpl/xrpl-payment.service';
import { WalletPaymentDto } from './DTO/wallet-payment.dto';

@Controller('wallets')
@CacheTTL(600)
@UseInterceptors(CacheInterceptor)
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly xrplHelperService: XrplHelperService,
    private readonly xrplPaymentService: XrplPaymentService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  @Get()
  @UseGuards(AuthGuard)
  async getAllWallets(): Promise<Wallet[]> {
    return this.walletService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getWalletById(@Param('id') id: number): Promise<Wallet> {
    return this.walletService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(RefreshXrplListenerAccountListInterceptor)
  async createWallet(@Body() walletData: Partial<Wallet>): Promise<Wallet> {
    if (await this.xrplHelperService.isValidXrpAddress(walletData.address)) {
      const wallet = this.walletService.create(walletData);
      this.cacheManager.del('/wallets');
      return wallet;
    } else {
      throw new Error('Invalid XRP Ledger address.');
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(RefreshXrplListenerAccountListInterceptor)
  async updateWallet(
    @Param('id') id: number,
    @Body() walletData: Partial<Wallet>,
  ): Promise<Wallet> {
    if (await this.xrplHelperService.isValidXrpAddress(walletData.address)) {
      const wallet = this.walletService.update(id, walletData);
      this.cacheManager.del('/wallets');
      this.cacheManager.del(`/wallets/${id}`);
      return wallet;
    } else {
      throw new Error('Invalid XRP Ledger address.');
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(RefreshXrplListenerAccountListInterceptor)
  async deleteWallet(@Param('id') id: number): Promise<void> {
    await this.walletService.remove(id);
    this.cacheManager.del('/wallets');
    this.cacheManager.del(`/wallets/${id}`);
  }

  @Post(':id/payment')
  @UseGuards(AuthGuard)
  async createPayment(
    @Param('id') walletId: number,
    @Body() paymentData: WalletPaymentDto,
  ): Promise<void> {
    const wallet: Wallet = await this.walletService.findById(walletId);
    const { destinationAddress, xrpAmount } = paymentData;
    await this.xrplPaymentService.createPayment(wallet, destinationAddress, xrpAmount);
  }
}