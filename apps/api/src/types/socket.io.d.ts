declare module 'socket.io' {
  interface SocketOptions {
    cors?: {
      origin?: string | string[];
      credentials?: boolean;
    };
  }

  class Server {
    constructor(httpServer: unknown, opts?: SocketOptions);
    use(middleware: (socket: any, next: (err?: Error) => void) => void): void;
    on(event: string, callback: (socket: any) => void): void;
  }

  export { Server };
}