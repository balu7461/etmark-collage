import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function login(email: string, password: string) {
    try {
      // Check if this is the main admin account
      if (email === 'hiddencave168@gmail.com' && password === 'Test@123') {
        // Create admin user object for main admin
        const adminUser: User = {
          id: 'main-admin',
          email: 'hiddencave168@gmail.com',
          name: 'Main Administrator',
          role: 'admin',
          department: 'Administration',
          phone: '+1234567890',
          isApproved: true
        };
        setCurrentUser(adminUser);
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        toast.success(`Welcome back, ${adminUser.name}!`);
        return;
      }

      const result = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        
        // Check if user is approved (applies to all roles)
        if (!userData.isApproved) {
          await signOut(auth); // Sign out immediately
          
          // Different messages for different roles
          let roleMessage = '';
          switch (userData.role) {
            case 'timetable_committee':
              roleMessage = 'Your Timetable Committee account is pending admin approval. Committee accounts require special verification.';
              break;
            case 'examination_committee':
              roleMessage = 'Your Examination Committee account is pending admin approval. Committee accounts require special verification.';
              break;
            case 'committee_member':
              roleMessage = 'Your Committee Member account is pending admin approval. Committee accounts require special verification.';
              break;
            default:
              roleMessage = 'Your faculty account is pending admin approval.';
          }
            
          throw new Error(`${roleMessage} Please contact the administrator for approval status.`);
        }
        
        setCurrentUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Welcome message with role
        const roleDisplay = userData.role === 'committee_member' ? 'Committee Member' : 
                           userData.role === 'timetable_committee' ? 'Timetable Committee' :
                           userData.role === 'examination_committee' ? 'Examination Committee' :
                           userData.role;
        toast.success(`Welcome back, ${userData.name}! (${roleDisplay.toUpperCase()})`);
      } else {
        throw new Error('User profile not found');
      }
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  }

  async function logout() {
    try {
      // Handle main admin logout
      if (currentUser?.email === 'hiddencave168@gmail.com') {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
        toast.success('Logged out successfully');
        return;
      }

      await signOut(auth);
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  }

  useEffect(() => {
    // Check for stored user on app start
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setCurrentUser(userData);
        setLoading(false);
        return;
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            
            // Check if user is approved
            if (!userData.isApproved) {
              await signOut(auth);
              setCurrentUser(null);
              localStorage.removeItem('currentUser');
              
              let roleMessage = '';
              switch (userData.role) {
                case 'timetable_committee':
                  roleMessage = 'Your Timetable Committee account is pending admin approval.';
                  break;
                case 'examination_committee':
                  roleMessage = 'Your Examination Committee account is pending admin approval.';
                  break;
                case 'committee_member':
                  roleMessage = 'Your Committee Member account is pending admin approval.';
                  break;
                default:
                  roleMessage = 'Your account is pending admin approval.';
              }
              
              toast.error(roleMessage);
              setLoading(false);
              return;
            }
            
            setCurrentUser(userData);
            localStorage.setItem('currentUser', JSON.stringify(userData));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        // Only clear if it's not the main admin
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (userData.email !== 'hiddencave168@gmail.com') {
            setCurrentUser(null);
            localStorage.removeItem('currentUser');
          }
        } else {
          setCurrentUser(null);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}