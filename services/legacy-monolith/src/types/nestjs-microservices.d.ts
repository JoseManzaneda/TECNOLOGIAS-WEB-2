declare module '@nestjs/microservices' {
  export const ClientsModule: any;
  export enum Transport {
    TCP = 'TCP',
    REDIS = 'REDIS',
    NATS = 'NATS',
    MQTT = 'MQTT',
    GRPC = 'GRPC',
    RMQ = 'RMQ',
    KAFKA = 'KAFKA'
  }
  export type ClientProxy = any;
  export function EventPattern(pattern: string | string[]): MethodDecorator;
  export function Payload(property?: string): ParameterDecorator;
}
