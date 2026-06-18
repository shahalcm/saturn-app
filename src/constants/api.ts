import Constants from 'expo-constants';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.saturnprovider.com/api';
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'https://api.saturnprovider.com';
export const AGORA_APP_ID = process.env.EXPO_PUBLIC_AGORA_APP_ID || '';

console.log('[Seeker Runtime Config] EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
console.log('[Seeker Runtime Config] API_URL resolved to:', API_URL);
console.log('[Seeker Runtime Config] EXPO_PUBLIC_SOCKET_URL:', process.env.EXPO_PUBLIC_SOCKET_URL);
console.log('[Seeker Runtime Config] SOCKET_URL resolved to:', SOCKET_URL);

