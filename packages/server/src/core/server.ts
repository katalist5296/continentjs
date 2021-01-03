import { Application } from '@rage-framework/core';

export abstract class Server extends Application {
  abstract onShutdown(): Promise<void>;
}
