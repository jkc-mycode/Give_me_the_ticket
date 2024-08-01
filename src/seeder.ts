import { TypeOrmModule } from '@nestjs/typeorm';
import { seeder } from 'nestjs-seeder';
import { Show } from './entities/shows/show.entity';
import { Schedule } from 'src/entities/shows/schedule.entity';
import { ShowSeeder } from './seeders/shows.seeder';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/users/user.entity';
import { ScheduleSeeder } from './seeders/schedule.seeder';
import { UserSeeder } from './seeders/user.seeder';
import { typeOrmModuleOptions } from './configs/database.config';

seeder({
  imports: [
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    TypeOrmModule.forFeature([Show, User, Schedule]),
  ],
}).run([ShowSeeder, UserSeeder, ScheduleSeeder]);
