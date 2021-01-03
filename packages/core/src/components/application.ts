export abstract class Application {
  private _initialized = false;

  get initialized(): boolean {
    return this._initialized;
  }

  abstract onInitialize(): Promise<number>;
  abstract onStarted(): void;
}
