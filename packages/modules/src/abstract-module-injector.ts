import {IProvider, verifyProvider} from "@continentjs/di";
import {IModuleMetadata} from "./imodule";

interface Type<T> extends Function {
  new(...args: any[]): T;
}

interface InjectorImpl {
  get(provider: string, Class?: IProvider): any;
  get<P>(provider: Type<P>, Class?: IProvider): P;
  destroy(): void;
}

export class AbstractModuleInjector<T extends InjectorImpl> {
  protected _allModulesMetadata: Map<any, IModuleMetadata> = new Map();
  protected _providers: Map<any, T> = new Map();

  get(Class: Function | IProvider): any {
    let provider: IProvider = verifyProvider(Class);
    return this.getInjector(provider).get(provider.provide);
  }

  getInjector(Class: Function | IProvider): T {
    let provider: IProvider = verifyProvider(Class);
    return this._providers.get(provider.provide);
  }

  has(Class: IProvider | Function): boolean {
    let provider: IProvider = verifyProvider(Class);
    return this._providers.has(provider.provide);
  }

  remove(Class: Function | IProvider): boolean {
    let provider: IProvider = verifyProvider(Class);
    this.getInjector(provider).destroy();
    return this._providers.delete(provider.provide);
  }

  getAllMetadata(): Map<any, IModuleMetadata>  {
    return this._allModulesMetadata;
  }
}
