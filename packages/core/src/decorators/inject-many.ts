import { Container } from '../container/Container';
import { Token } from '../container/Token';
import { getIdentifier } from '../helpers/get-identifier';
import { TypeOrName } from '../container/types/type-or-name';

export function InjectMany(type?: (type?: any) => Function): Function;
export function InjectMany(serviceName?: string): Function;
export function InjectMany(token: Token<any>): Function;

export function InjectMany(
  typeOrName?: TypeOrName
): Function {
  return function(target: Object, propertyName: string, index?: number) {
    if (!typeOrName) {
      typeOrName = () =>
        (Reflect as any).getMetadata('design:type', target, propertyName);
    }
    Container.registerHandler({
      object: target,
      propertyName: propertyName,
      index: index,
      value: instance =>
        instance.getMany(getIdentifier(typeOrName, target, propertyName))
    });
  };
}
