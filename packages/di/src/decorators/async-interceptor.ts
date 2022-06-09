import {createMethodDecorator} from "@continentjs/metadata";

export function AsyncInterceptor() {
  return createMethodDecorator(AsyncInterceptor, {});
}
