import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagStatusDto } from './dto/update-tag-status.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { TagStatus } from '../../common/enums/tag-status.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('tags')
@Controller('tags')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tag (defaults to PENDING)' })
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get tags with filters' })
  @ApiQuery({ name: 'status', enum: TagStatus, required: false })
  findAll(@Query('status') status?: TagStatus, @CurrentUser() user?: any) {
    if (user.role !== Role.ADMIN) {
      return this.tagsService.findAll(TagStatus.APPROVED);
    }
    return this.tagsService.findAll(status);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Approve or reject a tag (Admin only)' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateTagStatusDto: UpdateTagStatusDto,
  ) {
    return this.tagsService.updateStatus(id, updateTagStatusDto.status);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a tag (Admin only)' })
  remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
  }
}
