import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Avatar,
  IconButton,
  HelperText,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';

type EditProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || '',
  });
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({});

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (formData.phone && formData.phone.length > 0 && formData.phone.length < 10) {
      newErrors.phone = 'Telefone deve ter pelo menos 10 dígitos';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        const newImageUri = result.assets[0].uri;
        setFormData(prev => ({ ...prev, profileImage: newImageUri }));
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    } finally {
      setIsUpdatingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsUpdating(true);
    try {
      await updateUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        profileImage: formData.profileImage || undefined,
      });
      
      Alert.alert(
        'Sucesso',
        'Perfil atualizado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o perfil');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancelar',
      'Descartar alterações?',
      [
        { text: 'Não', style: 'cancel' },
        { 
          text: 'Sim', 
          style: 'destructive',
          onPress: () => navigation.goBack()
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Editar Perfil</Title>
            
            <View style={styles.avatarContainer}>
              {formData.profileImage ? (
                <Avatar.Image 
                  size={120} 
                  source={{ uri: formData.profileImage }}
                  style={styles.avatar}
                />
              ) : (
                <Avatar.Text 
                  size={120} 
                  label={formData.name.substring(0, 2).toUpperCase() || 'U'}
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

            <TextInput
              label="Nome completo *"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.name}
              disabled={isUpdating}
            />
            <HelperText type="error" visible={!!errors.name}>
              {errors.name}
            </HelperText>

            <TextInput
              label="Email *"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              error={!!errors.email}
              disabled={isUpdating}
            />
            <HelperText type="error" visible={!!errors.email}>
              {errors.email}
            </HelperText>

            <TextInput
              label="Telefone"
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              error={!!errors.phone}
              disabled={isUpdating}
              placeholder="(11) 99999-9999"
            />
            <HelperText type="error" visible={!!errors.phone}>
              {errors.phone}
            </HelperText>

            <View style={styles.actions}>
              <Button
                mode="contained"
                onPress={handleSave}
                style={styles.saveButton}
                disabled={isUpdating}
                loading={isUpdating}
              >
                {isUpdating ? 'Salvando...' : 'Salvar alterações'}
              </Button>

              <Button
                mode="outlined"
                onPress={handleCancel}
                style={styles.cancelButton}
                disabled={isUpdating}
              >
                Cancelar
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  card: {
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 24,
    fontWeight: 'bold',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  avatar: {
    marginBottom: 8,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: '#6200ea',
  },
  input: {
    marginBottom: 8,
  },
  actions: {
    marginTop: 16,
    gap: 12,
  },
  saveButton: {
    paddingVertical: 4,
  },
  cancelButton: {
    paddingVertical: 4,
  },
});