import { InjectionToken } from '../../container/Token';
import { Metadata } from './metadata';

export interface ServiceArguments {
  name?: string;
  provide: string | InjectionToken<any> | Function;
  useValue?: any;
  useFactory?: Function;
  useClass?: any;
  metadata?: Metadata;
  useDynamic?: any;
  deps?: Array<Function | InjectionToken<any>>;
  lazy?: boolean;
}

export interface ServiceArgumentsInternal {
  name?: string;
  provide: Function | string | InjectionToken<any>;
  useValue?: any;
  useFactory?: Function;
  useClass?: any;
  metadata?: Metadata;
  useDynamic?: any;
  deps?: Array<Function | string | InjectionToken<any>>;
  lazy?: boolean;
  originalName?: string;
  forRoot?: any;
}
