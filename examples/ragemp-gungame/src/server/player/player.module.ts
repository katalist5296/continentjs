import { Module } from '@rage-framework/core';
import { PlayerBehavior } from './player.behavior';
import { PlayerService } from './player.service';

@Module({
  behaviors: [PlayerBehavior],
  services: [PlayerService],
})
export class PlayerModule {}
