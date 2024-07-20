// user.dto.ts
import { IsString, IsNotEmpty, MaxLength, MinLength, Length, IsDateString } from 'class-validator';

export class UserLoginDto {
  @IsString()
  @IsNotEmpty()
  @Length(30, 200) // Exact length of an Ethereum address
  address: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  token: string;

  @IsDateString()
  @IsNotEmpty()
  createdDate: string;
}
