// user.dto.ts
import { IsString, IsNotEmpty, MaxLength, MinLength, Length, IsDateString } from 'class-validator';

export class UserDto {
  @IsString()
  @IsNotEmpty()
  @Length(42, 100) 
  ethAddress: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  walletType: string;

  @IsDateString()
  @IsNotEmpty()
  createdDate: string;
}

export class UserInsertDto {
  @IsString()
  @IsNotEmpty()
  @Length(42, 100) 
  ethAddress: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  walletType: string;

  @IsString()
  @IsNotEmpty()
  clientSecret: string;

}



