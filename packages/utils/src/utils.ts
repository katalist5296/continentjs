function _isNumber(value): boolean {
  return typeof value === "number";
}

const UUID_RGX = /[xy]/g;

export function uuid(): string {
  let d = new Date().getTime();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(UUID_RGX, function (c) {
    let r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == "x" ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

export function isNull(value): boolean {
  return value === null;
}

export function isBoolean(value): boolean {
  return typeof value === "boolean";
}

export function isUndefined(value): boolean {
  return typeof value === "undefined";
}

export function isDefined(value): boolean {
  return !isNull(value) && !isUndefined(value);
}

export function isSymbol(value): boolean {
  return typeof value === "symbol" || isObject(value) && Object.prototype.toString.call(value) === "[object Symbol]";
}

export function isString(value): boolean {
  return typeof value === "string";
}

export function isNumber(value): boolean {
  return _isNumber(value) && !isNaN(value);
}

export function isArray(value): boolean {
  return Array.isArray(value);
}

export function inArray(arr: Array<any>, token: any): boolean {
  return isArray(arr) && arr.indexOf(token) > -1;
}

export function isFunction(value): boolean {
  return typeof value === "function";
}

export function isDate(value): boolean {
  return Object.prototype.toString.call(value) === "[object Date]";
}

export function isRegExp(value): boolean {
  return Object.prototype.toString.call(value) === "[object RegExp]";
}

export function isObject(value): boolean {
  return !isNull(value) && typeof value === "object";
}

export function isFalsy(value): boolean {
  return isNull(value) || isUndefined(value) || value === "" || value === false || value === 0 || (_isNumber(value) && isNaN(value));
}

export function isTruthy(value): boolean {
  return !isFalsy(value);
}

const CLASS_RGX = /^\s*class\s+/;

export function isClass(value): boolean {
  return isFunction(value) && CLASS_RGX.test(value.toString());
}

export function isEqual(a, b): boolean {
  if (isSymbol(a) || isSymbol(b)) {
    return false;
  } else if (_isNumber(a) || _isNumber(b)) {
    return (isNaN(a) || isNaN(b)) ? isNaN(a) === isNaN(b) : a === b;
  } else if (isDate(a) && isDate(b)) {
    return a.toISOString() === b.toISOString();
  } else if (isRegExp(a) && isRegExp(b)) {
    return a.source === b.source;
  }
  if (a === b) {
    return true;
  } else if (isArray(a) && isArray(b)) {
    return a.every((item, index) => {
      if (isDefined(b[index])) {
        return (a === item && b === b[index]) || isEqual(item, b[index]);
      }
      return false;
    });
  } else if (isObject(a) && !isArray(a) && isObject(b) && !isArray(b)) {
    return Object.keys(a).every(key => (a === a[key] && b === b[key]) || isEqual(a[key], b[key]));
  }
  return false;
}

export function flatten(value: Array<any>): Array<any> {
  return isArray(value) ? value.reduce((acc, cur) => acc.concat(isArray(cur) ? flatten(<Array<any>>cur) : cur), []) : [];
}
