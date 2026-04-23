import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { TagStatus } from '../../common/enums/tag-status.enum';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class TagsService {
  private readonly TAGS_CACHE_KEY = 'approved_tags';

  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    private readonly redisService: RedisService,
  ) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const existingTag = await this.tagRepository.findOne({
      where: { name: createTagDto.name },
    });

    if (existingTag) {
      throw new ConflictException('Tag name already exists');
    }

    const tag = this.tagRepository.create(createTagDto);
    return this.tagRepository.save(tag);
  }

  async findAll(status?: TagStatus): Promise<Tag[]> {
    // If requesting approved tags, check cache
    if (status === TagStatus.APPROVED) {
      const cachedTags = await this.redisService.get(this.TAGS_CACHE_KEY);
      if (cachedTags) {
        return JSON.parse(cachedTags);
      }
    }

    const tags = await this.tagRepository.find({
      where: status ? { status } : {},
    });

    // Cache approved tags
    if (status === TagStatus.APPROVED) {
      await this.redisService.set(
        this.TAGS_CACHE_KEY,
        JSON.stringify(tags),
        3600,
      ); // 1 hour
    }

    return tags;
  }

  async updateStatus(id: string, status: TagStatus): Promise<Tag> {
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    tag.status = status;
    const updatedTag = await this.tagRepository.save(tag);

    // Invalidate cache
    await this.redisService.del(this.TAGS_CACHE_KEY);

    return updatedTag;
  }

  async remove(id: string): Promise<void> {
    const result = await this.tagRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Tag not found');
    }
    // Invalidate cache
    await this.redisService.del(this.TAGS_CACHE_KEY);
  }
}
