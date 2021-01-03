import { Application } from '@rage-framework/core';
import { ShutdownSignal } from '../enums/shutdown-signal.enum';

export abstract class Server extends Application {
  constructor() {
    super();

    this.initShutdownHooks();
  }

  private initShutdownHooks() {
    const signals = Object.keys(ShutdownSignal);
    this.listenToShutdownSignals(signals);
  }

  private listenToShutdownSignals(signals: string[]) {
    const cleanup = async (signal: string) => {
      try {
        signals.forEach((sig) => process.removeListener(sig, cleanup));
        await this.onShutdown(signal);
        process.kill(process.pid, signal);
      } catch (err) {
        console.log((err as Error)?.stack);
        process.exit(1);
      }
    };

    signals.forEach((signal: string) => {
      process.on(signal as any, cleanup);
    });
  }

  abstract onShutdown(signal: string): Promise<void>;
}
