import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  HelperText,
} from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { AuthService } from '../services/api';

type ResetPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ResetPassword'>;
type ResetPasswordScreenRouteProp = RouteProp<RootStackParamList, 'ResetPassword'>;

export const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();
  const route = useRoute<ResetPasswordScreenRouteProp>();
  const { email } = route.params;
  
  const [formData, setFormData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    otp?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!formData.otp.trim()) {
      newErrors.otp = 'Código OTP é obrigatório';
    } else if (formData.otp.length !== 6) {
      newErrors.otp = 'Código OTP deve ter 6 dígitos';
    }
    
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const success = await AuthService.resetPassword(
        email,
        formData.otp,
        formData.newPassword
      );
      
      if (success) {
        Alert.alert(
          'Sucesso',
          'Senha alterada com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        Alert.alert('Erro', 'Código OTP inválido ou expirado');
      }
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao alterar senha'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>Nova Senha</Title>
              <Paragraph style={styles.subtitle}>
                Digite o código enviado para {email} e sua nova senha
              </Paragraph>

              <TextInput
                label="Código OTP"
                value={formData.otp}
                onChangeText={(value) => updateFormData('otp', value)}
                mode="outlined"
                keyboardType="numeric"
                maxLength={6}
                style={styles.input}
                error={!!errors.otp}
                disabled={isLoading}
              />
              <HelperText type="error" visible={!!errors.otp}>
                {errors.otp}
              </HelperText>

              <TextInput
                label="Nova senha"
                value={formData.newPassword}
                onChangeText={(value) => updateFormData('newPassword', value)}
                mode="outlined"
                secureTextEntry={!showPassword}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                style={styles.input}
                error={!!errors.newPassword}
                disabled={isLoading}
              />
              <HelperText type="error" visible={!!errors.newPassword}>
                {errors.newPassword}
              </HelperText>

              <TextInput
                label="Confirmar nova senha"
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                mode="outlined"
                secureTextEntry={!showConfirmPassword}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                style={styles.input}
                error={!!errors.confirmPassword}
                disabled={isLoading}
              />
              <HelperText type="error" visible={!!errors.confirmPassword}>
                {errors.confirmPassword}
              </HelperText>

              <Button
                mode="contained"
                onPress={handleResetPassword}
                style={styles.resetButton}
                disabled={isLoading}
                loading={isLoading}
              >
                {isLoading ? 'Alterando senha...' : 'Alterar senha'}
              </Button>

              <Button
                mode="text"
                onPress={() => navigation.navigate('Login')}
                style={styles.textButton}
                disabled={isLoading}
              >
                Voltar ao login
              </Button>
            </Card.Content>
          </Card>
        </View>
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
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  input: {
    marginBottom: 8,
  },
  resetButton: {
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 4,
  },
  textButton: {
    marginTop: 8,
  },
});