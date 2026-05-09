import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme/colors';
import {
  PhProperty,
  PhPqrs,
  createOwnerPqrs,
  getOwnerPqrs,
  getOwnerProperties,
} from '../services/pb';

type PqrsType = 'PETICION' | 'QUEJA' | 'RECLAMO' | 'SUGERENCIA' | 'FELICITACION';
type Priority = 'baja' | 'media' | 'alta';

const PQRS_TYPES: PqrsType[] = ['PETICION', 'QUEJA', 'RECLAMO', 'SUGERENCIA', 'FELICITACION'];
const PRIORITIES: Priority[] = ['baja', 'media', 'alta'];

export function PqrsScreen() {
  const [properties, setProperties] = useState<PhProperty[]>([]);
  const [rows, setRows] = useState<PhPqrs[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedProperty, setSelectedProperty] = useState('');
  const [pqrsType, setPqrsType] = useState<PqrsType>('PETICION');
  const [priority, setPriority] = useState<Priority>('media');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ownerProperties, pqrs] = await Promise.all([getOwnerProperties(), getOwnerPqrs()]);
      setProperties(ownerProperties);
      setRows(pqrs);
      if (!selectedProperty && ownerProperties.length) {
        setSelectedProperty(ownerProperties[0].id);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedProperty]);

  useEffect(() => {
    load();
  }, [load]);

  const canSubmit = useMemo(() => {
    return !!selectedProperty && !!subject.trim() && !!description.trim();
  }, [description, selectedProperty, subject]);

  const submit = async () => {
    if (!canSubmit) {
      Alert.alert('Datos incompletos', 'Completa unidad, asunto y descripción.');
      return;
    }

    try {
      await createOwnerPqrs({
        propertyId: selectedProperty,
        type: pqrsType,
        priority,
        subject,
        description,
      });
      setSubject('');
      setDescription('');
      setPqrsType('PETICION');
      setPriority('media');
      await load();
      Alert.alert('PQRS radicada', 'Tu solicitud fue enviada a administración.');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No fue posible radicar la PQRS.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PQRS</Text>
      <Text style={styles.subtitle}>Radica y haz seguimiento a tus solicitudes.</Text>

      <Text style={styles.label}>Unidad</Text>
      <View style={styles.rowWrap}>
        {properties.map((p) => (
          <Pressable
            key={p.id}
            style={[styles.chip, selectedProperty === p.id && styles.chipActive]}
            onPress={() => setSelectedProperty(p.id)}
          >
            <Text style={[styles.chipText, selectedProperty === p.id && styles.chipTextActive]}>
              {p.name || p.code || p.id}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Tipo</Text>
      <View style={styles.rowWrap}>
        {PQRS_TYPES.map((type) => (
          <Pressable key={type} style={[styles.chip, pqrsType === type && styles.chipActive]} onPress={() => setPqrsType(type)}>
            <Text style={[styles.chipText, pqrsType === type && styles.chipTextActive]}>{type}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Prioridad</Text>
      <View style={styles.rowWrap}>
        {PRIORITIES.map((p) => (
          <Pressable key={p} style={[styles.chip, priority === p && styles.chipActive]} onPress={() => setPriority(p)}>
            <Text style={[styles.chipText, priority === p && styles.chipTextActive]}>{p.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      <TextInput style={styles.input} placeholder="Asunto" value={subject} onChangeText={setSubject} />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe tu solicitud"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Pressable style={[styles.button, !canSubmit && styles.buttonDisabled]} onPress={submit}>
        <Text style={styles.buttonText}>Enviar PQRS</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Mis PQRS</Text>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={<Text style={styles.empty}>No tienes PQRS registradas.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.number || 'PQRS'}</Text>
            <Text style={styles.meta}>Tipo: {item.pqrs_type}</Text>
            <Text style={styles.meta}>Estado: {item.status || 'open'}</Text>
            <Text style={styles.meta}>Asunto: {item.subject}</Text>
            {!!item.response && <Text style={styles.response}>Respuesta: {item.response}</Text>}
          </View>
        )}
      />
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
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 10,
  },
  label: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 6,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  textArea: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: '800',
    marginBottom: 8,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontWeight: '800',
    marginBottom: 4,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
  },
  response: {
    marginTop: 6,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
