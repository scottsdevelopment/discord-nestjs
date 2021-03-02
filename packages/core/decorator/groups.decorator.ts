import { DecoratorConstant } from '../constant/decorator.constant';
import { DecoratorParamType } from '../constant/decorator-param-type';

/**
 * Message content decorator
 */
export const Groups = (): ParameterDecorator => {
  return (
    target: Record<string, any>,
    propertyKey: string,
    parameterIndex: number,
  ): void => {
    Reflect.defineMetadata(
      DecoratorConstant.GROUPS_DECORATOR,
      { parameterIndex, type: DecoratorParamType.GROUPS },
      target,
      propertyKey,
    );
  };
};
