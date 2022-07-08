import {
  getProviderName,
  Injector,
  IProvider,
  shiftLeft,
  Injectable,
  verifyProvider,
  verifyProviders, isClassProvider
} from "@continentjs/di";
import {isArray} from "@continentjs/utils";
import {IModuleMetadata} from "./interfaces/module.interface";
import {Module} from "./decorators/module";
import {getClassMetadata, IMetadata} from "@continentjs/metadata";
import {AbstractModuleInjector} from "./abstract-module-injector";
import {SyncModuleInjector} from "./sync-injector";
import { IInjectableMetadata } from "./interfaces/injectable.interface";

export class ModuleInjector extends AbstractModuleInjector<Injector> {

  static Sync: typeof SyncModuleInjector = SyncModuleInjector;

  static async createAndResolve(
    Class: Function | IProvider,
    sharedProviders: Array<Function | IProvider>,
    mutableKeys: Array<any> = []
  ): Promise<ModuleInjector> {
    const injector = new ModuleInjector();
    const sharedInjector = await injector.createAndResolveSharedProviders(sharedProviders);
    await injector.createAndResolve(Class, sharedInjector, mutableKeys);
    return injector;
  }

  async createAndResolveSharedProviders(providers: Array<Function | IProvider>): Promise<Injector> {
    const injector: Injector = new Injector();
    injector.set(ModuleInjector, this);
    for (const provider of verifyProviders(providers)) {
      await injector.createAndResolve(provider, []);
    }
    return injector;
  }

  async createAndResolve(Class: Function | IProvider, sharedInjector: Injector, mutableKeys: Array<any> = []): Promise<Injector> {
    const provider: IProvider = verifyProvider(Class);
    if (this.has(provider)) {
      throw new Error(`Module ${getProviderName(provider)} is already initialized`);
    }

    const metadata: IMetadata = getClassMetadata(Module, provider.provide);
    const config: IModuleMetadata = metadata.args;
    let moduleProviders: Array<IProvider> = verifyProviders(config.providers);
    const injector = new Injector(sharedInjector, mutableKeys);
    moduleProviders = await this.processImportsAndExports(moduleProviders, config, sharedInjector, mutableKeys);

    // shared must be after import & export is processed
    injector.setName(provider);

    let notFilterModuleProviders = [...moduleProviders];
    for (const prv of moduleProviders) {
      if (isClassProvider(prv)) {
        const metadata: IMetadata = getClassMetadata(Injectable, prv.provide);
        const config: IInjectableMetadata = metadata?.args;

        if (config?.providedIn === 'root') {
          notFilterModuleProviders = notFilterModuleProviders.filter(provider => provider !== prv);
          await sharedInjector.createAndResolve(prv, []);
        }
      }
    }

    await injector.createAndResolve(provider, notFilterModuleProviders);
    this._providers.set(provider.provide, injector);
    this._allModulesMetadata.set(provider.provide, config);
    return injector;
  }

  private async processImportsAndExports(
    providers: Array<IProvider>,
    config: IModuleMetadata,
    sharedInjector: Injector,
    mutableKeys: Array<any> = []
  ): Promise<Array<IProvider>> {
    if (isArray(config.imports)) {
      for (const importModule of verifyProviders(config.imports)) {
        const importedProvider: IProvider = verifyProvider(importModule);
        const importedMetadata: IMetadata = getClassMetadata(Module, importedProvider.provide);
        const importedConfig: IModuleMetadata = importedMetadata.args;

        if (!this.has(importedProvider)) {
          await this.createAndResolve(importedProvider, sharedInjector, mutableKeys);
        }
        if (isArray(importedConfig.exports)) {
          providers = shiftLeft(
            providers,
            verifyProviders(importedConfig.exports).map((exportedProvider: IProvider) => {
              return {
                provide: exportedProvider.provide,
                useValue: this.getInjector(importedProvider).get(exportedProvider.provide)
              };
            })
          );
        }
      }
    }
    return providers;
  }
}
