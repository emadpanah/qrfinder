// user.dto.ts
import { IsString, IsNotEmpty, MaxLength, MinLength, Length, IsDateString, IsUUID } from 'class-validator';

export class UserDto {
  @IsString()
  @IsNotEmpty()
  @Length(42, 42) // Exact length of an Ethereum address
  ethAddress: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  walletType: string;

  @IsDateString()
  @IsNotEmpty()
  createdDate: string;
}

