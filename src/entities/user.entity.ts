import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity('user')
export class UserEntity {

    @PrimaryGeneratedColumn({
        name: 'id',
        type: 'int'
    })
    userId!: number;

    @Index()
    @Column({
        name: 'email',
        type: 'varchar',
        length: 128
    })
    email!: string;

    @Column({
        name: 'password',
        type: 'varchar',
        length: 128
    })
    password!: string;

    @Column({
        name: 'name',
        type: 'varchar',
        length: 50
    })
    name!: string;

    @Column({
        name: 'cash',
        type: 'int',
        default: 0
    })
    cash!: number;

};