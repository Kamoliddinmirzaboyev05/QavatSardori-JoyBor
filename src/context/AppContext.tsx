import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { AppState, Student, AttendanceRecord, Collection, Payment, Announcement, Request, Role } from '../types';
import { loadFromStorage, saveToStorage, generateId, getCurrentDate } from '../utils/storage';
import { mockStudents, mockCollections, mockAnnouncements, mockRequests } from '../utils/mockData';

type AppAction = 
  | { type: 'SET_ROLE'; payload: Role }
  | { type: 'SET_CURRENT_STUDENT'; payload: string }
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
  role: 'warden',
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
    case 'SET_ROLE':
      return { ...state, role: action.payload };
    
    case 'SET_CURRENT_STUDENT':
      return { ...state, currentStudentId: action.payload };
    
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
    
    if (storedData.students && storedData.students.length > 0) {
      // Load all data from storage
      Object.entries(storedData).forEach(([key, value]) => {
        if (key === 'role') {
          dispatch({ type: 'SET_ROLE', payload: value as Role });
        }
      });
    } else {
      // Initialize with mock data
      const initialPayments: Payment[] = [];
      
      mockStudents.forEach(student => {
        mockCollections.forEach(collection => {
          initialPayments.push({
            id: generateId(),
            collectionId: collection.id,
            studentId: student.id,
            amount: collection.amount,
            isPaid: Math.random() > 0.5,
            paidAt: Math.random() > 0.5 ? new Date().toISOString() : undefined,
            createdAt: new Date().toISOString()
          });
        });
      });

      const initialData = {
        ...storedData,
        students: mockStudents,
        collections: mockCollections,
        payments: initialPayments,
        announcements: mockAnnouncements,
        requests: mockRequests,
        attendance: [],
        announcementReads: []
      };
      
      saveToStorage(initialData);
    }
  }, []);

  // Save to storage on state changes
  useEffect(() => {
    saveToStorage(state);
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