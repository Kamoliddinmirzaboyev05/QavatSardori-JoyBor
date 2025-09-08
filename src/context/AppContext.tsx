import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { AppState, Student, AttendanceRecord, Collection, Payment, Announcement, AnnouncementRead, Request, Role } from '../types';
import { loadFromStorage, saveToStorage, generateId } from '../utils/storage';
import { mockStudents, mockCollections, mockAnnouncements, mockRequests } from '../utils/mockData';

type AppAction = 
  | { type: 'SET_ROLE'; payload: Role }
  | { type: 'SET_CURRENT_STUDENT'; payload: string }
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
  role: 'qavat_sardori',
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
    
    if (storedData.students && storedData.students.length > 0) {
      // Load all data from storage
      dispatch({ type: 'LOAD_DATA', payload: storedData });
    } else {
      // Initialize with mock data
      const initialPayments: Payment[] = [];
      const initialAttendance: AttendanceRecord[] = [];
      const initialAnnouncementReads: AnnouncementRead[] = [];
      
      mockStudents.forEach((student) => {
        mockCollections.forEach((collection) => {
          // Create realistic payment patterns
          const isPaid = Math.random() > 0.3; // 70% chance of being paid
          const paidAt = isPaid ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined;
          
          initialPayments.push({
            id: generateId(),
            collectionId: collection.id,
            studentId: student.id,
            amount: collection.amount,
            isPaid,
            paidAt,
            createdAt: new Date().toISOString()
          });
        });

        // Add mock attendance for last 15 days with realistic patterns
        for (let i = 0; i < 15; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateString = date.toISOString().split('T')[0];
          
          // More realistic attendance patterns
          let status: 'hozir' | 'yoq' | 'kech';
          const rand = Math.random();
          if (rand < 0.75) status = 'hozir'; // 75% present
          else if (rand < 0.9) status = 'kech'; // 15% late
          else status = 'yoq'; // 10% absent
          
          initialAttendance.push({
            id: generateId(),
            studentId: student.id,
            date: dateString,
            status,
            createdAt: new Date().toISOString()
          });
        }

        // Add some announcement reads
        mockAnnouncements.forEach((announcement) => {
          // 60% chance student has read the announcement
          if (Math.random() > 0.4) {
            initialAnnouncementReads.push({
              id: generateId(),
              announcementId: announcement.id,
              studentId: student.id,
              readAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
            });
          }
        });
      });

      const initialData = {
        ...storedData,
        role: 'qavat_sardori' as Role,
        currentStudentId: mockStudents[0]?.id,
        students: mockStudents,
        collections: mockCollections,
        payments: initialPayments,
        announcements: mockAnnouncements,
        requests: mockRequests,
        attendance: initialAttendance,
        announcementReads: initialAnnouncementReads
      };
      
      dispatch({ type: 'LOAD_DATA', payload: initialData });
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