import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { currentUser, logout } from '../services/pb';
import { colors } from '../theme/colors';

export function ConfiguracionScreen() {
  const navigation = useNavigation<any>();
  const user = currentUser() as Record<string, any> | null;

  const onLogout = () => {
    logout();
    navigation.replace('Auth');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuracion</Text>
      <Text style={styles.subtitle}>Gestiona tu cuenta y accesos rapidos.</Text>

      <View style={styles.profileCard}>
        <Text style={styles.name}>{String(user?.full_name || 'Propietario')}</Text>
        <Text style={styles.email}>{String(user?.email || 'Sin correo')}</Text>
      </View>

      <Pressable style={styles.itemBtn} onPress={() => navigation.navigate('Notificaciones')}>
        <Text style={styles.itemTitle}>Centro de notificaciones</Text>
        <Text style={styles.itemDesc}>Revisa alertas de cartera, reservas y PQRS.</Text>
      </Pressable>

      <Pressable style={styles.itemBtn} onPress={() => navigation.navigate('Inicio')}>
        <Text style={styles.itemTitle}>Volver a inicio</Text>
        <Text style={styles.itemDesc}>Resumen de copropiedad, unidades y saldos.</Text>
      </Pressable>

      <Pressable style={styles.logoutBtn} onPress={onLogout}>
        <Text style={styles.logoutText}>Cerrar sesion</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 14,
    color: colors.textMuted,
  },
  profileCard: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    padding: 14,
    marginBottom: 14,
  },
  name: {
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: 16,
  },
  email: {
    color: colors.textMuted,
    marginTop: 2,
  },
  itemBtn: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 10,
  },
  itemTitle: {
    color: colors.textPrimary,
    fontWeight: '800',
  },
  itemDesc: {
    color: colors.textMuted,
    marginTop: 3,
    fontSize: 12,
  },
  logoutBtn: {
    marginTop: 10,
    backgroundColor: colors.danger,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
