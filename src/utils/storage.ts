import { AppState } from '../types';

const STORAGE_KEY = 'floor-warden-app';

export const loadFromStorage = (): Partial<AppState> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading from storage:', error);
    return {};
  }
};

export const saveToStorage = (state: Partial<AppState>): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving to storage:', error);
  }
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const months = [
    'Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun',
    'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  const months = [
    'Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun',
    'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
};