import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
export declare class SocketService {
    private io;
    constructor(server: HTTPServer);
    private setupMiddleware;
    private setupEventHandlers;
    emitToUser(userId: string, event: string, data: any): void;
    emitToVendor(vendorId: string, event: string, data: any): void;
    emitToAll(event: string, data: any): void;
    getIO(): SocketIOServer<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
}
export declare const socketServer: (server: HTTPServer) => SocketService;
export default SocketService;
//# sourceMappingURL=socket.d.ts.map