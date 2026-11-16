import { Module } from '@nestjs/common';
import { BetterAuthController } from './better-auth/better-auth.controller';
import { PanelAccessController } from './panel-access.controller';

@Module({
  controllers: [BetterAuthController, PanelAccessController],
  providers: [],
  exports: [],
})
export class AuthModule {}
