import { ContainerInstance } from './ContainerInstance';
import { Token } from './Token';
import { Handler } from './types/Handler';
import { ObjectType } from './types/ObjectType';
import { ServiceIdentifier } from './types/ServiceIdentifier';
import { ServiceMetadata } from './types/ServiceMetadata';

export class Container {
  // -------------------------------------------------------------------------
  // Private Static Properties
  // -------------------------------------------------------------------------
  private static readonly globalInstance: ContainerInstance = new ContainerInstance(
    undefined
  );

  private static readonly instances: Map<string, ContainerInstance> = new Map();
  static readonly handlers: Map<Handler, Handler> = new Map();

  // -------------------------------------------------------------------------
  // Public Static Methods
  // -------------------------------------------------------------------------
  static of(instanceId: any): ContainerInstance {
    if (instanceId === undefined) return this.globalInstance;

    let container = this.instances.get(instanceId);
    if (!container) {
      container = new ContainerInstance(instanceId);
      this.instances.set(instanceId, container);
    }

    return container;
  }

  static has<T>(type: ObjectType<T>): boolean;
  static has<T>(id: string): boolean;
  static has<T>(id: Token<T>): boolean;
  static has<T>(identifier: ServiceIdentifier): boolean {
    return this.globalInstance.has(identifier as any);
  }

  static get<T>(type: ObjectType<T>): T;
  static get<T>(id: string): T;
  static get<T>(id: Token<T>): T;
  static get<T>(service: { service: T }): T;
  static get<T>(identifier: ServiceIdentifier<T>): T {
    return this.globalInstance.get(identifier as any);
  }

  static getMany<T>(id: string): T[];
  static getMany<T>(id: Token<T>): T[];
  static getMany<T>(id: string | Token<T>): T[] {
    return this.globalInstance.getMany(id as any);
  }

  static set<T, K extends keyof T>(service: ServiceMetadata<T, K>): Container;
  static set(type: Function, value: any): Container;
  static set(name: string, value: any): Container;
  static set(token: Token<any>, value: any): Container;
  static set<T, K extends keyof T>(values: ServiceMetadata<T, K>[]): Container;
  static set(
    identifierOrServiceMetadata:
      | ServiceIdentifier
      | ServiceMetadata<any, any>
      | (ServiceMetadata<any, any>[]),
    value?: any
  ): Container {
    this.globalInstance.set(identifierOrServiceMetadata as any, value);
    return this;
  }

  static remove(...ids: ServiceIdentifier[]): Container {
    this.globalInstance.remove(...ids);
    return this;
  }

  static reset(containerId?: any): Container {
    if (containerId) {
      const instance = this.instances.get(containerId);
      if (instance) {
        instance.reset();
        this.instances.delete(containerId);
      }
    } else {
      this.globalInstance.reset();
      Array.from(this.instances.values()).forEach(i => i.reset());
    }
    return this;
  }

  static registerHandler(handler: Handler): Container {
    this.handlers.set(handler, handler);
    return this;
  }

  static import(services: Function[]): Container {
    return this;
  }
}
