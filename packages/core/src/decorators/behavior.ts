import { ReflectDecorator } from '../helpers/reflect.decorator';

export function Behavior(options?: { init?: boolean }): Function {
  return ReflectDecorator(options, { type: 'behavior' });
}
