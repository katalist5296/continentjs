import { Behavior, Injector } from '@rage-framework/core';
import { PlayerService } from './player.service';

@Behavior()
export class PlayerBehavior {
  @Injector(PlayerService) private playerService: PlayerService;

  constructor() {
    console.log('Player Behavior');
    this.playerService.hello();
  }

  onInit() {
    console.log('PlayerBehavior onInit');
  }
}
