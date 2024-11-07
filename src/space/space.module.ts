import { Module } from '@nestjs/common';
import { SpaceService } from './space.service';
import { SpaceController } from './space.controller';

@Module({
  providers: [SpaceService],
  controllers: [SpaceController]
})
export class SpaceModule {}
