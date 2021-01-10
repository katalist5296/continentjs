import { ConfigModel, Container } from '@rage-framework/core';
import { ServerService } from '../services/server.service';

const serverService = Container.get(ServerService);

export const bootstrap = (app, config?: ConfigModel): void =>
  serverService.start(app, config) as never;
