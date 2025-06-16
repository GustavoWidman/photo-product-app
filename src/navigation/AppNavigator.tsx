import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Badge } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootStackParamList, MainTabParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

// Auth Screens
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/ResetPasswordScreen';

// Main Screens
import { HomeScreen } from '../screens/HomeScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { CameraScreen } from '../screens/CameraScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs: React.FC = () => {
  const { unreadCount } = useNotifications();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Products':
              iconName = focused ? 'package-variant' : 'package-variant-closed';
              break;
            case 'Camera':
              iconName = 'camera';
              break;
            case 'Notifications':
              iconName = focused ? 'bell' : 'bell-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'help-circle';
          }

          const iconComponent = <Icon name={iconName} size={size} color={color} />;
          
          // Retornar apenas o ícone, o badge será tratado pelo tabBarBadge

          return iconComponent;
        },
        tabBarActiveTintColor: '#6200ea',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#6200ea',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Início',
          headerTitle: 'Photo Product App',
        }}
      />
      <Tab.Screen 
        name="Products" 
        component={ProductsScreen}
        options={{
          title: 'Produtos',
        }}
      />
      <Tab.Screen 
        name="Camera" 
        component={CameraScreen}
        options={{
          title: 'Câmera',
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          title: 'Notificações',
          tabBarBadge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : undefined,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // Ou um splash screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6200ea',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ 
                headerShown: false,
                animationTypeForReplace: 'push',
              }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={{ 
                title: 'Criar Conta',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen 
              name="ForgotPassword" 
              component={ForgotPasswordScreen}
              options={{ 
                title: 'Recuperar Senha',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen 
              name="ResetPassword" 
              component={ResetPasswordScreen}
              options={{ 
                title: 'Nova Senha',
                headerBackTitleVisible: false,
              }}
            />
          </>
        ) : (
          // Main App Stack
          <>
            <Stack.Screen 
              name="MainTabs" 
              component={MainTabs}
              options={{ 
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="ProductDetail" 
              component={ProductDetailScreen}
              options={{ 
                title: 'Detalhes do Produto',
                headerBackTitleVisible: false,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};