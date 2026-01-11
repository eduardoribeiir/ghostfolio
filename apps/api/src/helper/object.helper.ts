import { Big } from 'big.js';
import jsonpath from 'jsonpath';
import { cloneDeep, isArray, isObject } from 'lodash';

export function hasNotDefinedValuesInObject(aObject: Object): boolean {
  for (const key in aObject) {
    if (aObject[key] === null || aObject[key] === undefined) {
      return true;
    } else if (isObject(aObject[key])) {
      return hasNotDefinedValuesInObject(aObject[key]);
    }
  }

  return false;
}

export function nullifyValuesInObject<T>(aObject: T, keys: string[]): T {
  const object = cloneDeep(aObject);

  if (object) {
    keys.forEach((key) => {
      object[key] = null;
    });
  }

  return object;
}

export function nullifyValuesInObjects<T>(aObjects: T[], keys: string[]): T[] {
  return aObjects.map((object) => {
    return nullifyValuesInObject(object, keys);
  });
}

export function query({
  object,
  pathExpression
}: {
  object: object;
  pathExpression: string;
}) {
  return jsonpath.query(object, pathExpression);
}

export function redactAttributes<T>({
  isFirstRun = true,
  object,
  options
}: {
  isFirstRun?: boolean;
  object: T;
  options: { attribute: string; valueMap: { [key: string]: unknown } }[];
}): T {
  if (!object || !options?.length) {
    return object;
  }

  // Create deep clone
  const redactedObject: any = isFirstRun
    ? JSON.parse(JSON.stringify(object))
    : object;

  for (const option of options) {
    if (Object.prototype.hasOwnProperty.call(redactedObject, option.attribute)) {
      const currentValue = redactedObject[option.attribute];

      if (option.valueMap['*'] !== undefined || option.valueMap['*'] === null) {
        redactedObject[option.attribute] = option.valueMap['*'];
      } else if (option.valueMap[currentValue] !== undefined) {
        redactedObject[option.attribute] =
          option.valueMap[currentValue];
      }
    } else {
      // If the attribute is not present on the current object,
      // check if it exists on any nested objects
      for (const property in redactedObject) {
        const value = redactedObject[property];

        if (isArray(value)) {
          redactedObject[property] = value.map((currentObject) => {
            return redactAttributes({
              options,
              isFirstRun: false,
              object: currentObject
            });
          });
        } else if (
          isObject(value) &&
          !(value instanceof Big)
        ) {
          // Recursively call the function on the nested object
          redactedObject[property] = redactAttributes({
            options,
            isFirstRun: false,
            object: value
          });
        }
      }
    }
  }

  return redactedObject;
}
