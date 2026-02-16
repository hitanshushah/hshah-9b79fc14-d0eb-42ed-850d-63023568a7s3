import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';
import { Status } from './status.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'status_id' })
  statusId: string;

  @ManyToOne(() => Status, (status) => status.tasks, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'status_id' })
  status: Status;

  @Column({ name: 'order_index', type: 'int', default: 0 })
  orderIndex: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  category: string | null;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
