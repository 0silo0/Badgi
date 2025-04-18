import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  primarykey: string;

  @Column()
  name: string;

  @Column()
  createAt: Date;

  @Column()
  editAt: Date;
}