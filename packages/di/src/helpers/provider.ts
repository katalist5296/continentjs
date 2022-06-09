import {
  isArray,
  isDefined,
  isFalsy,
  isFunction,
  isObject,
  isString
} from "@continentjs/utils";
import {IProvider, MixedProvider} from "../interfaces";

export function getProviderName(Class: any): string {
  if (isObject(Class) && (isFactoryProvider(Class) || isClassProvider(Class) || isValueProvider(Class))) {
    return getProviderName(Class.provide);
  } if (isFunction(Class)) {
    return !!Class.name ? Class.name : "Function";
  }
  return isString(Class) ? Class : null;
}

export function shiftRight(source: Array<IProvider>, target: Array<IProvider>) {
  return target.filter((bI: IProvider) => isFalsy(source.find((aI: IProvider) => aI.provide === bI.provide))).concat(source);
}

export function shiftLeft(source: Array<IProvider>, target: Array<IProvider>) {
  return source.concat(target.filter((bI: IProvider) =>
    isFalsy(source.find((aI: IProvider) => aI.provide === bI.provide))
  ));
}

// eslint-disable-next-line no-redeclare
export function verifyProvider(value: MixedProvider): IProvider {
  if (isFunction(value)) {
    return <IProvider>{
      provide: value,
      useClass: value
    };
  }
  return <IProvider>value;
}

export function verifyProviders(providers: Array<MixedProvider>): Array<IProvider> {
  return isArray(providers) ? providers.map(ProviderClass => verifyProvider(ProviderClass)) : [];
}

export function isFactoryProvider(provider: IProvider): boolean {
  return isFunction(provider.useFactory);
}

export function isValueProvider(provider: IProvider): boolean {
  return isDefined(provider.useValue);
}

export function isClassProvider(provider: IProvider): boolean {
  return isFunction(provider.useClass);
}


export class ProviderList {
  private providers = new Map();

  constructor(private keys: Array<any> = []) {
  }

  isMutable(key: any): boolean {
    return this.keys.indexOf(key) > -1;
  }

  set(key: any, value: Object): void {
    if (!this.has(key) || this.isMutable(key)) {
      this.providers.set(key, value);
    } else {
      throw new TypeError(
        `${getProviderName(key)} is already defined in injector, value: ${value}`
      );
    }
  }

  get(key: any): any {
    return this.providers.get(key);
  }

  clear() {
    this.providers.clear();
  }

  has(key: any): boolean {
    return this.providers.has(key);
  }
}
