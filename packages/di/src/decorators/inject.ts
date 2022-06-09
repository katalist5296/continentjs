import {createParameterAndPropertyDecorator} from "@continentjs/metadata";

export function Inject(token?: Function | string, isMutable = false) {
  return createParameterAndPropertyDecorator(Inject, {token, isMutable});
}
