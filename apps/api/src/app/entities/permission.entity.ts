import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { RolePermission } from './role-permission.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @OneToMany(() => RolePermission, (rp) => rp.permission)
  rolePermissions: RolePermission[];
}
