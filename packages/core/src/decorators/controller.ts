import {isArray, isUndefined} from "@continentjs/utils";
import {IProvider, verifyProviders} from "@continentjs/di";
import {createClassDecorator} from "@continentjs/metadata";

export interface IControllerMetadata {
  providers?: Array<IProvider|Function>;
}

export function Controller(config?: IControllerMetadata) {
  if (!isArray(config?.providers)) {
    config.providers = [];
  }
  config.providers = verifyProviders(config.providers);
  return createClassDecorator(Controller, config);
}
