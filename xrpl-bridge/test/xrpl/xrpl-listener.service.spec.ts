import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Transaction } from "../../src/transactions/transaction.entity";
import { Repository } from "typeorm";
import { Wallet } from "../../src/wallets/wallet.entity";
import { XrplListenerService } from "../../src/xrpl/xrpl-listener.service";
import { BaseResponse, TransactionStream } from "xrpl";

const mockXrplClient = {
    request: jest.fn(),
    on: jest.fn(),
    removeAllListeners: jest.fn(),
    disconnect: jest.fn(),
};

describe('XrplListenerService', () => {
    let service: XrplListenerService;
    let walletRepository: Repository<Wallet>;
    let transactionRepository: Repository<Transaction>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                XrplListenerService,
                {
                    provide: getRepositoryToken(Transaction),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(Wallet),
                    useClass: Repository,
                },
            ],
        })
            .overrideProvider('xrplClient')
            .useValue(mockXrplClient)
            .compile();

        service = module.get<XrplListenerService>(XrplListenerService);
        walletRepository = module.get<Repository<Wallet>>(getRepositoryToken(Wallet));
        transactionRepository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should subscribe to transactions and set the subscribedWalletAddresses', async () => {
        const mockWallets: Wallet[] = [{ id: 1, address: 'address1', seed: 'seed1' } as Wallet];
        const walletAddresses = mockWallets.map((item) => item.address);

        jest.spyOn(walletRepository, 'find').mockResolvedValue(mockWallets);

        const requestSpy = jest.spyOn(mockXrplClient, 'request');
        requestSpy.mockResolvedValue(walletAddresses);

        let transactionEventListener: (transactionStream: TransactionStream) => void;

        mockXrplClient.on.mockImplementation((event: string, callback: any) => {
            if (event === 'transaction') {
                transactionEventListener = callback;
            }
        });

        await service.refreshSubscription();

        expect(requestSpy).not.toHaveBeenCalled();
    });

    it('should not subscribe if there are no wallets', async () => {
        const mockWallets: Wallet[] = [];

        const requestSpy = jest.spyOn(mockXrplClient, 'request');
        requestSpy.mockResolvedValue([]);

        let transactionEventListener: (transactionStream: TransactionStream) => void;

        mockXrplClient.on.mockImplementation((event: string, callback: any) => {
            if (event === 'transaction') {
                transactionEventListener = callback;
            }
        });

        await service.refreshSubscription();

        expect(requestSpy).not.toHaveBeenCalled();

        expect(service['subscribedWalletAddresses']).toEqual(undefined);
    });

    describe('refreshSubscription', () => {
        it('should unsubscribe and subscribe again', async () => {
            const mockWallets: Wallet[] = [{ id: 1, address: 'address1', seed: 'seed1' } as Wallet];
            const walletAddresses = mockWallets.map((item) => item.address);

            service['subscribedWalletAddresses'] = walletAddresses;

            const removeAllListenersSpy = jest.spyOn(service['xrplClient'], 'removeAllListeners');
            const requestSpy = jest.spyOn(service['xrplClient'], 'request').mockResolvedValue({} as BaseResponse);

            await service.refreshSubscription();

            expect(removeAllListenersSpy).toHaveBeenCalledWith('transaction');
            expect(requestSpy).toHaveBeenCalledWith({
                command: 'unsubscribe',
                accounts: walletAddresses,
            });
        });
    });
});