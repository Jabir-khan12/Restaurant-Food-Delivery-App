import { io } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth.store';

let socket = null;

export function getSocket() {
  if (!socket) {
    const url = import.meta.env.VITE_WS_URL || window.location.origin;

    socket = io(url, {
      autoConnect: false,
      withCredentials: true,
      auth: (cb) => {
        cb({ token: useAuthStore.getState().accessToken });
      },
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  if (!s.connected) s.connect();
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}
