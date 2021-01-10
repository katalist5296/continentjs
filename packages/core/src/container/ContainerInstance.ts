import { Container } from './Container';
import { MissingProvidedServiceTypeError } from './error/MissingProvidedServiceTypeError';
import { ServiceNotFoundError } from './error/ServiceNotFoundError';
import { Token } from './Token';
import { ObjectType } from './types/ObjectType';
import { ServiceIdentifier } from './types/ServiceIdentifier';
import { ServiceMetadata } from './types/ServiceMetadata';
import { constructorWatcherService } from '../services/utils/constructor-watcher.service';

export class ContainerInstance {
  // -------------------------------------------------------------------------
  // Public Properties
  // -------------------------------------------------------------------------
  id: any;

  // -------------------------------------------------------------------------
  // Private Properties
  // -------------------------------------------------------------------------
  private services: Map<
    ServiceMetadata<any, any>,
    ServiceMetadata<any, any>
  > = new Map();

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  constructor(id: any) {
    this.id = id;
  }

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------

  has<T>(type: ObjectType<T>): boolean;
  has<T>(id: string): boolean;
  has<T>(id: Token<T>): boolean;
  has<T>(identifier: ServiceIdentifier): boolean {
    return !!this.findService(identifier);
  }

  get<T>(type: ObjectType<T>): T;
  get<T>(id: string): T;
  get<T>(id: Token<T>): T;
  get<T>(id: { service: T }): T;
  get<T>(identifier: ServiceIdentifier<T>): T {
    const globalContainer = Container.of(undefined);
    const service = globalContainer.findService(identifier);
    const scopedService = this.findService(identifier);

    if (service && service.global === true) {
      return this.getServiceValue(identifier, service);
    }

    if (scopedService) {
      return this.getServiceValue(identifier, scopedService);
    }

    if (service && this !== globalContainer) {
      const clonedService = Object.assign({}, service);
      clonedService.value = undefined;
      const value = this.getServiceValue(identifier, clonedService);
      this.set(identifier, value);
      return value;
    }

    return this.getServiceValue(identifier, service);
  }

  getMany<T>(id: string): T[];
  getMany<T>(id: Token<T>): T[];
  getMany<T>(id: string | Token<T>): T[] {
    return this.filterServices(id).map((service) =>
      this.getServiceValue(id, service),
    );
  }

  set<T, K extends keyof T>(service: ServiceMetadata<T, K>): this;
  set(type: Function, value: any): this;
  set(name: string, value: any): this;
  set(token: Token<any>, value: any): this;
  set(token: ServiceIdentifier, value: any): this;
  set<T, K extends keyof T>(values: ServiceMetadata<T, K>[]): this;
  set(
    identifierOrServiceMetadata:
      | ServiceIdentifier
      | ServiceMetadata<any, any>
      | ServiceMetadata<any, any>[],
    value?: any,
  ): this {
    if (identifierOrServiceMetadata instanceof Array) {
      identifierOrServiceMetadata.forEach((v: any) => this.set(v));
      return this;
    }
    if (
      typeof identifierOrServiceMetadata === 'string' ||
      identifierOrServiceMetadata instanceof Token
    ) {
      return this.set({ id: identifierOrServiceMetadata, value: value });
    }
    if (
      typeof identifierOrServiceMetadata === 'object' &&
      (identifierOrServiceMetadata as { service: Token<any> }).service
    ) {
      return this.set({
        id: (identifierOrServiceMetadata as { service: Token<any> }).service,
        value: value,
      });
    }
    if (identifierOrServiceMetadata instanceof Function) {
      return this.set({
        type: identifierOrServiceMetadata,
        id: identifierOrServiceMetadata,
        value: value,
      });
    }

    // const newService: ServiceMetadata<any, any> = arguments.length === 1 && typeof identifierOrServiceMetadata === 'object'  && !(identifierOrServiceMetadata instanceof Token) ? identifierOrServiceMetadata : undefined;
    const newService: ServiceMetadata<
      any,
      any
    > = identifierOrServiceMetadata as any;
    const service = this.services.get(newService);
    if (service && service.multiple !== true) {
      Object.assign(service, newService);
    } else {
      this.services.set(newService, newService);
    }

    return this;
  }

  remove(...ids: ServiceIdentifier[]): this {
    ids.forEach((id) => {
      this.filterServices(id).forEach((service) => {
        this.services.delete(service);
      });
    });
    return this;
  }

  reset(): this {
    this.services.clear();
    return this;
  }

  // -------------------------------------------------------------------------
  // Private Methods
  // -------------------------------------------------------------------------
  private filterServices(
    identifier: ServiceIdentifier,
  ): ServiceMetadata<any, any>[] {
    return Array.from(this.services.values()).filter((service) => {
      if (service.id) {
        return service.id === identifier;
      }

      if (service.type && identifier instanceof Function) {
        return (
          service.type === identifier ||
          identifier.prototype instanceof service.type
        );
      }
      return false;
    });
  }

  private findService(
    identifier: ServiceIdentifier,
  ): ServiceMetadata<any, any> | undefined {
    return Array.from(this.services.values()).find((service) => {
      if (service.id) {
        if (
          identifier instanceof Object &&
          service.id instanceof Token &&
          (identifier as any).service instanceof Token
        ) {
          return service.id === (identifier as any).service;
        }

        return service.id === identifier;
      }

      if (service.type && identifier instanceof Function) {
        return service.type === identifier; // todo: not sure why it was here || identifier.prototype instanceof service.type;
      }
      return false;
    });
  }

  private getServiceValue(
    identifier: ServiceIdentifier,
    service: ServiceMetadata<any, any> | undefined,
  ): any {
    if (service && service.value !== undefined) {
      return service.value;
    }

    if (
      (!service || !service.type) &&
      (!service || !service.factory) &&
      (typeof identifier === 'string' || identifier instanceof Token)
    ) {
      throw new ServiceNotFoundError(identifier);
    }

    let type = undefined;
    if (service && service.type) {
      type = service.type;
    } else if (service && service.id instanceof Function) {
      type = service.id;
    } else if (identifier instanceof Function) {
      type = identifier;
    }

    if (!service) {
      if (!type) {
        throw new MissingProvidedServiceTypeError(identifier);
      }
      service = { type: type };
      this.services.set(service, service);
    }

    const paramTypes =
      type && Reflect && (Reflect as any).getMetadata
        ? (Reflect as any).getMetadata('design:paramtypes', type)
        : undefined;
    let params: any[] = paramTypes
      ? this.initializeParams(type, paramTypes)
      : [];

    let value: any;
    if (service.factory) {
      params = params.filter((param) => param !== undefined);

      if (service.factory instanceof Array) {
        value = (this.get(service.factory[0]) as any)[service.factory[1]](
          ...params,
        );
      } else {
        value = service.factory(...params, this);
      }
    } else {
      if (!type) {
        throw new MissingProvidedServiceTypeError(identifier);
      }

      params.unshift(null);
      params.push(this);

      if (type.prototype.OnBefore) {
        type.prototype.OnBefore.bind(type)();
      }
      value = new (type.bind.apply(type, params))();
      constructorWatcherService.createConstructor(type['name'], {
        type,
        value,
      });

      if (value.onInit) {
        value.onInit.bind(value)();
      }
    }

    if (service && !service.transient && value) {
      service.value = value;
    }

    if (type) {
      this.applyPropertyHandlers(type, value);
    }

    return value;
  }

  private initializeParams(type: Function, paramTypes: any[]): any[] {
    return paramTypes.map((paramType, index) => {
      const paramHandler = Array.from(Container.handlers.values()).find(
        (handler) => handler.object === type && handler.index === index,
      );
      if (paramHandler) {
        return paramHandler.value(this);
      }

      if (
        paramType &&
        paramType.name &&
        !this.isTypePrimitive(paramType.name)
      ) {
        return this.get(paramType);
      }

      return undefined;
    });
  }

  private isTypePrimitive(param: string): boolean {
    return (
      ['string', 'boolean', 'number', 'object'].indexOf(param.toLowerCase()) !==
      -1
    );
  }

  private applyPropertyHandlers(
    target: Function,
    instance: { [key: string]: any },
  ) {
    Container.handlers.forEach((handler) => {
      if (typeof handler.index === 'number') {
        return;
      }
      if (
        handler.object.constructor !== target &&
        !(target.prototype instanceof handler.object.constructor)
      ) {
        return;
      }
      instance[handler.propertyName] = handler.value(this);
    });
  }
}
