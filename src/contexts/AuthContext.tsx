import React, { createContext, useContext, useEffect, useReducer } from 'react';
import * as SecureStore from 'expo-secure-store';
import { AuthState, User, LoginCredentials, RegisterCredentials } from '../types';
import { AuthService } from '../services/api';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar se existe token salvo ao inicializar
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const userString = await SecureStore.getItemAsync('userData');
      
      if (token && userString) {
        const user = JSON.parse(userString);
        dispatch({ type: 'SET_USER', payload: user });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Erro ao verificar status de autenticação:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { user, token } = await AuthService.login(credentials.email, credentials.password);
      
      // Salvar dados no SecureStore
      await SecureStore.setItemAsync('authToken', token);
      await SecureStore.setItemAsync('userData', JSON.stringify(user));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Senhas não coincidem');
      }
      
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { user, token } = await AuthService.register({
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
      });
      
      // Salvar dados no SecureStore
      await SecureStore.setItemAsync('authToken', token);
      await SecureStore.setItemAsync('userData', JSON.stringify(user));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('userData');
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const updateUser = async (updatedData: Partial<User>) => {
    try {
      if (state.user) {
        const updatedUser = { ...state.user, ...updatedData, updatedAt: new Date() };
        await SecureStore.setItemAsync('userData', JSON.stringify(updatedUser));
        dispatch({ type: 'SET_USER', payload: updatedUser });
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};