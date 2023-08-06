import { Test, TestingModule } from '@nestjs/testing';
import { Wallet } from '../../src/wallets/wallet.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { WalletService } from '../../src/wallets/wallet.service';
import { WalletController } from '../../src/wallets/wallet.controller';
import { CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { RefreshXrplListenerAccountListInterceptor } from '../../src/wallets/wallet.interceptor';
import { XrplHelperService } from '../../src/xrpl/xrpl-helper.service';
import { XrplPaymentService } from '../../src/xrpl/xrpl-payment.service';
import { XrplListenerService } from '../../src/xrpl/xrpl-listener.service';
import { Transaction } from '../../src/transactions/transaction.entity';
import { AuthGuard } from '../../src/auth/auth.guard';

describe('WalletController', () => {
    let controller: WalletController;
    let walletService: WalletService;
    let xrplHelperService: XrplHelperService;
    let xrplPaymentService: XrplPaymentService;
    let cacheManager: Cache;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [WalletController],
            providers: [
                WalletService,
                XrplHelperService,
                XrplPaymentService,
                XrplListenerService,
                RefreshXrplListenerAccountListInterceptor,
                AuthGuard,
                {
                    provide: getRepositoryToken(Wallet),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(Transaction),
                    useClass: Repository,
                },
                {
                    provide: CACHE_MANAGER,
                    useValue: {
                        del: jest.fn().mockResolvedValue(true)
                    },
                },
            ],
        }).compile();

        controller = module.get<WalletController>(WalletController);
        walletService = module.get<WalletService>(WalletService);
        xrplHelperService = module.get<XrplHelperService>(XrplHelperService);
        xrplPaymentService = module.get<XrplPaymentService>(XrplPaymentService);
        cacheManager = module.get<Cache>(CACHE_MANAGER);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getAllWallets', () => {
        it('should return an array of wallets', async () => {
            const wallets: Wallet[] = [
                { id: 1, address: 'address1', seed: 'seed1', transactions: null },
                { id: 2, address: 'address2', seed: 'seed2', transactions: null },
            ];

            jest.spyOn(walletService, 'findAll').mockResolvedValue(wallets);

            const result = await controller.getAllWallets();

            expect(result).toEqual(wallets);
        });
    });

    describe('getWalletById', () => {
        it('should return a wallet by ID', async () => {
            const walletData: Wallet = { id: 1, address: 'address1', seed: 'seed1', transactions: null };
            jest.spyOn(walletService, 'findById').mockResolvedValue(walletData);

            const result = await controller.getWalletById(1);

            expect(result).toEqual(walletData);
        });
    });

    describe('createWallet', () => {
        it('should create a wallet', async () => {
            const walletData: Partial<Wallet> = { address: 'address1', seed: 'seed1' };
            const createdWallet: Wallet = { id: 1, address: 'address1', seed: 'seed1', transactions: null };
            jest.spyOn(xrplHelperService, 'isValidXrpAddress').mockResolvedValue(true);
            jest.spyOn(walletService, 'create').mockResolvedValue(createdWallet);

            const result = await controller.createWallet(walletData);

            expect(result).toEqual(createdWallet);
            expect(cacheManager.del).toHaveBeenCalledTimes(1);
        });

        it('should throw an error for an invalid XRP Ledger address', async () => {
            const walletData: Partial<Wallet> = { address: 'invalid-address', seed: 'seed1' };
            jest.spyOn(xrplHelperService, 'isValidXrpAddress').mockResolvedValue(false);

            await expect(controller.createWallet(walletData)).rejects.toThrowError('Invalid XRP Ledger address.');
            expect(cacheManager.del).toHaveBeenCalledTimes(0);
        });
    });

    describe('updateWallet', () => {
        it('should update a wallet', async () => {
            const id = 1;
            const walletData: Partial<Wallet> = { address: 'new-address', seed: 'seed1' };
            const updatedWallet: Wallet = { id: 1, address: 'new-address', seed: 'seed1', transactions: null };
            jest.spyOn(xrplHelperService, 'isValidXrpAddress').mockResolvedValue(true);
            jest.spyOn(walletService, 'update').mockResolvedValue(updatedWallet);

            const result = await controller.updateWallet(id, walletData);

            expect(result).toEqual(updatedWallet);
            expect(cacheManager.del).toHaveBeenCalledWith('/wallets');
            expect(cacheManager.del).toHaveBeenCalledWith(`/wallets/${id}`);
        });

        it('should throw an error for an invalid XRP Ledger address', async () => {
            const id = 1;
            const walletData: Partial<Wallet> = { address: 'invalid-address', seed: 'seed1' };
            jest.spyOn(xrplHelperService, 'isValidXrpAddress').mockResolvedValue(false);

            await expect(controller.updateWallet(id, walletData)).rejects.toThrowError('Invalid XRP Ledger address.');
            expect(cacheManager.del).toHaveBeenCalledTimes(0);
        });
    });

    describe('deleteWallet', () => {
        it('should delete a wallet', async () => {
            const id = 1;
            const deleteResult: DeleteResult = { raw: {}, affected: 1 } as DeleteResult;
            jest.spyOn(walletService, 'remove').mockResolvedValue(deleteResult);

            await controller.deleteWallet(id);

            expect(walletService.remove).toHaveBeenCalledWith(id);
            expect(cacheManager.del).toHaveBeenCalledWith('/wallets');
            expect(cacheManager.del).toHaveBeenCalledWith(`/wallets/${id}`);
        });
    });

    describe('createPayment', () => {
        it('should create a payment', async () => {
            const walletId = 1;
            const paymentData = { destinationAddress: 'destination-address', xrpAmount: 10 };
            const wallet: Wallet = { id: walletId, address: 'address1', seed: 'seed1', transactions: null };
            jest.spyOn(walletService, 'findById').mockResolvedValue(wallet);
            jest.spyOn(xrplPaymentService, 'createPayment').mockResolvedValue(true);

            await controller.createPayment(walletId, paymentData);

            expect(walletService.findById).toHaveBeenCalledWith(walletId);
            expect(xrplPaymentService.createPayment).toHaveBeenCalledWith(wallet, paymentData.destinationAddress, paymentData.xrpAmount);
        });
    });

});