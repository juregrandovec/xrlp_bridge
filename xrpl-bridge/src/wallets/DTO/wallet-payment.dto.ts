import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class WalletPaymentDto {
    @IsNotEmpty()
    @IsString()
    destinationAddress: string;

    @IsNotEmpty()
    @IsNumber()
    xrpAmount: number;
}