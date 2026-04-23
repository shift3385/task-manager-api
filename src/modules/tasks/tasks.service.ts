import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from '../users/entities/user.entity';
import { TagsService } from '../tags/tags.service';
import { TagStatus } from '../../common/enums/tag-status.enum';
import { TaskStatus } from '../../common/enums/task-status.enum';
import { Role } from '../../common/enums/role.enum';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly tagsService: TagsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { tagIds, ...taskData } = createTaskDto;
    const task = this.taskRepository.create({
      ...taskData,
      user,
    });

    if (tagIds && tagIds.length > 0) {
      // Validate tags are approved
      const tags = await this.tagsService.findAll(TagStatus.APPROVED);
      const filteredTags = tags.filter((t) => tagIds.includes(t.id));
      task.tags = filteredTags;
    }

    const savedTask = await this.taskRepository.save(task);

    // Send notification
    await this.notificationsService.sendTaskCreationEmail(
      user.email,
      savedTask.title,
    );

    return savedTask;
  }

  async findAll(
    user: any,
    page = 1,
    limit = 10,
    status?: TaskStatus,
  ): Promise<{ data: Task[]; total: number }> {
    const queryBuilder = this.taskRepository.createQueryBuilder('task');
    queryBuilder.leftJoinAndSelect('task.tags', 'tags');

    // If not admin, only see own tasks
    if (user.role !== Role.ADMIN) {
      queryBuilder.where('task.userId = :userId', { userId: user.id });
    }

    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('task.dueDate', 'ASC');

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string, user: any): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['user', 'tags'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Ownership check
    if (user.role !== Role.ADMIN && task.user.id !== user.id) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return task;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    user: any,
  ): Promise<Task> {
    const task = await this.findOne(id, user);
    const { tagIds, ...taskData } = updateTaskDto;

    Object.assign(task, taskData);

    if (tagIds) {
      const tags = await this.tagsService.findAll(TagStatus.APPROVED);
      const filteredTags = tags.filter((t) => tagIds.includes(t.id));
      task.tags = filteredTags;
    }

    return this.taskRepository.save(task);
  }

  async remove(id: string, user: any): Promise<void> {
    const task = await this.findOne(id, user);
    await this.taskRepository.remove(task);
  }
}
