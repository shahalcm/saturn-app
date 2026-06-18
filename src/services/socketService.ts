import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

let socket: Socket | null = null;

export const connectSocket = async (userId: string): Promise<Socket | null> => {
  if (socket) return socket;

  const token = await AsyncStorage.getItem('authToken');

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('Seeker socket connected');
    socket?.emit('join', userId);
  });

  socket.on('disconnect', () => {
    console.log('Seeker socket disconnected');
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
