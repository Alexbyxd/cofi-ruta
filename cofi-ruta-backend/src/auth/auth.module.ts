import { Module } from '@nestjs/common';
import { BetterAuthController } from './better-auth/better-auth.controller';

@Module({
  controllers: [BetterAuthController],
  providers: [],
  exports: [],
})
export class AuthModule {}
