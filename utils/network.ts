import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

export const checkInternetConnection = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected === true && state.isInternetReachable === true;
  } catch (error) {
    console.error('Network check failed:', error);
    return false;
  }
};

export const requireInternetConnection = async (): Promise<void> => {
  const isConnected = await checkInternetConnection();
  if (!isConnected) {
    throw new Error(
      Platform.OS === 'web' 
        ? 'Internet connection required. Please check your network connection and try again.'
        : 'Internet connection required for AI features. Please check your network connection and try again.'
    );
  }
};

export const getNetworkType = async (): Promise<string> => {
  try {
    const state = await NetInfo.fetch();
    return state.type || 'unknown';
  } catch (error) {
    console.error('Failed to get network type:', error);
    return 'unknown';
  }
};