import { ObjectType } from './ObjectType';
import { Token } from '../Token';

export interface ServiceMetadata<T, K extends keyof T> {
  type?: Function;
  global?: boolean;
  transient?: boolean;
  multiple?: boolean;
  id?: Token<any> | string | Function;
  factory?: [ObjectType<T>, K] | ((...params: any[]) => any);
  value?: any;
}
