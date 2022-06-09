import {IProvider, MixedProvider} from "../interfaces";
import {
  isFactoryProvider,
  isValueProvider,
  verifyProvider,
  verifyProviders
} from "../helpers";
import {isArray, isDefined, isFunction, isUndefined} from "@continentjs/utils";
import {Inject, CreateProvider, AfterConstruct} from "../decorators";
import {createInterceptorsAsync} from "../helpers/interceptor";
import {SyncInjector} from "./sync-injector";
import {AbstractInjector} from "./abstract-injector";

export class Injector extends AbstractInjector<Injector> {

  static Sync: typeof SyncInjector = SyncInjector;

  constructor( _parent?: Injector, keys: Array<any> = []) {
    super(_parent, keys);
    this.set(Injector, this);
  }

  static async createAndResolveChild(parent: Injector, Class: MixedProvider, providers: Array<MixedProvider>): Promise<Injector> {
    let child = new Injector(parent, []);
    let provider = verifyProvider(Class);
    child.setName(provider);
    parent.addChild(child);
    await child.createAndResolve(provider, verifyProviders(providers));
    return child;
  }

  static async createAndResolve(Class: MixedProvider, providers: Array<MixedProvider>): Promise<Injector> {
    const injector = new Injector(null, []);
    const provider = verifyProvider(Class);
    injector.setName(provider);
    await injector.createAndResolve(provider, verifyProviders(providers));
    return injector;
  }

  async createAndResolve(provider: IProvider, providers: Array<IProvider>): Promise<any> {
    // create providers passed directly to injector first
    for (let item of providers) {
      await this.createAndResolve(item, SyncInjector.getProviders(item));
    }
    // If provider is already resolved return resolved one
    if (this.has(provider.provide)) {
      return this.get(provider.provide, provider.useValue || provider.useClass || provider.useFactory);
    } else if (isValueProvider(provider)) { // check if is use value type
      this.set(provider.provide, await provider.useValue);
      return this.get(provider.provide);
      // if it's factory invoke it and set invoked factory as value
    } else if (isFactoryProvider(provider)) {
      return await this.createFactory(provider);
    }
    return await this.createInstance(provider);
  }

  private async createFactory(provider: IProvider): Promise<any> {
    // providers on provider
    if (isArray(provider.providers)) {
      for (let item of verifyProviders(provider.providers)) {
        await this.createAndResolve(item, SyncInjector.getProviders(item));
      }
    }
    this.set(
      provider.provide,
      await (<IProvider>provider).useFactory.apply(
        null,
        isArray(provider.providers) ? verifyProviders(provider.providers).map(item => this.get(item.provide)) : []
      )
    );
    return this.get(provider.provide);
  }

  private async createInstance(provider: IProvider): Promise<any> {
    // special case when object needs to be created by injector and inject providers at the same time
    if (isArray(provider.providers)) {
      for (let item of verifyProviders(provider.providers)) {
        await this.createAndResolve(item, SyncInjector.getProviders(item));
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
      const isCreateProvider = item.decorator === CreateProvider && !this.has(token);
      const value = isCreateProvider ? await this.createAndResolve(token, []) : this.get(token, provider);
      Reflect.defineProperty(instance, propertyKey, {
        value,
        writable: isMutable
      });
    }
    // set provider and value
    this.set(provider.provide, instance);
    // prepare interceptors
    await createInterceptorsAsync(provider, this);
    // create interceptors
    // invoke after construct
    let key = metadata.find(item => item.decorator === AfterConstruct)?.propertyKey ?? "afterConstruct";
    if (isFunction(instance[key])) {
      instance[key].call(instance);
    }
    return instance;
  }
}
