import { io, Socket } from "socket.io-client";

class SocketManager {
    private socket: Socket | null = null;
    private serverUrl: string;

    constructor() {
        this.serverUrl =
            process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";
    }

    connect() {
        if (this.socket?.connected) {
            return this.socket;
        }

        console.log("Connecting to server:", this.serverUrl);
        this.socket = io(this.serverUrl, {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        this.socket.on("connect", () => {
            console.log("✓ Connected to server");
        });

        this.socket.on("disconnect", (reason) => {
            console.log("✗ Disconnected from server:", reason);
        });

        this.socket.on("connect_error", (error) => {
            console.error("Connection error:", error);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    emit(event: string, data?: unknown) {
        if (!this.socket) {
            console.error("Socket not connected");
            return;
        }
        this.socket.emit(event, data);
    }

    on(event: string, callback: (data: unknown) => void) {
        if (!this.socket) {
            console.error("Socket not connected");
            return;
        }
        this.socket.on(event, callback);
    }

    off(event: string, callback?: (data: unknown) => void) {
        if (!this.socket) {
            return;
        }
        this.socket.off(event, callback);
    }

    getConnectionStatus(): "connected" | "disconnected" | "connecting" {
        if (!this.socket) return "disconnected";
        if (this.socket.connected) return "connected";
        return "connecting";
    }
}

export const socketManager = new SocketManager();
