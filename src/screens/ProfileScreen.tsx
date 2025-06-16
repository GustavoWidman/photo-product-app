import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Paragraph,
  Button,
  Avatar,
  Divider,
  List,
  IconButton,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import * as ImagePicker from 'expo-image-picker';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout, updateUser } = useAuth();
  const { unreadCount } = useNotifications();
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
            }
          }
        },
      ]
    );
  };

  const handleChangePhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUpdatingPhoto(true);
        await updateUser({ profileImage: result.assets[0].uri });
        Alert.alert('Sucesso', 'Foto de perfil atualizada!');
      }
    } catch (error) {
      console.error('Erro ao atualizar foto:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a foto');
    } finally {
      setIsUpdatingPhoto(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text>Erro ao carregar perfil</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <View style={styles.avatarContainer}>
            {user.profileImage ? (
              <Avatar.Image 
                size={120} 
                source={{ uri: user.profileImage }}
                style={styles.avatar}
              />
            ) : (
              <Avatar.Text 
                size={120} 
                label={user.name.substring(0, 2).toUpperCase()}
                style={styles.avatar}
              />
            )}
            <IconButton
              icon="camera"
              mode="contained"
              size={20}
              style={styles.cameraButton}
              onPress={handleChangePhoto}
              loading={isUpdatingPhoto}
            />
          </View>
          
          <Title style={styles.userName}>{user.name}</Title>
          <Paragraph style={styles.userEmail}>{user.email}</Paragraph>
          
          {user.phone && (
            <Paragraph style={styles.userPhone}>{user.phone}</Paragraph>
          )}
          
          <Text style={styles.memberSince}>
            Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.menuCard}>
        <List.Section>
          <List.Subheader>Conta</List.Subheader>
          
          <List.Item
            title="Editar perfil"
            description="Altere suas informações pessoais"
            left={props => <List.Icon {...props} icon="account-edit" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('EditProfile')}
          />
          
          <List.Item
            title="Notificações"
            description={unreadCount > 0 ? `${unreadCount} não lidas` : 'Nenhuma notificação'}
            left={props => <List.Icon {...props} icon="bell" />}
            right={props => (
              <View style={styles.notificationRight}>
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount}</Text>
                  </View>
                )}
                <List.Icon {...props} icon="chevron-right" />
              </View>
            )}
            onPress={() => navigation.navigate('Notifications')}
          />
          
          <Divider />
          
          <List.Subheader>Produtos</List.Subheader>
          
          <List.Item
            title="Meus produtos"
            description="Produtos que você adicionou"
            left={props => <List.Icon {...props} icon="package-variant" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              // TODO: Implementar tela de produtos do usuário
              Alert.alert('Em breve', 'Esta funcionalidade será implementada em breve');
            }}
          />
          
          <List.Item
            title="Favoritos"
            description="Seus produtos favoritos"
            left={props => <List.Icon {...props} icon="heart" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              // TODO: Implementar tela de favoritos
              Alert.alert('Em breve', 'Esta funcionalidade será implementada em breve');
            }}
          />
          
          <Divider />
          
          <List.Subheader>Configurações</List.Subheader>
          
          <List.Item
            title="Sobre o app"
            description="Versão 1.0.0"
            left={props => <List.Icon {...props} icon="information" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert(
                'Photo Product App',
                'Versão 1.0.0\n\nAplicativo desenvolvido com React Native e Expo seguindo as melhores práticas de UX/UI com Material Design 3.'
              );
            }}
          />
          
          <List.Item
            title="Termos de uso"
            description="Leia nossos termos"
            left={props => <List.Icon {...props} icon="file-document" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert('Termos de uso', 'Em um app real, aqui seria exibido os termos de uso');
            }}
          />
          
          <List.Item
            title="Política de privacidade"
            description="Como protegemos seus dados"
            left={props => <List.Icon {...props} icon="shield-account" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert('Política de privacidade', 'Em um app real, aqui seria exibida a política de privacidade');
            }}
          />
        </List.Section>
      </Card>

      <Card style={styles.dangerCard}>
        <Card.Content>
          <Button
            mode="contained"
            onPress={handleLogout}
            buttonColor="#d32f2f"
            textColor="white"
            icon="logout"
            style={styles.logoutButton}
          >
            Sair da conta
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    margin: 16,
    elevation: 4,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    marginBottom: 16,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 8,
    right: -8,
    backgroundColor: '#6200ea',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  memberSince: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  menuCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  notificationRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#e91e63',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dangerCard: {
    marginHorizontal: 16,
    marginBottom: 32,
    elevation: 2,
  },
  logoutButton: {
    paddingVertical: 4,
  },
});