import {IProvider, MixedProvider} from "../interfaces";
import {
  isClassProvider,
  isFactoryProvider,
  isValueProvider,
  verifyProvider,
  verifyProviders,
  createInterceptors
} from "../helpers";
import {getAllMetadataForTarget, IMetadata} from "@continentjs/metadata";
import {isArray, isDefined, isFunction, isUndefined} from "@continentjs/utils";
import {Inject, CreateProvider, AfterConstruct} from "../decorators";
import {AbstractInjector} from "./abstract-injector";
import {Injector} from "./injector";

export class SyncInjector extends AbstractInjector<SyncInjector> {
  static readonly __actionParams__ = new Map<any, Map<string, Array<IProvider>>>();
  static readonly __metadataCache__ = new Map();
  static readonly __interceptors__: Set<Function> = new Set<Function>();

  constructor(_parent?: SyncInjector, keys: Array<any> = []) {
    super(_parent, keys);
    this.set(Injector, this);
  }

  static designParamComparator(item, propertyKey = "constructor") {
    return item.metadataKey === "design:paramtypes" && item.propertyKey === propertyKey;
  }

  static parameterComparator(item, propertyKey = "constructor") {
    return item.type === "parameter" && item.propertyKey === propertyKey;
  }

  static getProviders(provider: IProvider, propertyKey = "constructor"): Array<IProvider> {
    if (!isClassProvider(provider)) {
      return [];
    }
    const provide = provider.provide;
    let map = SyncInjector.__actionParams__.has(provide) ? SyncInjector.__actionParams__.get(provide) : new Map();
    if (!map.has(propertyKey)) {
      const metadata = SyncInjector.getAllMetadataForTarget(provider);
      let paramTypes = metadata.find(item => SyncInjector.designParamComparator(item, propertyKey))?.args ?? [];
      metadata.filter(item => SyncInjector.parameterComparator(item, propertyKey)).forEach(
        item => paramTypes.splice(item.paramIndex, 1, isDefined(item.args.token) ? item.args.token : item.designType)
      );
      const providers = verifyProviders(paramTypes);
      map.set(propertyKey, providers);
      SyncInjector.__actionParams__.set(provide, map);
      return providers;
    }
    return map.get(propertyKey);
  }

  static getAllMetadataForTarget(provider: IProvider): Array<IMetadata> {
    if (SyncInjector.__metadataCache__.has(provider.provide)) {
      return SyncInjector.__metadataCache__.get(provider.provide);
    }
    let providers = getAllMetadataForTarget(provider.useClass);
    SyncInjector.__metadataCache__.set(provider.provide, providers);
    return providers;
  }

  static createAndResolveChild(parent: SyncInjector, Class: MixedProvider, providers: Array<MixedProvider>): SyncInjector {
    let child = new SyncInjector(parent);
    let provider = verifyProvider(Class);
    child.setName(provider);
    parent.addChild(child);
    child.createAndResolve(provider, verifyProviders(providers));
    return child;
  }

  static createAndResolve(Class: MixedProvider, providers: Array<MixedProvider>): SyncInjector {
    let injector = new SyncInjector();
    let provider = verifyProvider(Class);
    injector.setName(provider);
    injector.createAndResolve(provider, verifyProviders(providers));
    return injector;
  }

  createAndResolve(provider: IProvider, providers: Array<IProvider>): any {
    // create providers passed directly to injector first
    for (let item of providers) {
      this.createAndResolve(item, SyncInjector.getProviders(item));
    }
    // If provider is already resolved return resolved one
    if (this.has(provider.provide)) {
      return this.get(provider.provide, provider.useValue || provider.useClass || provider.useFactory);
    } else if (isValueProvider(provider)) { // check if is use value type
      this.set(provider.provide, provider.useValue);
      return this.get(provider.provide);
      // if it's factory invoke it and set invoked factory as value
    } else if (isFactoryProvider(provider)) {
      return this.createFactory(provider);
    }
    return this.createInstance(provider);
  }

  private createFactory(provider: IProvider): any {
    // providers on provider
    if (isArray(provider.providers)) {
      for (let item of verifyProviders(provider.providers)) {
        this.createAndResolve(item, SyncInjector.getProviders(item));
      }
    }
    this.set(
      provider.provide,
      (<IProvider>provider).useFactory.apply(
        null,
        isArray(provider.providers) ? verifyProviders(provider.providers).map(item => this.get(item.provide)) : []
      )
    );
    return this.get(provider.provide);
  }

  private createInstance(provider: IProvider): any {
    // special case when object needs to be created by injector and inject providers at the same time
    if (isArray(provider.providers)) {
      for (let item of verifyProviders(provider.providers)) {
        this.createAndResolve(item, SyncInjector.getProviders(item));
      }
    }
    // get providers for constructor
    const args = SyncInjector.getProviders(provider);
    // create instance
    const instance = Reflect.construct(
      provider.useClass,
      isArray(args) ? args.map(item => this.get(isDefined(item.provide) ? item.provide : item, item)) : []
    );
    // set inject providers on instance
    const metadata = SyncInjector.getAllMetadataForTarget(provider);
    const decorators: Array<Function> = [Inject, CreateProvider];
    const properties = metadata.filter(item => item.type === "property" && decorators.includes(item.decorator));
    for (const item of properties) {
      const token = isUndefined(item.args.token) ? item.designType : item.args.token;
      const isMutable = item.args.isMutable;
      const propertyKey = item.propertyKey;
      const value = item.decorator === CreateProvider && !this.has(token) ? this.createAndResolve(token, []) : this.get(token, provider);
      Reflect.defineProperty(instance, propertyKey, {
        value,
        writable: isMutable
      });
    }
    // set provider and value
    this.set(provider.provide, instance);
    // prepare interceptors
    createInterceptors(provider, this);
    // create interceptors
    // invoke after construct
    let key = metadata.find(item => item.decorator === AfterConstruct)?.propertyKey ?? "afterConstruct";
    if (isFunction(instance[key])) {
      instance[key].call(instance);
    }
    return instance;
  }
}
