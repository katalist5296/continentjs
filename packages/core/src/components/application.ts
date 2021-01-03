export abstract class Application {
  private _initialized = false;

  constructor() {
    (async () => {
      await this.onInitialize();

      this._initialized = true;
      this.onStarted();
    })();
  }

  get initialized(): boolean {
    return this._initialized;
  }

  abstract onInitialize(): Promise<void>;
  abstract onStarted(): void;
}
