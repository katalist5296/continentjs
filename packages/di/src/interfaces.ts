import {Injector} from "./injector/injector";
import {SyncInjector} from "./injector/sync-injector";

export interface IProvider {
  provide: any;
  useValue?: any;
  useClass?: Function;
  useFactory?: Function;
  providers?: Array<MixedProvider>;
}

export declare type MixedProvider = Function | IProvider;

export interface Type<T> extends Function {
  new(...args: any[]): T;
}

export interface IAfterConstruct {
  afterConstruct(): void;
}

export interface Method {
  invoke: () => any;
  invokeWithArgs: (...args: any[]) => any;
  transform: (data: any) => any;
  readonly injector: Injector | SyncInjector;
  readonly decoratorArgs: any;
  readonly methodArgs: any;
}

export interface Interceptor {
  invoke(method: Method): any;
}

export interface MethodConstructor {
  new(): Interceptor;
}

export interface InterceptorHandler {
  handler: Interceptor;
  args: any;
}

export interface InterceptorProcessor {
  handler: (...args: any[]) => any;
  isAsync: boolean;
  interceptors: Array<InterceptorHandler>;
}
