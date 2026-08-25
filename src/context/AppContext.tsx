import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, ReactNode } from 'react';
import { AppState, Student, User, DashboardData } from '../types';
import { generateId } from '../utils/storage';
import apiService from '../services/api';

type AppAction =
  | { type: 'LOGIN_SUCCESS'; payload: { tokens: { access: string; refresh: string; role?: string }; user?: User } }
  | { type: 'LOGOUT' }
  | { type: 'LOAD_DATA'; payload: Partial<AppState> }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'ADD_STUDENT'; payload: Omit<Student, 'id' | 'createdAt'> }
  | { type: 'UPDATE_STUDENT'; payload: Student }
  | { type: 'DELETE_STUDENT'; payload: string };

const initialState: AppState = {
  isAuthenticated: false,
  students: [],
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  updateUser: (user: User) => void;
} | undefined>(undefined);

function appReducer(state: AppState, action: AppAction): AppState {
  if (!action) {
    return state;
  }

  switch (action.type) {
    case 'LOGIN_SUCCESS':
      if (!action.payload) return state;
      return { 
        ...state, 
        isAuthenticated: true,
        user: action.payload.user || state.user
      };

    case 'LOGOUT':
      // Clear session storage
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      sessionStorage.removeItem('user_role');
      return { ...initialState };

    case 'LOAD_DATA':
      if (!action.payload) return state;
      return { ...state, ...action.payload };

    case 'UPDATE_USER':
      if (!action.payload) return state;
      return {
        ...state,
        user: action.payload
      };

    case 'ADD_STUDENT': {
      if (!action.payload) return state;
      const newStudent: Student = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date().toISOString()
      };
      return { ...state, students: [...state.students, newStudent] };
    }

    case 'UPDATE_STUDENT':
      if (!action.payload) return state;
      return {
        ...state,
        students: state.students.map(student =>
          student.id === action.payload.id ? action.payload : student
        )
      };

    case 'DELETE_STUDENT':
      return {
        ...state,
        students: state.students.map(student =>
          student.id === action.payload ? { ...student, isDeleted: true } : student
        )
      };

    default:
      return state;
  }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const updateUser = useCallback((user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  }, []);

  // Token + floor-leader ruxsatini tekshir (localStorage mock yo‘q)
  useEffect(() => {
    const accessToken = sessionStorage.getItem('access_token');
    if (!accessToken) return;

    let cancelled = false;
    (async () => {
      try {
        const dashboardData = (await apiService.getDashboardData()) as DashboardData;
        if (cancelled) return;
        dispatch({
          type: 'LOAD_DATA',
          payload: { isAuthenticated: true, dashboardData },
        });
      } catch {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('user_role');
        if (!cancelled) {
          dispatch({ type: 'LOGOUT' });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Talabalar faqat API dan
  useEffect(() => {
    if (!state.isAuthenticated) return;

    let cancelled = false;
    (async () => {
      try {
        const studentsData = await apiService.getAllStudents();
        if (cancelled) return;

        const students: Student[] = studentsData.map((raw) => {
          const s = raw as {
            id?: number | string;
            first_name?: string;
            name?: string;
            last_name?: string;
            room_name?: string;
            room?: number | string | { id?: number; name?: string };
            phone?: string;
            accepted_date?: string;
            created_at?: string;
          };
          return {
            id: s.id?.toString() || generateId(),
            name: s.name || s.first_name || '',
            lastName: s.last_name || '',
            room:
              s.room_name ||
              (typeof s.room === 'object' && s.room
                ? s.room.name || String(s.room.id || '')
                : s.room?.toString() || '') ||
              '',
            phone: s.phone || '',
            createdAt: s.accepted_date || s.created_at || new Date().toISOString(),
            isDeleted: false,
          };
        });

        dispatch({ type: 'LOAD_DATA', payload: { students } });
      } catch {
        /* 403/role — jimgina */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state.isAuthenticated]);

  const value = useMemo(() => ({ state, dispatch, updateUser }), [state, updateUser]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
