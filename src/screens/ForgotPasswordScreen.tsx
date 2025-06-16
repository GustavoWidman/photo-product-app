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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { AuthService } from '../services/api';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string } = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const { otp } = await AuthService.sendResetPasswordOTP(email);
      
      Alert.alert(
        'OTP Enviado',
        `Um código de verificação foi enviado para ${email}.\n\nPara fins de demonstração, o código é: ${otp}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ResetPassword', { email }),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao enviar código de verificação'
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
              <Title style={styles.title}>Recuperar Senha</Title>
              <Paragraph style={styles.subtitle}>
                Digite seu email para receber um código de verificação
              </Paragraph>

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                error={!!errors.email}
                disabled={isLoading}
              />
              <HelperText type="error" visible={!!errors.email}>
                {errors.email}
              </HelperText>

              <Button
                mode="contained"
                onPress={handleSendOTP}
                style={styles.sendButton}
                disabled={isLoading}
                loading={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar código'}
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
  sendButton: {
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 4,
  },
  textButton: {
    marginTop: 8,
  },
});