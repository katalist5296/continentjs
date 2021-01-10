import { bootstrap } from '@rage-framework/server';
import { ServerModule } from './core/server.module';

bootstrap(ServerModule, {
  logger: {
    logging: true,
    date: true
  }
});
