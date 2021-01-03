import { Server } from '@rage-framework/server';

class GunGameServer extends Server {
  async onInitialize(): Promise<void> {
    console.log('server::onInitialize');
  }

  onStarted() {
    console.log('server::onStarted');
  }

  async onShutdown(signal: string): Promise<void> {
    console.log('server::onShutdown');
  }
}

export default new GunGameServer();
