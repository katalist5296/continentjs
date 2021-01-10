import { Container } from '../container';
import {LoggerService} from "../services/utils/logger.service";
import {ModuleService} from "../services/core/module.service";
import {CacheLayer, CacheLayerItem} from "../services/cache";

const moduleService = Container.get(ModuleService);
const bootstrapLogger = Container.get(LoggerService);

export function GenericConstruct(
  module: any,
  original,
  currentModule: CacheLayer<CacheLayerItem<Function>>
) {
  return function construct(constructor, args) {
    if (!module) {
      return new constructor();
    }

    if (module.modules) {
      moduleService.setImports(module.modules, original);
    }

    if (module.services) {
      moduleService.setServices(module.services, original, currentModule);
    }

    if (module.behaviors) {
      moduleService.setBehaviors(module.behaviors, original, currentModule);
    }

    bootstrapLogger.log(`Bootstrap -> @Module('${constructor.originalName}'): finished!`);
    return Container.get(constructor);
  };
}
