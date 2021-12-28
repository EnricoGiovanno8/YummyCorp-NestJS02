import { registerAs } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Attendee } from "../events/attendee.entity";
import { Subject } from "../school/subject.entity";
import { Event } from "../events/event.entity";
import { Teacher } from "../school/teacher.entity";

export default registerAs('orm.config', (): TypeOrmModuleOptions => ({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    entities: [Event, Attendee, Subject, Teacher],
    synchronize: true
}))