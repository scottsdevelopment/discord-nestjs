import { Injectable } from '@nestjs/common';
import { ReflectMetadataProvider } from '../provider/reflect-metadata.provider';
import { DiscordParamList } from './interface/discord-param-list';
import { DecoratorParamType } from '../constant/decorator-param-type';
import { DecoratorTypeArg } from './interface/decorator-type-arg';
import { ApplyPropertyOption } from './interface/apply-property-option';
import { MethodResolveOptions } from './interface/method-resolve-options';
import { MethodResolver } from './interface/method-resolver';
import { group } from 'console';

@Injectable()
export class ParamResolver implements MethodResolver {
  private readonly params: DiscordParamList[] = [];

  constructor(private readonly metadataProvider: ReflectMetadataProvider) {}

  resolve(options: MethodResolveOptions): void {
    const { instance, methodName } = options;
    const contentMetadata = this.metadataProvider.getContentDecoratorMetadata(
      instance,
      methodName,
    );

    const contextMetadata = this.metadataProvider.getContextDecoratorMetadata(
      instance,
      methodName,
    );

    const groupsMetadata = this.metadataProvider.getGroupsDecoratorMetadata(
      instance,
      methodName,
    );

    if (!contentMetadata && !contextMetadata && !groupsMetadata) {
      return;
    }
    const paramsTypes = this.metadataProvider.getParamTypesMetadata(
      instance,
      methodName,
    );
    if (!paramsTypes) {
      return;
    }
    const paramItem: DiscordParamList = {
      instance,
      methodName,
      args: [],
    };
    if (contentMetadata) {
      paramItem.args[contentMetadata.parameterIndex] = {
        decoratorType: DecoratorParamType.CONTENT,
        paramType: paramsTypes[contentMetadata.parameterIndex],
      };
    }
    if (contextMetadata) {
      paramItem.args[contextMetadata.parameterIndex] = {
        decoratorType: DecoratorParamType.CONTEXT,
      };
    }
    if (groupsMetadata) {
      paramItem.args[groupsMetadata.parameterIndex] = {
        decoratorType: DecoratorParamType.GROUPS,
      };
    }
    this.params.push(paramItem);
  }

  applyParam(options: ApplyPropertyOption): any[] {
    const { instance, methodName, content, context, groups } = options;
    const paramsList = this.params.find(
      (item: DiscordParamList) =>
        item.instance === instance && item.methodName === methodName,
    );
    if (!paramsList) {
      return;
    }
    return paramsList.args.map((arg: DecoratorTypeArg) => {
      switch (arg.decoratorType) {
        case DecoratorParamType.CONTENT:
          return content;
        case DecoratorParamType.CONTEXT:
          return context;
        case DecoratorParamType.GROUPS:
          return groups;
      }
    });
  }

  getContentType(options: MethodResolveOptions): any {
    const { instance, methodName } = options;
    const paramsList = this.params.find(
      (item: DiscordParamList) =>
        item.instance === instance && item.methodName === methodName,
    );
    if (!paramsList) {
      return;
    }
    return paramsList.args.find(
      (item: DecoratorTypeArg) =>
        item.decoratorType === DecoratorParamType.CONTENT,
    )?.paramType;
  }
}
