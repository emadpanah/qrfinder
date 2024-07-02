import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class ProductBaseDto {
  @IsString()
  Id: string;

  @IsNumber()
  MaxCountInCart: number;

  @IsNumber()
  Sort: number;

  @IsNumber()
  ReleaseDaysCount: number;

  @IsNumber()
  HourOfRelease: number;

  @IsNumber()
  MinuteOfRelease: number;

  @IsBoolean()
  JustInCart: boolean;

  @IsString()
  Title: string;

  @IsOptional()
  @IsString()
  RoleTitle: string | null;

  @IsOptional()
  @IsString()
  EnTitle: string | null;

  @IsString()
  Slogan: string;

  @IsString()
  InternationalCodeValue: string;

  @IsString()
  Description: string;

  @IsOptional()
  @IsString()
  EnDescription: string | null;

  @IsString()
  AdditionalDescription: string;

  @IsString()
  AdditionalValue: string;

  @IsOptional()
  @IsString()
  TitleParameter: string | null;

  @IsString()
  ImagesIds: string;

  @IsNumber()
  Quantity: number;

  @IsBoolean()
  IsLastQuantity: boolean;

  @IsString()
  UserName: string;
}
