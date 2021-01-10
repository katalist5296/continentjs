import { Service } from '../../decorators/service';
import {DecoratorType} from "../../decorators/types/decorator";
import {ServiceArgumentsInternal} from "../../decorators/interfaces/service-arguments";

@Service()
export class ModuleValidators {
  validateEmpty(m, original: ServiceArgumentsInternal, type: DecoratorType) {
    if (!m) {
      const requiredType = type.charAt(0).toUpperCase() + type.slice(1);
      throw new Error(`
            ${original.metadata.raw}
            -> @Module: ${original.metadata.moduleName}
            -> @Module hash: ${original.metadata.moduleHash}
                --> Maybe you forgot to import some ${requiredType} inside ${
        original.metadata.moduleName
      } ?

                Hint: run ts-lint again, looks like imported ${requiredType} is undefined or null inside ${
        original.metadata.moduleName
      }
            `);
    }
  }

  genericWrongPluggableError(
    m,
    original: ServiceArgumentsInternal,
    type: DecoratorType
  ) {
    if (m.metadata.type !== type) {
      const moduleType =
        m.metadata.type.charAt(0).toUpperCase() + m.metadata.type.slice(1);
      const requiredType = type.charAt(0).toUpperCase() + type.slice(1);
      throw new Error(`
            ${original.metadata.raw}
            -> @Module: '${original.metadata.moduleName}'
            -> @Module hash: '${original.metadata.moduleHash}'
                --> @${moduleType} '${
        m.metadata.moduleName
      }' provided, where expected class decorated with '@${requiredType}' instead,
            -> @Hint: please provide class with @Service decorator or remove ${
              m.metadata.moduleName
            } class
            `);
    }
  }

  validateImports(m, original: ServiceArgumentsInternal) {
    if (m.metadata.type !== 'module') {
      throw new Error(`
            ${original.metadata.raw}
            -> @Module: '${original.metadata.moduleName}'
            -> @Module hash: '${original.metadata.moduleHash}'
                --> @${m.metadata.type.charAt(0).toUpperCase() +
                  m.metadata.type.slice(1)} '${
        m.originalName
      }' provided, where expected class decorated with '@Module' instead,
            -> @Hint: please provide class with @Module decorator or remove ${
              m.originalName
            } from imports
            `);
    }
  }

  validateServices(m, original: ServiceArgumentsInternal) {
    this.validateEmpty(m, original, 'service');
    if (m.provide) {
      return;
    }
    this.genericWrongPluggableError(m, original, 'service');
  }

  validateBehavior(m, original: ServiceArgumentsInternal) {
    this.validateEmpty(m, original, 'behavior');
    if (m.provide) {
      return;
    }
    this.genericWrongPluggableError(m, original, 'behavior');
  }
}
