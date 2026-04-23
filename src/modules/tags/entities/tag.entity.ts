import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { TagStatus } from '../../../common/enums/tag-status.enum';
// Import Task later
// import { Task } from '../../tasks/entities/task.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({
    type: 'enum',
    enum: TagStatus,
    default: TagStatus.PENDING,
  })
  status: TagStatus;

  // @ManyToMany(() => Task, (task) => task.tags)
  // tasks: Task[];
}
