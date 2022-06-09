import {IModuleMetadata} from "./imodule";
import {isArray} from "@continentjs/utils";
import {createClassDecorator} from "@continentjs/metadata";

export function Module(config: IModuleMetadata) {
  if (!isArray(config.exports)) {
    config.exports = [];
  }
  if (!isArray(config.imports)) {
    config.imports = [];
  }
  if (!isArray(config.providers)) {
    config.providers = [];
  }
  return createClassDecorator(Module, config);
}
