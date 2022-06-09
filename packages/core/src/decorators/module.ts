import {Module as AModule, IModuleMetadata as AIModuleMetadata} from "@continentjs/modules";
import {IProvider} from "@continentjs/di";

export interface IModuleMetadata extends AIModuleMetadata {
  controllers?: Array<Function | IProvider>;
}

export function Module(config: IModuleMetadata): ClassDecorator {
  return AModule(config);
}
