import { io, Socket } from "socket.io-client";

const SERVER_URL =
    process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";

class SocketManager {
    private socket: Socket | null = null;

    connect(): Socket {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.socket = io(SERVER_URL, {
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        this.socket.on("connect", () => {
            console.log("Socket connected:", this.socket?.id);
        });

        this.socket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
        });

        this.socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    emit(event: string, data: unknown) {
        if (this.socket?.connected) {
            this.socket.emit(event, data);
        } else {
            console.warn("Socket not connected, cannot emit:", event);
        }
    }

    on(event: string, callback: (data: unknown) => void) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event: string, callback?: (...args: unknown[]) => void) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    get isConnected(): boolean {
        return this.socket?.connected ?? false;
    }
}

export const socketManager = new SocketManager();
