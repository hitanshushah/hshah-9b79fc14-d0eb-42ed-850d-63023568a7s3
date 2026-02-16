import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { RolePermission } from './role-permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column({ name: 'inherits_from_role_id', nullable: true })
  inheritsFromRoleId: string | null;

  @ManyToOne(() => Role, (role) => role.children, { nullable: true })
  @JoinColumn({ name: 'inherits_from_role_id' })
  inheritsFrom: Role | null;

  @OneToMany(() => Role, (role) => role.inheritsFrom)
  children: Role[];

  @OneToMany(() => User, (user) => user.role)
  users: User[];

  @OneToMany(() => RolePermission, (rp) => rp.role)
  rolePermissions: RolePermission[];
}
