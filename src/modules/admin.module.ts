import { AdminController } from '@controllers/admin.controller';
import { Module } from '@nestjs/common';
import { AdminService } from '@services/admin.service';

@Module({
    providers: [AdminService],
    controllers: [AdminController]
})
export class AdminModule {}
