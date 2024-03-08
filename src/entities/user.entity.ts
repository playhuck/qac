import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('user')
export class UserEntity {

    @PrimaryGeneratedColumn({
        name: 'user_id',
        type: 'int'
    })
    userId!: number;

    @Column({
        name: 'user_email',
        type: 'varchar',
        length: 128
    })
    email!: string;

    @Column({
        name: 'user_password',
        type: 'varchar',
        length: 128
    })
    password!: string;

    @Column({
        name: 'user_name',
        type: 'varchar',
        length: 50
    })
    name!: string;

};