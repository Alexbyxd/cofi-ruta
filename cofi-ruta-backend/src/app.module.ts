import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PairingModule } from './pairing/pairing.module';
import { CafesModule } from './cafes/cafes.module';
import { GroupsModule } from './groups/groups.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PairingModule,
    GroupsModule,
    CafesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
