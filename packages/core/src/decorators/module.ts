import { Container, ServiceMetadata } from '../container';
import { CacheService } from '../services/cache/cache-layer.service';
import { GenericConstruct } from '../helpers/generic-constructor';
import { LoggerService } from '../services/utils/logger.service';
import { ResolverService } from '../services/utils/resolver.service';
import { MetadataService } from '../services/utils/metadata.service';
import { IModuleOptions } from './interfaces/module-options';
import { ServiceArgumentsInternal } from './interfaces/service-arguments';

const bootstrapLogger = Container.get(LoggerService);
const resolverService = Container.get(ResolverService);
const cacheService = Container.get(CacheService);
const metadataService = Container.get(MetadataService);

export function Module<T, K extends keyof T>(
  module?: IModuleOptions<T, K>,
): Function {
  return (target: any) => {
    module = module || {};
    const original: ServiceArgumentsInternal = Object.assign(target);
    const moduleName = target.name || target.constructor.name;
    const generatedHashData = metadataService.generateHashData(
      module,
      original,
    );
    const uniqueModuleTemplate = metadataService.parseModuleTemplate(
      moduleName,
      generatedHashData,
      `${target}`,
    );
    const uniqueHashForClass = metadataService.createUniqueHash(
      uniqueModuleTemplate,
    );

    Object.defineProperty(original, 'originalName', {
      value: original.name || original.constructor.name,
      writable: false,
    });
    Object.defineProperty(original, 'name', {
      value: uniqueHashForClass,
      writable: true,
    });

    const currentModuleLayer = cacheService.createLayer<Function>({
      name: uniqueHashForClass,
    });

    original.metadata = {
      moduleName: original.originalName,
      moduleHash: uniqueHashForClass,
      options: null,
      type: 'module',
      raw: uniqueModuleTemplate,
    };

    const constructorFunction: any = function (...args: any[]) {
      bootstrapLogger.log(
        `Bootstrap -> @Module('${original.originalName}'): loading...`,
      );
      return GenericConstruct(
        module,
        original,
        currentModuleLayer,
      )(original, args);
    };

    Object.assign(constructorFunction, original);

    resolverService
      .resolveDependencies(uniqueHashForClass, original, moduleName)
      .subscribe(() =>
        bootstrapLogger.log(
          `Start -> @Module('${original.originalName}'): loaded!`,
        ),
      );

    Object.getOwnPropertyNames(original)
      .filter((prop) => typeof original[prop] === 'function')
      .map((descriptor) =>
        Object.defineProperty(constructorFunction, descriptor, {
          configurable: true,
          writable: true,
          value: original[descriptor],
        }),
      );

    const service: ServiceMetadata<T, K> = {
      type: constructorFunction,
    };

    Container.set(service);
    return constructorFunction;
  };
}

/** @angular module compatability */
export const NgModule = Module;
