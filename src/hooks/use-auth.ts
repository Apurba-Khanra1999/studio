"use client";

import { 
    useState, 
    useEffect, 
    createContext, 
    useContext,
    type ReactNode 
} from 'react';
import { 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    type User,
    type Auth
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { LoginData, SignUpData } from '@/lib/types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (data: LoginData) => Promise<any>;
    signup: (data: SignUpData) => Promise<any>;
    logout: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = (data: LoginData) => {
        return signInWithEmailAndPassword(auth, data.email, data.password);
    };

    const signup = (data: SignUpData) => {
        return createUserWithEmailAndPassword(auth, data.email, data.password);
    };

    const logout = () => {
        return signOut(auth);
    };

    const value: AuthContextType = {
        user,
        loading,
        login,
        signup,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
