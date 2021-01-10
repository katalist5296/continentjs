import { Handler } from './types/Handler';
import { ContainerInstance } from './ContainerInstance';
import { ObjectType } from './types/ObjectType';
import { Token } from './Token';
import { ServiceMetadata } from './types/ServiceMetadata';
import { Container } from './Container';
import { ServiceIdentifier } from './types/ServiceIdentifier';

export interface ObservableContainer {

  readonly handlers: Map<Handler, Handler>;
  of(instanceId: any): ContainerInstance;

  has<T>(type: ObjectType<T>): boolean;
  has<T>(id: string): boolean;
  has<T>(id: Token<T>): boolean;

  get<T>(type: ObjectType<T>): T;
  get<T>(id: string): T;
  get<T>(id: Token<T>): T;
  get<T>(service: { service: T }): T;

  getMany<T>(id: string): T[];
  getMany<T>(id: Token<T>): T[];

  set<T, K extends keyof T>(service: ServiceMetadata<T, K>): Container;
  set(type: Function, value: any): Container;
  set(name: string, value: any): Container;
  set(token: Token<any>, value: any): Container;
  set<T, K extends keyof T>(values: ServiceMetadata<T, K>[]): Container;

  remove(...ids: ServiceIdentifier[]): Container;

  reset(containerId?: any): Container;

  registerHandler(handler: Handler): Container;

  import(services: Function[]): Container;
}
