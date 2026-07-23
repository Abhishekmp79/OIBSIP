/**
 * Socket.IO client.
 *
 * Connects to the same origin the app is served from (Vite proxies /socket.io
 * to the backend in dev). Falls back to VITE_API_URL if set.
 */
import { io } from 'socket.io-client';

const BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || undefined;

export const socket = io(BASE || '/', {
  autoConnect: true,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1500,
});

socket.on('connect', () => console.log('[IO] connected', socket.id));
socket.on('disconnect', () => console.log('[IO] disconnected'));
socket.on('connect_error', (err) => console.warn('[IO] connect error', err.message));
