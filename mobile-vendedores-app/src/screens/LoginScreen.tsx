import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { loginWithPassword, pb } from '../services/pb';
import { RootStackParamList } from '../navigation/RootNavigator';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Datos incompletos', 'Ingresa correo y contraseña.');
      return;
    }

    try {
      setLoading(true);
      await loginWithPassword(email, password);
      navigation.replace('MainTabs');
    } catch (error: any) {
      console.log('Login error object:', JSON.stringify(error, null, 2));
      console.log('Login error message:', error?.message);
      // Obtener el base url configurado en pb
      const configuredUrl = pb.baseUrl || 'No definida';
      const detailedMessage = `URL: ${configuredUrl}\n\nError: ${error?.message || 'Fallo de red'}\n\nDetalle: ${JSON.stringify(error.data || error || {})}`;
      Alert.alert('Error de acceso', detailedMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.brandArea}>
        <Image
          source={require('../../assets/gravy-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.brand}>GRAVY</Text>
        <Text style={styles.tagline}>Vendedores & Toma de Pedidos</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.formTitle}>Ingreso Vendedores</Text>

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#94A3B8"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Contraseña"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#64748B" />
          </Pressable>
        </View>

        <Pressable style={styles.btn} onPress={onLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.btnText}>Iniciar Sesión</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Fondo claro
    justifyContent: 'center',
    padding: 24,
  },
  brandArea: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  brand: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0284C7', // Azul corporativo claro
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    color: '#0F172A',
    marginBottom: 16,
    fontSize: 15,
  },
  btn: {
    height: 52,
    backgroundColor: '#0284C7', // Botón azul corporativo
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 15,
    height: '100%',
  },
  eyeBtn: {
    padding: 4,
  },
});
