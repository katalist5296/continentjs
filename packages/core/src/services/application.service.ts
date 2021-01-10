import { of, combineLatest, from, Observable } from 'rxjs';
import { Container } from '../container';
import { LoggerService } from './utils/logger.service';
import { CacheService } from './cache/cache-layer.service';
import { InternalLayers, InternalEvents } from '../helpers/events';
import { LazyFactory } from './utils/lazy-factory.service';
import { ConfigService } from './config/config.service';
import { ConfigModel } from './config/config.model';
import { take, map, switchMap, shareReplay } from 'rxjs/operators';
import { CacheLayer, CacheLayerItem } from './cache/index';
import { BehaviorsService } from './core/behaviors.service';
import { ServicesService } from './core/services.service';
import { Service } from '../decorators/service';
import { ObservableContainer } from '../container/observable-interface';

@Service()
export class ApplicationService {
  private globalConfig: CacheLayer<CacheLayerItem<ConfigModel>>;

  constructor(
    private logger: LoggerService,
    private cacheService: CacheService,
    private lazyFactoriesService: LazyFactory,
    public configService: ConfigService,
    private behaviorsService: BehaviorsService,
    private servicesService: ServicesService,
  ) {
    this.globalConfig = this.cacheService.createLayer<ConfigModel>({
      name: InternalLayers.globalConfig
    });
  }

  public start(app, config?: ConfigModel) {
    this.configService.setConfig(config);
    this.globalConfig.putItem({ key: InternalEvents.config, data: config });

    Container.get(app);

    const lazyFactoryKeys = Array.from(this.lazyFactoriesService.lazyFactories.keys());

    return of<string[]>(lazyFactoryKeys).pipe(
      map(factories => this.prepareAsyncChainables(factories)),
      switchMap(res =>
        combineLatest(res).pipe(
          take(1),
          map(c => this.attachLazyLoadedChainables(lazyFactoryKeys, c)),
          map(() => this.validateSystem()),
          switchMap(() => combineLatest(this.asyncChainableServices())),
          switchMap(() => combineLatest(this.asyncChainableBehaviors())),
          map(() => this.loadApplication()),
          map(() => this.final())
        )
      )
    );
  }

  private final(): ObservableContainer {
    return Container as ObservableContainer;
  }

  private asyncChainableBehaviors() {
    return [
      of(true),
      ...this.behaviorsService
        .getComponents()
        .map(async c => await Container.get(c))
    ];
  }

  private asyncChainableServices() {
    return [
      of(true),
      ...this.servicesService
        .getServices()
        .map(async c => await Container.get(c))
    ];
  }

  private prepareAsyncChainables(injectables: any[]) {
    const asynChainables = [of(true)];
    const injectableLog: {
      [key: string]: { started: number; end: number };
    } = {} as any;
    const getName = n => n.name || n;
    injectables.map(i => {
      const date = Date.now();
      injectableLog[getName(i)] = {
        started: date,
        end: null
      };
      this.logger.log(`Bootstrap -> @Service('${getName(i)}'): loading...`);
      const somethingAsync = from(<Promise<any> | Observable<any>>(
        this.lazyFactoriesService.getLazyFactory(i)
      )).pipe(shareReplay(1));
      asynChainables.push(somethingAsync);
      somethingAsync.subscribe(() => {
        this.logger.log(
          `Bootstrap -> @Service('${getName(
            i
          )}'): loading finished after ${Date.now() -
          injectableLog[getName(i)].started}ms !`
        );
        delete injectableLog[getName(i)];
      });
    });
    return asynChainables;
  }

  private validateSystem() {
    if (this.configService.config.strict) {
      this.cacheService.searchForDuplicateDependenciesInsideApp();
    }
  }

  private attachLazyLoadedChainables(res, chainables) {
    chainables.splice(0, 1);
    let count = 0;
    res.map(name => {
      Container.set(name, chainables[count++]);
    });
    return true;
  }

  loadApplication() {
    Array.from(
      this.cacheService.getLayer<Function>(InternalLayers.modules).map.keys()
    ).forEach(m =>
      this.cacheService.getLayer(m).putItem({
        key: InternalEvents.load,
        data: true
      })
    );
    return true;
  }
}
