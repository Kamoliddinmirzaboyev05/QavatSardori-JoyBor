import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { AppState, Student, AttendanceRecord, Collection, Payment, Announcement, AnnouncementRead, Request } from '../types';
import { loadFromStorage, saveToStorage, generateId } from '../utils/storage';

type AppAction =
  | { type: 'LOGIN_SUCCESS'; payload: { tokens: any } }
  | { type: 'LOGOUT' }
  | { type: 'LOAD_DATA'; payload: Partial<AppState> }
  | { type: 'ADD_STUDENT'; payload: Omit<Student, 'id' | 'createdAt'> }
  | { type: 'UPDATE_STUDENT'; payload: Student }
  | { type: 'DELETE_STUDENT'; payload: string }
  | { type: 'ADD_ATTENDANCE'; payload: Omit<AttendanceRecord, 'id' | 'createdAt'> }
  | { type: 'UPDATE_ATTENDANCE'; payload: AttendanceRecord }
  | { type: 'ADD_COLLECTION'; payload: Omit<Collection, 'id' | 'createdAt'> }
  | { type: 'ADD_PAYMENT'; payload: Omit<Payment, 'id' | 'createdAt'> }
  | { type: 'UPDATE_PAYMENT'; payload: Payment }
  | { type: 'ADD_ANNOUNCEMENT'; payload: Omit<Announcement, 'id' | 'createdAt'> }
  | { type: 'ADD_REQUEST'; payload: Omit<Request, 'id' | 'createdAt'> }
  | { type: 'UPDATE_REQUEST'; payload: Request }
  | { type: 'MARK_ANNOUNCEMENT_READ'; payload: { announcementId: string; studentId: string } };

const initialState: AppState = {
  isAuthenticated: false,
  students: [],
  attendance: [],
  collections: [],
  payments: [],
  announcements: [],
  announcementReads: [],
  requests: []
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { ...state, isAuthenticated: true };

    case 'LOGOUT':
      // Clear session storage
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      sessionStorage.removeItem('user_role');
      return { ...initialState };

    case 'LOAD_DATA':
      return { ...state, ...action.payload };

    case 'ADD_STUDENT': {
      const newStudent: Student = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date().toISOString()
      };
      return { ...state, students: [...state.students, newStudent] };
    }

    case 'UPDATE_STUDENT':
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

    case 'ADD_ATTENDANCE': {
      const newAttendance: AttendanceRecord = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date().toISOString()
      };
      return { ...state, attendance: [...state.attendance, newAttendance] };
    }

    case 'UPDATE_ATTENDANCE':
      return {
        ...state,
        attendance: state.attendance.map(record =>
          record.id === action.payload.id ? action.payload : record
        )
      };

    case 'ADD_COLLECTION': {
      const newCollection: Collection = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date().toISOString()
      };
      const newPayments: Payment[] = state.students
        .filter(student => !student.isDeleted)
        .map(student => ({
          id: generateId(),
          collectionId: newCollection.id,
          studentId: student.id,
          amount: action.payload.amount,
          isPaid: false,
          createdAt: new Date().toISOString()
        }));

      return {
        ...state,
        collections: [...state.collections, newCollection],
        payments: [...state.payments, ...newPayments]
      };
    }

    case 'ADD_PAYMENT': {
      const newPayment: Payment = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date().toISOString()
      };
      return { ...state, payments: [...state.payments, newPayment] };
    }

    case 'UPDATE_PAYMENT':
      return {
        ...state,
        payments: state.payments.map(payment =>
          payment.id === action.payload.id ? action.payload : payment
        )
      };

    case 'ADD_ANNOUNCEMENT': {
      const newAnnouncement: Announcement = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date().toISOString()
      };
      return { ...state, announcements: [...state.announcements, newAnnouncement] };
    }

    case 'ADD_REQUEST': {
      const newRequest: Request = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date().toISOString()
      };
      return { ...state, requests: [...state.requests, newRequest] };
    }

    case 'UPDATE_REQUEST':
      return {
        ...state,
        requests: state.requests.map(request =>
          request.id === action.payload.id ? { ...action.payload, updatedAt: new Date().toISOString() } : request
        )
      };

    case 'MARK_ANNOUNCEMENT_READ': {
      const existingRead = state.announcementReads.find(
        read => read.announcementId === action.payload.announcementId &&
          read.studentId === action.payload.studentId
      );

      if (existingRead) return state;

      const newRead = {
        id: generateId(),
        announcementId: action.payload.announcementId,
        studentId: action.payload.studentId,
        readAt: new Date().toISOString()
      };

      return {
        ...state,
        announcementReads: [...state.announcementReads, newRead]
      };
    }

    default:
      return state;
  }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load initial data from storage
  useEffect(() => {
    const storedData = loadFromStorage();
    const accessToken = sessionStorage.getItem('access_token');
    const isAuthenticated = !!accessToken;

    if (isAuthenticated) {
      // Load data from storage if authenticated
      dispatch({ type: 'LOAD_DATA', payload: { ...storedData, isAuthenticated } });
    }
  }, []);

  // Save to storage on state changes
  useEffect(() => {
    if (state.isAuthenticated) {
      saveToStorage(state);
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};