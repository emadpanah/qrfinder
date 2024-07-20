// user.dto.ts
import { IsString, IsNotEmpty, MaxLength, MinLength, Length, IsDateString } from 'class-validator';

export class UserDto {
  @IsString()
  @IsNotEmpty()
  @Length(30, 200) 
  address: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  walletType: string;

  @IsString()
  @MinLength(3)
  @MaxLength(100)
  telegramID: string;

  @IsDateString()
  @IsNotEmpty()
  createdDate: string;
}

export class UserInsertDto {
  @IsString()
  @IsNotEmpty()
  @Length(30, 200) 
  address: string;

  @IsString()
  @MinLength(3)
  @MaxLength(100)
  telegramID: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  walletType: string;

  @IsString()
  @IsNotEmpty()
  clientSecret: string;

}



