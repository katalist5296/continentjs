import { Service } from '@rage-framework/core';
import { Observable, Subject } from 'rxjs';

export enum ShutdownSignal {
  SIGHUP = 'SIGHUP',
  SIGINT = 'SIGINT',
  SIGQUIT = 'SIGQUIT',
  SIGILL = 'SIGILL',
  SIGTRAP = 'SIGTRAP',
  SIGABRT = 'SIGABRT',
  SIGBUS = 'SIGBUS',
  SIGFPE = 'SIGFPE',
  SIGSEGV = 'SIGSEGV',
  SIGUSR2 = 'SIGUSR2',
  SIGTERM = 'SIGTERM',
}

@Service()
export class ExitHandlerService {
  init() {
    const signals = Object.keys(ShutdownSignal);
    this.listenToShutdownSignals(signals);
  }

  private listenToShutdownSignals(signals: string[]) {
    const cleanup = async (signal: string) => {
      try {
        signals.forEach((sig) => process.removeListener(sig, cleanup));
        console.log('AppStopped');
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
}
