import * as net from 'net';
import { ISocketClient, SocketActor, SocketServerEvent } from '../models';

export class SocketClient extends SocketActor implements ISocketClient {
    private socket: net.Socket;

    public connected: () => void = () => {};
    public onClose: () => void = () => {};
    public onError: (err: Error) => void = () => {};
    public onEmit: <T>(event: SocketServerEvent<T>) => void = <T>(event: SocketServerEvent<T>) => {};
    
    constructor() {
        super();
        this.socket = new net.Socket();
    }

    public connect(host: string, port: number) {
        this.socket.connect(port, host, () => {
            this.connected();
        });

        this.socket.on('data', (message: string) => this.handleEvent(message));
        this.socket.on('close', this.handleClose);
        this.socket.on('error', (err) => this.handleError(err));
    }

    private handleEvent<T>(message: string) {
        const messageEvent: SocketServerEvent<T> = JSON.parse(message);
        const registeredEvent = this.events[messageEvent.name];

        if (!registeredEvent) {
            console.error(`Event ${messageEvent.name} not registered`);
            return;
        }

        registeredEvent.handler(messageEvent.data, this.socket);
    };

    private handleClose() {
        console.log('Client disconnected:', this.socket.remoteAddress, this.socket.remotePort);
        this.onClose();
    };

    private handleError(err: Error) {
        console.error('Socket error:', err.message);
        this.onError(err);
    };

    public emit<T>(eventName: string, data: T) {
        const event = {
            name: eventName,
            data
        };

        this.socket.write(JSON.stringify(event));
        this.onEmit(event);
    }
}