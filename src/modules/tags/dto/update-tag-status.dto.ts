import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { TagStatus } from '../../../common/enums/tag-status.enum';

export class UpdateTagStatusDto {
  @ApiProperty({ enum: TagStatus })
  @IsEnum(TagStatus)
  @IsNotEmpty()
  status: TagStatus;
}
