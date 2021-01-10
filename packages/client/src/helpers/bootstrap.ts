import { ConfigModel, Container } from '@rage-framework/core';
import { ClientService } from '../services/client.service';

const clientService = Container.get(ClientService);

export const bootstrap = (app, config?: ConfigModel): void =>
  clientService.start(app, config) as never;
