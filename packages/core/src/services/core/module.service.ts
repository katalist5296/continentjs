import { of } from 'rxjs';
import { Container } from '../../container';
import { Service } from '../../decorators/service';
import { LazyFactory } from '../utils/lazy-factory.service';
import { Injector } from '../../decorators/injector';
import { ModuleValidators } from '../utils/validators';
import {
  constructorWatcherService,
  ConstructorWatcherService
} from '../utils/constructor-watcher.service';
import { BehaviorsService } from './behaviors.service';
import { ServicesService } from './services.service';
import { CacheLayer, CacheLayerItem } from '../cache';
import { ReflectDecorator } from '../../helpers/reflect.decorator';
import {ServiceArgumentsInternal} from "../../decorators/interfaces/service-arguments";

@Service()
export class ModuleService {
  public watcherService: ConstructorWatcherService = constructorWatcherService;

  @Injector(LazyFactory) private lazyFactoryService: LazyFactory;
  @Injector(BehaviorsService) private behaviorsService: BehaviorsService;
  @Injector(ModuleValidators) private validators: ModuleValidators;
  @Injector(ServicesService) private servicesService: ServicesService;

  setServices(
    services: ServiceArgumentsInternal[],
    original: ServiceArgumentsInternal,
    currentModule: CacheLayer<CacheLayerItem<Function>>
  ) {
    services.forEach(service => {
      this.validators.validateServices(service, original);

      this.setInjectedDependencies(service);

      if (service.provide && service.provide.constructor === Function) {
        service.provide = service.provide['name'];
      }

      if (service.provide && service.useFactory) {
        this.setUseFactory(service);
      } else if (
        service.provide &&
        service.useClass &&
        service.useClass.constructor === Function
      ) {
        this.setUseClass(service);
      } else if (service.provide && service.useValue) {
        this.setUseValue(service);
      } else {
        currentModule.putItem({ data: <any>service, key: service.name });
        this.servicesService.register(service);
      }
    });
  }


  setBehaviors(
    components: Function[],
    original: ServiceArgumentsInternal,
    currentModule: CacheLayer<CacheLayerItem<Function>>
  ) {
    components.forEach(component => {
      if (!component['metadata']) {
        ReflectDecorator({}, { type: 'behavior' })(component);
      }
      this.validators.validateBehavior(component, original);
      currentModule.putItem({
        data: component,
        key: component.name
      });
      this.behaviorsService.register(component);
    });
  }

  setImports(imports: Function[], original: ServiceArgumentsInternal) {
    imports.forEach((m: any) => {
      this.validators.validateImports(m, original);
      if (!m) {
        throw new Error('Missing import module');
      } else {
        Container.get(m);
      }
    });
  }

  setInjectedDependencies(service) {
    service.deps = service.deps || [];
    if (service.deps.length) {
      service.deps = service.deps.map(dep => Container.get(dep));
    }
  }

  setUseValue(service) {
    Container.set(service.provide, service.useValue);
    if (service.lazy) {
      this.lazyFactoryService.setLazyFactory(
        service.provide,
        of(Container.get(service.provide))
      );
    }
  }

  setUseClass(service) {
    if (service.lazy) {
      this.lazyFactoryService.setLazyFactory(
        service.provide,
        of(Container.get(service.useClass))
      );
    } else {
      Container.set(service.provide, Container.get(service.useClass));
    }
  }

  setUseFactory(service) {
    const factory = service.useFactory;
    service.useFactory = () => factory(...service.deps);
    if (service.lazy) {
      this.lazyFactoryService.setLazyFactory(
        service.provide,
        service.useFactory()
      );
    } else {
      Container.set(service.provide, service.useFactory());
    }
  }
}
