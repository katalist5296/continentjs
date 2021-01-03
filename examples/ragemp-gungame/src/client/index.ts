import { Client } from '@rage-framework/client';

class GunGameClient extends Client {
  async onInitialize(): Promise<void> {
    console.log('client::onInitialize');
  }

  onStarted() {
    console.log('client::onInitialize');
  }
}

export default new GunGameClient();
