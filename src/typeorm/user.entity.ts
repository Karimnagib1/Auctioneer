import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
@Entity()
export class User {
  @ApiProperty({
    example: 0,
    description: 'The id of the User',
  })
  @PrimaryGeneratedColumn({
    type: 'bigint',

    name: 'user_id',
  })
  id: number;

  @ApiProperty({
    example: 'string',
    description: 'The name of the User',
  })
  @Column({
    name: 'name',
    nullable: false,
    default: '',
    // This corresponds to varchar(255) in Postgres
    type: 'varchar',
    length: 255,
  })
  name: string;

  @ApiProperty({
    example: 'string',
    description: 'The email of the User',
  })
  @Column({
    name: 'email',
    nullable: false,
    default: '',
    unique: true,
    // This corresponds to varchar(255) in Postgres
    type: 'varchar',
    length: 255,
  })
  email: string;

  @Column({
    nullable: false,
    default: '',
    type: 'varchar',
  })
  password: string;
}
