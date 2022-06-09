import {createParameterAndPropertyDecorator} from "@continentjs/metadata";
import {IProvider} from "../interfaces";
import {verifyProvider} from "../helpers/provider";

export function CreateProvider(token: Function | IProvider) {
  return createParameterAndPropertyDecorator(CreateProvider, {token: verifyProvider(token)});
}
