import { ObjectType } from './ObjectType';
import { Token } from '../Token';

export interface ServiceOptions<T, K extends keyof T> {
  global?: boolean;
  init?: boolean;
  transient?: boolean;
  multiple?: boolean;
  id?: string | Token<any>;
  factory?: [ObjectType<T>, K] | ((...params: any[]) => any);
}
