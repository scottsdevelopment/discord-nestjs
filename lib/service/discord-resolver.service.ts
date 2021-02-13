import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { GuardResolver } from '../resolver/guard.resolver';
import { OnCommandResolver } from '../resolver/on-command.resolver';
import { IsObject } from '../util/function/is-object';
import { PipeResolver } from '../resolver/pipe.resolver';
import { MiddlewareResolver } from '../resolver/middleware.resolver';
import { ParamResolver } from '../resolver/param.resolver';
import { OnMessageResolver } from '../resolver/on-message.resolver';
import { OnceMessageResolver } from '../resolver/once-message.resolver';

@Injectable()
export class DiscordResolverService implements OnApplicationBootstrap {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly guardResolver: GuardResolver,
    private readonly metadataScanner: MetadataScanner,
    private readonly onCommandResolver: OnCommandResolver,
    private readonly pipeResolver: PipeResolver,
    private readonly middlewareResolver: MiddlewareResolver,
    private readonly paramResolver: ParamResolver,
    private readonly onMessageResolver: OnMessageResolver,
    private readonly onceMessageResolver: OnceMessageResolver,
  ) {
  }

  async onApplicationBootstrap(): Promise<void> {
    const providers: InstanceWrapper[] = this.discoveryService.getProviders();
    const controllers: InstanceWrapper[] = this.discoveryService.getControllers();
    await this.resolveDecorators(providers, controllers);
  }

  private async resolveDecorators(providers: InstanceWrapper[], controllers: InstanceWrapper[]) {
    return Promise.all(providers.concat(controllers).map((instanceWrapper: InstanceWrapper) => {
      const { instance } = instanceWrapper;
      if (!instance || !IsObject(instance)) {
        return;
      }
      const methodNames = this.scanMetadata(instance);
      return Promise.all(methodNames.map(async (methodName: string) => {
        this.middlewareResolver.resolve({
          instance,
        });
        await this.guardResolver.resolve({
          instance,
          methodName,
        });
        this.onMessageResolver.resolve({
          instance,
          methodName,
        });
        this.onceMessageResolver.resolve({
          instance,
          methodName,
        });
        this.onCommandResolver.resolve({
          instance,
          methodName,
        });
        await this.pipeResolver.resolve({
          instance,
          methodName,
        });
        await this.paramResolver.resolve({
          instance,
          methodName,
        });
      }));
    }));
  }

  private scanMetadata(
    instance: any,
  ): string[] {
    return this.metadataScanner.scanFromPrototype(
      instance,
      Object.getPrototypeOf(instance),
      (methodName: string) => methodName,
    );
  }
}