import {Application} from "./application";

export class FactoryStatic {
  async create(module: any): Promise<void> {
    const app = new Application();
    await app.init(module)
  }
}


export const ContinentFactory = new FactoryStatic();
