import {ModuleInjector, SyncModuleInjector} from "@continentjs/modules";
import {Controller, IControllerMetadata, IModuleMetadata} from "./decorators";
import {Injector, IProvider, shiftLeft, verifyProvider, verifyProviders} from "@continentjs/di";
import {IMetadata} from "@continentjs/metadata";

export interface ServerConfig {
  useSyncInjector?: boolean;
}

export interface ControllerProvider<P, M> {
  provider: P;
  metadata: M;
}


export interface ControllerDefinition {
  module?: ControllerProvider<IProvider, IModuleMetadata>;
  controller: ControllerProvider<IProvider, IControllerMetadata>;
  allControllerMetadata: Array<IMetadata>;
  method: IMetadata;
}

export class Application {
  async init(Class: Function, config?: ServerConfig): Promise<void> {
    const moduleInjector = config?.useSyncInjector ?
      ModuleInjector.Sync.createAndResolve(Class, []) :
      await ModuleInjector.createAndResolve(Class, []);

    const controllerDefinitions = this.getControllerDefinitions(moduleInjector);
    for (const def of controllerDefinitions) {
      const controllerModuleInjector = moduleInjector.getInjector(def.module.provider);
      const controllerProviders = verifyProviders(def.controller.metadata.providers);

      await controllerModuleInjector.createAndResolve(
        def.controller.provider,
        controllerProviders
      );
    }
  }

  private getControllerDefinitions(moduleInjector: SyncModuleInjector | ModuleInjector): Array<ControllerDefinition> {
    let routeDefinitions: Array<ControllerDefinition> = [];
    moduleInjector.getAllMetadata().forEach((moduleMetadata: IModuleMetadata, module: Function) => {
      verifyProviders(moduleMetadata.controllers).forEach((provider: IProvider) => {
        let allControllerMetadata = Injector.Sync.getAllMetadataForTarget(provider);
        let controllerMetadata: IControllerMetadata = allControllerMetadata.find(item => item.decorator === Controller)?.args;
        allControllerMetadata
          .forEach(method => {
            routeDefinitions.push({
              module: {
                provider: verifyProvider(module),
                metadata: moduleMetadata
              },
              controller: {
                provider,
                metadata: controllerMetadata
              },
              allControllerMetadata,
              method
            });
          });
      });
    });
    return routeDefinitions;
  }
}
