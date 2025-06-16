import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationData } from '../types';

interface NotificationContextType {
  notifications: NotificationData[];
  unreadCount: number;
  addNotification: (notification: Omit<NotificationData, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Configurar como as notificações devem ser exibidas
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    
    // Listener para notificações recebidas quando o app está em foreground
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const newNotification: NotificationData = {
        id: notification.request.identifier,
        title: notification.request.content.title || 'Nova notificação',
        message: notification.request.content.body || '',
        type: 'info',
        read: false,
        createdAt: new Date(),
      };
      
      addNotification(newNotification);
    });

    return () => subscription.remove();
  }, []);

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      if (stored) {
        const parsedNotifications = JSON.parse(stored);
        setNotifications(parsedNotifications);
        updateUnreadCount(parsedNotifications);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const saveNotifications = async (newNotifications: NotificationData[]) => {
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify(newNotifications));
    } catch (error) {
      console.error('Erro ao salvar notificações:', error);
    }
  };

  const updateUnreadCount = (notificationList: NotificationData[]) => {
    const count = notificationList.filter(n => !n.read).length;
    setUnreadCount(count);
  };

  const addNotification = (notification: Omit<NotificationData, 'id' | 'read' | 'createdAt'>) => {
    const newNotification: NotificationData = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      createdAt: new Date(),
    };

    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    updateUnreadCount(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  const markAsRead = (id: string) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    );
    
    setNotifications(updatedNotifications);
    updateUnreadCount(updatedNotifications);
    saveNotifications(updatedNotifications);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true,
    }));
    
    setNotifications(updatedNotifications);
    setUnreadCount(0);
    saveNotifications(updatedNotifications);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    saveNotifications([]);
  };

  // Função para enviar notificação local (para demonstração)
  const sendLocalNotification = async (title: string, body: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger: null, // Enviar imediatamente
    });
  };

  // Enviar notificações de exemplo periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      const messages = [
        { title: 'Novo produto adicionado!', message: 'Confira os novos produtos disponíveis.' },
        { title: 'Oferta especial!', message: 'Desconto de 20% em produtos selecionados.' },
        { title: 'Lembrete', message: 'Não esqueça de verificar seus produtos favoritos.' },
      ];
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      sendLocalNotification(randomMessage.title, randomMessage.message);
    }, 30000); // A cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
  }
  return context;
};