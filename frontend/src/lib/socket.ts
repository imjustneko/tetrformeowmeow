import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

function readToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

export function getSocket(): Socket {
  const token = readToken();
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000', {
      auth: { token: token ?? undefined },
      autoConnect: false,
    });
  } else if (token) {
    socket.auth = { token };
  }
  return socket;
}

export function connectSocket(): void {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}

/** Drop cached socket so the next connection uses a fresh token and listeners. */
export function resetSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
