import { IsBoolean, IsOptional, ValidateNested, IsArray, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductBaseDto } from './product-base.dto';

export class ProductDto {
  @ValidateNested()
  @Type(() => ProductBaseDto)
  Base: ProductBaseDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => String)
  CurrentValues: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => String)
  CurrentSuperValues: string[] | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => String)
  ValuePriceStorages: string[] | null;

  @IsBoolean()
  IsAvailable: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => String)
  Catalogs: string[] | null;

  @IsOptional()
  @IsString()
  CatalogsString: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => String)
  Tags: string[] | null;

  @IsOptional()
  @IsString()
  TagsString: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => String)
  SpecsAndValue: string[] | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => String)
  SuperSpecsAndSelectedValues: string[] | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => String)
  MVSpecsAndSelectedValues: string[] | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => String)
  MVSpecsAndSelectedValuesStorage: string[] | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => String)
  ProductSCMVCTemp: string[] | null;

  @IsOptional()
  @IsString()
  Language: string | null;

  @IsOptional()
  @IsString()
  LargeImage: string | null;

  @IsOptional()
  @IsString()
  MediumImage: string | null;

  @IsOptional()
  @IsString()
  SmallImage: string | null;
}
