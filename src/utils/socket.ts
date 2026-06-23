import { io, Socket } from 'socket.io-client';
import API_BASE_URL from './api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE_URL.replace(/\/api$/, '');

let socketInstance: Socket | null = null;

export function getSocket() {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket'],
      withCredentials: true,
      auth: {
        token: localStorage.getItem('busgoToken') || '',
      },
    });
  }

  return socketInstance;
}

export function syncSocketAuth() {
  const socket = getSocket();
  socket.auth = {
    token: localStorage.getItem('busgoToken') || '',
  };

  if (socket.connected) {
    socket.disconnect();
  }

  return socket;
}
