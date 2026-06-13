import Constants from 'expo-constants';

const getBackendUrl = () => {
  // Constants.expoConfig.hostUri gives IP:port of the packager server
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:5000/api`;
  }
  return 'http://localhost:5000/api';
};

export const API_URL = getBackendUrl();
