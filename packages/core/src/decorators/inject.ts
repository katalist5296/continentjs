import { Container } from '../container/Container';
import { Token } from '../container/Token';
import { getIdentifier } from '../helpers/get-identifier';
import { TypeOrName } from '../container/types/type-or-name';

export function Inject(type?: (type?: any) => Function): Function;
export function Inject(serviceName?: string): Function;
export function Inject(token: Token<any>): Function;
export function Inject(fn: Function): Function;

export function Inject(typeOrName?: TypeOrName): Function {
    return function (target: Object, propertyName: string, index?: number) {
        if (!typeOrName)
            typeOrName = () => (Reflect as any).getMetadata('design:type', target, propertyName);

        Container.registerHandler({
            object: target,
            propertyName: propertyName,
            index: index,
            value: instance => instance.get(getIdentifier(typeOrName, target, propertyName))
        });
    };
}
