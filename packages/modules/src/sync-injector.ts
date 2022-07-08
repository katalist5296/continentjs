import {
  getProviderName,
  Injector,
  IProvider,
  SyncInjector,
  shiftLeft,
  verifyProvider,
  verifyProviders, Injectable, isClassProvider
} from "@continentjs/di";
import {isArray} from "@continentjs/utils";
import {IModuleMetadata} from "./interfaces/module.interface";
import {Module} from "./decorators/module";
import {getClassMetadata, IMetadata} from "@continentjs/metadata";
import {AbstractModuleInjector} from "./abstract-module-injector";
import {ModuleInjector} from "./injector";
import { IInjectableMetadata } from "./interfaces/injectable.interface";

export class SyncModuleInjector extends AbstractModuleInjector<SyncInjector> {

  static createAndResolve(Class: Function | IProvider, sharedProviders: Array<Function | IProvider>, mutableKeys: Array<any> = []) {
    const injector = new SyncModuleInjector();
    const sharedInjector = injector.createAndResolveSharedProviders(sharedProviders);
    injector.createAndResolve(Class, sharedInjector, mutableKeys);
    return injector;
  }

  createAndResolveSharedProviders(providers: Array<Function | IProvider>): SyncInjector {
    const injector: SyncInjector = new Injector.Sync();
    injector.set(ModuleInjector, this);
    for (const provider of verifyProviders(providers)) {
      injector.createAndResolve(provider, []);
    }
    return injector;
  }

  createAndResolve(Class: Function | IProvider, sharedInjector: SyncInjector, mutableKeys: Array<any> = []): void {
    const provider: IProvider = verifyProvider(Class);
    if (this.has(provider)) {
      throw new Error(`Module ${getProviderName(provider)} is already initialized`);
    }

    const metadata: IMetadata = getClassMetadata(Module, provider.provide);
    const config: IModuleMetadata = metadata.args;
    let moduleProviders: Array<IProvider> = verifyProviders(config.providers);
    const injector = new Injector.Sync(sharedInjector, mutableKeys);
    moduleProviders = this.processImportsAndExports(moduleProviders, config, sharedInjector, mutableKeys);

    // create local module injector
    injector.setName(provider);

    let notFilterModuleProviders = [...moduleProviders];
    for (const prv of moduleProviders) {
      if (isClassProvider(prv)) {
        const metadata: IMetadata = getClassMetadata(Injectable, prv.provide);
        const config: IInjectableMetadata = metadata?.args;

        if (config?.providedIn === 'root') {
          notFilterModuleProviders = notFilterModuleProviders.filter(provider => provider !== prv);
          sharedInjector.createAndResolve(prv, []);
        }
      }
    }

    injector.createAndResolve(provider, notFilterModuleProviders);
    this._providers.set(provider.provide, injector);
    this._allModulesMetadata.set(provider.provide, config);
  }

  private processImportsAndExports(
    providers: Array<IProvider>,
    config: IModuleMetadata,
    sharedInjector: SyncInjector,
    mutableKeys: Array<any> = []
  ): Array<IProvider> {
    if (isArray(config.imports)) {
      for (const importModule of verifyProviders(config.imports)) {
        const importedProvider: IProvider = verifyProvider(importModule);
        const importedMetadata: IMetadata = getClassMetadata(Module, importedProvider.provide);
        const importedConfig: IModuleMetadata = importedMetadata.args;

        if (!this.has(importedProvider)) {
          this.createAndResolve(importedProvider, sharedInjector, mutableKeys);
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
