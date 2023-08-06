import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Wallet } from '../../src/wallets/wallet.entity';
import { WalletService } from '../../src/wallets/wallet.service';
import { CACHE_MANAGER } from '@nestjs/common';
import { XrplHelperService } from '../../src/xrpl/xrpl-helper.service';
import { XrplListenerService } from '../../src/xrpl/xrpl-listener.service';
import { XrplPaymentService } from '../../src/xrpl/xrpl-payment.service';
import { Transaction } from '../../src/transactions/transaction.entity';

describe('WalletService', () => {
    let service: WalletService;
    let walletRepository: Repository<Wallet>;
    let xrplHelperService: XrplHelperService;
    let xrplPaymentService: XrplPaymentService;
    let xrplListenerService: XrplListenerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WalletService,
                XrplHelperService,
                XrplPaymentService,
                XrplListenerService,
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
                    useValue: {}
                }
            ],
        }).compile();

        service = module.get<WalletService>(WalletService);
        walletRepository = module.get<Repository<Wallet>>(getRepositoryToken(Wallet));
        xrplHelperService = module.get<XrplHelperService>(XrplHelperService);
        xrplPaymentService = module.get<XrplPaymentService>(XrplPaymentService);
        xrplListenerService = module.get<XrplListenerService>(XrplListenerService);
    });

    describe('findAll', () => {
        it('should return an array of wallets', async () => {
            const wallets: Wallet[] = [
                { id: 1, address: 'address1', seed: 'seed1', transactions: null },
                { id: 2, address: 'address2', seed: 'seed2', transactions: null },
            ];

            jest.spyOn(walletRepository, 'find').mockResolvedValue(wallets);

            const result = await service.findAll();

            expect(result).toEqual(wallets);
        });

        it('should return an empty array if no wallets found', async () => {
            jest.spyOn(walletRepository, 'find').mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findById', () => {
        it('should return the wallet with the given id', async () => {
            const wallet: Wallet = { id: 1, address: 'address1', seed: 'seed1', transactions: null };

            jest.spyOn(walletRepository, 'findOne').mockResolvedValue(wallet);

            const result = await service.findById(1);

            expect(result).toEqual(wallet);
        });

        it('should return null if wallet with the given id is not found', async () => {
            jest.spyOn(walletRepository, 'findOne').mockResolvedValue(null);

            const result = await service.findById(1);

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should create a new wallet', async () => {
            const walletData: Partial<Wallet> = { address: 'address1', seed: 'seed1' };
            const newWallet: Wallet = { id: 1, ...walletData, transactions: null } as Wallet;
            jest.spyOn(walletRepository, 'create').mockReturnValue(newWallet);
            jest.spyOn(walletRepository, 'save').mockResolvedValue(newWallet);

            const result = await service.create(walletData);

            expect(result).toEqual(newWallet);
        });
    });

    describe('update', () => {
        it('should update an existing wallet', async () => {
            const walletData: Partial<Wallet> = { address: 'updated_address' };
            const existingWallet: Wallet = { id: 1, address: 'old_address', seed: 'seed1', transactions: null };
            const updatedWallet: Wallet = { ...existingWallet, ...walletData };
            jest.spyOn(walletRepository, 'findOne').mockResolvedValue(existingWallet);
            jest.spyOn(walletRepository, 'save').mockResolvedValue(updatedWallet);

            const result = await service.update(1, walletData);

            expect(result).toEqual(updatedWallet);
        });

        it('should throw an error if wallet not found', async () => {
            const walletData: Partial<Wallet> = { address: 'updated_address' };
            jest.spyOn(walletRepository, 'findOne').mockResolvedValue(undefined);

            await expect(service.update(1, walletData)).rejects.toThrowError(Error);
        });
    });

    describe('remove', () => {
        it('should remove an existing wallet', async () => {
            const existingWallet: Wallet = { id: 1, address: 'address1', seed: 'seed1', transactions: null };
            jest.spyOn(walletRepository, 'findOne').mockResolvedValue(existingWallet);
            jest.spyOn(walletRepository, 'delete').mockResolvedValue({ affected: 1 } as DeleteResult);

            const result = await service.remove(1);

            expect(result).toEqual({ affected: 1 });
        });

        it('should throw an error if wallet not found', async () => {
            jest.spyOn(walletRepository, 'delete').mockResolvedValue({ affected: 0 } as DeleteResult);

            await expect(service.remove(1)).rejects.toThrowError(Error);
        });
    });
});