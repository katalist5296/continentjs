import {
  IProvider,
  Interceptor,
  MethodConstructor,
  InterceptorProcessor,
  InterceptorHandler,
  Method
} from "../interfaces";
import {createMethodDecorator, hasDecorator, IMetadata} from "@continentjs/metadata";
import {isClass, isUndefined} from "@continentjs/utils";
import {verifyProvider} from "./provider";
import {Injector, SyncInjector} from "../injector";
import {AsyncInterceptor} from "../decorators";

export function createMethodInterceptor(decorator: Function, Class: MethodConstructor, args: object) {
  SyncInjector.__interceptors__.add(decorator);
  return createMethodDecorator(decorator, {Class, args});
}

function createInterceptorHandler(
  interceptors: Map<string | symbol, InterceptorProcessor>,
  interceptor: Interceptor,
  metadata: IMetadata,
  provider: IProvider,
  instance: object
): void {
  const propertyKey = metadata.propertyKey;
  const isAsync = hasDecorator(AsyncInterceptor, provider.useClass.prototype, <string>metadata.propertyKey);
  const interceptorHandler: InterceptorHandler = {
    handler: interceptor,
    args: metadata.args.args
  };
  if (interceptors.has(propertyKey)) {
    const mapItem = interceptors.get(propertyKey);
    mapItem.interceptors.push(interceptorHandler);
    interceptors.set(propertyKey, mapItem);
  } else {
    interceptors.set(propertyKey, {
      handler: Reflect.get(instance, propertyKey).bind(instance),
      isAsync,
      interceptors: [interceptorHandler]
    });
  }
}

export function createInterceptorHandlers(
  provider: IProvider,
  injector: Injector | SyncInjector
): Map<string | symbol, InterceptorProcessor> {
  const metadata = SyncInjector.getAllMetadataForTarget(provider);
  const values = metadata.filter(item =>
    SyncInjector.__interceptors__.has(item.decorator) && item.type === "method" && isClass(item.args?.Class)
  );
  const instance = injector.get(provider.provide);
  const interceptors = new Map<string | symbol, InterceptorProcessor>();
  for (const item of values) {
    const handlerProvider = verifyProvider(item.args.Class);
    const interceptor: Interceptor = injector.createAndResolve(
      handlerProvider,
      SyncInjector.getProviders(<IProvider>handlerProvider)
    );
    createInterceptorHandler(interceptors, interceptor, item, provider, instance);
  }
  return interceptors;
}

export async function createInterceptorHandlersAsync(
  provider: IProvider,
  injector: Injector | SyncInjector
): Promise<Map<string | symbol, InterceptorProcessor>> {
  const metadata = SyncInjector.getAllMetadataForTarget(provider);
  const values = metadata.filter(item =>
    SyncInjector.__interceptors__.has(item.decorator) && item.type === "method" && isClass(item.args?.Class)
  );
  const instance = injector.get(provider.provide);
  const interceptors = new Map<string | symbol, InterceptorProcessor>();
  for (const item of values) {
    const handlerProvider = verifyProvider(item.args.Class);
    const interceptor: Interceptor = await injector.createAndResolve(
      handlerProvider,
      SyncInjector.getProviders(<IProvider>handlerProvider)
    );
    createInterceptorHandler(interceptors, interceptor, item, provider, instance);
  }
  return interceptors;
}

const ASYNC = /^async[\s\S]+invoke|\.then\([\s\S]+\)/;

class Executor {
  private result: any;
  private steps: Array<Function> = [];

  constructor(private args: any[], private handler: (...handlerArgs: any[]) => any, private isAsync: boolean) {
    if (!isAsync) {
      this.isAsync = ASYNC.test(handler.toString());
    }
  }

  addInterceptor(interceptor: Interceptor, method: InterceptedMethod) {
    if (!this.isAsync) {
      this.isAsync = ASYNC.test(interceptor.invoke.toString());
    }
    this.steps.push(() => interceptor.invoke(method));
  }

  execute(): any {
    if (this.isAsync) {
      return this.doAsync();
    }
    return this.doSync();
  }

  transform(data: any): any {
    if (this.isAsync) {
      this.result = Promise.resolve(data);
    } else {
      this.result = data;
    }
    return this.result;
  }

  overrideArgs(...args: any[]) {
    this.args = args;
  }

  invoke(): any {
    if (isUndefined(this.result)) {
      this.result = this.handler(...this.args);
    }
    return this.result;
  }

  private doSync() {
    for (const step of this.steps) {
      step();
    }
    return this.invoke();
  }

  private async doAsync(): Promise<any> {
    for (const step of this.steps) {
      await step();
    }
    return await this.invoke();
  }
}


class InterceptedMethod implements Method {

  readonly injector: Injector | SyncInjector;
  readonly decoratorArgs: any;
  readonly methodArgs: any;

  constructor(
    injector: Injector | SyncInjector,
    methodArgs: any,
    decoratorArgs: any,
    private container: Executor
  ) {
    this.injector = injector;
    this.decoratorArgs = decoratorArgs;
    this.methodArgs = methodArgs;
  }

  invoke(): any {
    return this.container.invoke();
  }

  transform(data: any): any {
    return this.container.transform(data);
  }

  invokeWithArgs(...args: []): any {
    this.container.overrideArgs(...args);
    return this.container.invoke();
  }
}

function applyInterceptors(
  interceptors: Map<string | symbol, InterceptorProcessor>,
  provider: IProvider,
  injector: Injector | SyncInjector
) {
  const instance = injector.get(provider.provide);
  for (const [key, value] of interceptors.entries()) {
    const interceptor = (...methodArgs: any[]) => {
      const container = new Executor(methodArgs, (...handlerArgs: any[]) => value.handler(...handlerArgs), value.isAsync);
      for (const item of value.interceptors) {
        const method = new InterceptedMethod(
          injector,
          methodArgs,
          item.args,
          container
        );
        container.addInterceptor(item.handler, method);
      }
      return container.execute();
    };
    Reflect.defineProperty(instance, key, {
      value: interceptor,
      writable: false
    });
  }
}

export function createInterceptors(provider: IProvider, injector: Injector | SyncInjector): Map<string | symbol, InterceptorProcessor> {
  const interceptors = createInterceptorHandlers(provider, injector);
  applyInterceptors(interceptors, provider, injector);
  return interceptors;
}

export async function createInterceptorsAsync(
  provider: IProvider,
  injector: Injector | SyncInjector
): Promise<Map<string | symbol, InterceptorProcessor>> {
  const interceptors = await createInterceptorHandlersAsync(provider, injector);
  applyInterceptors(interceptors, provider, injector);
  return interceptors;
}
