import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThan } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { TaskStatus } from '../../common/enums/task-status.enum';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly mailerService: MailerService,
  ) {}

  async sendTaskCreationEmail(email: string, taskTitle: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'New Task Created',
        text: `Your task "${taskTitle}" has been created successfully.`,
      });
    } catch (error) {
      this.logger.error('Error sending task creation email', error);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.log('Checking for tasks due in the next 24 hours');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasksDueSoon = await this.taskRepository.find({
      where: {
        dueDate: LessThanOrEqual(tomorrow),
        status: MoreThan(TaskStatus.PENDING), // Simple way to say not completed? Wait.
      },
      relations: ['user'],
    });
    
    // Better logic for status
    const pendingTasks = tasksDueSoon.filter(t => t.status !== TaskStatus.COMPLETED);

    for (const task of pendingTasks) {
      if (task.user && task.user.email) {
        await this.mailerService.sendMail({
          to: task.user.email,
          subject: 'Task Due Soon',
          text: `Your task "${task.title}" is due on ${task.dueDate}.`,
        });
        this.logger.log(`Notification sent for task: ${task.title}`);
      }
    }
  }
}
