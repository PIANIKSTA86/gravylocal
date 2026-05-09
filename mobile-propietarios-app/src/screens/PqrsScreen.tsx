import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { colors } from '../theme/colors';
import {
  PqrsEvidenceInput,
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
const MAX_EVIDENCE_SIZE = 2 * 1024 * 1024;
const MAX_EVIDENCES = 3;

export function PqrsScreen() {
  const [properties, setProperties] = useState<PhProperty[]>([]);
  const [rows, setRows] = useState<PhPqrs[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedProperty, setSelectedProperty] = useState('');
  const [pqrsType, setPqrsType] = useState<PqrsType>('PETICION');
  const [priority, setPriority] = useState<Priority>('media');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [evidences, setEvidences] = useState<PqrsEvidenceInput[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ownerPropertiesRes, pqrsRes] = await Promise.allSettled([getOwnerProperties(), getOwnerPqrs()]);
      const ownerProperties = ownerPropertiesRes.status === 'fulfilled' ? ownerPropertiesRes.value : [];
      const pqrs = pqrsRes.status === 'fulfilled' ? pqrsRes.value : [];
      setProperties(ownerProperties);
      setRows(pqrs);
      if (ownerProperties.length && (!selectedProperty || !ownerProperties.some((p) => p.id === selectedProperty))) {
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
        evidences,
      });
      setSubject('');
      setDescription('');
      setPqrsType('PETICION');
      setPriority('media');
      setEvidences([]);
      await load();
      Alert.alert('PQRS radicada', 'Tu solicitud fue enviada a administración.');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No fue posible radicar la PQRS.');
    }
  };

  const pickEvidences = async () => {
    try {
      if (evidences.length >= MAX_EVIDENCES) {
        Alert.alert('Límite alcanzado', `Solo puedes adjuntar hasta ${MAX_EVIDENCES} evidencias.`);
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf', 'text/plain'],
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const next = [...evidences];
      for (const asset of result.assets) {
        if (next.length >= MAX_EVIDENCES) break;
        const size = Number(asset.size || 0);
        if (size > MAX_EVIDENCE_SIZE) {
          Alert.alert('Archivo muy grande', `"${asset.name}" supera 2MB y fue omitido.`);
          continue;
        }
        next.push({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType || undefined,
          size: size || undefined,
        });
      }

      setEvidences(next);
    } catch {
      Alert.alert('Error', 'No fue posible seleccionar evidencias.');
    }
  };

  const removeEvidence = (index: number) => {
    setEvidences((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PQRS</Text>
      <Text style={styles.subtitle}>Radica y haz seguimiento a tus solicitudes.</Text>

      <Text style={styles.label}>Unidad</Text>
      <View style={styles.rowWrap}>
        {properties.length ? (
          properties.map((p) => (
            <Pressable
              key={p.id}
              style={[styles.chip, selectedProperty === p.id && styles.chipActive]}
              onPress={() => setSelectedProperty(p.id)}
            >
              <Text style={[styles.chipText, selectedProperty === p.id && styles.chipTextActive]}>
                {p.name || p.code || p.id}
              </Text>
            </Pressable>
          ))
        ) : (
          <Text style={styles.inlineHint}>No encontramos unidades asociadas a tu usuario.</Text>
        )}
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

      <Text style={styles.label}>Evidencias (opcional)</Text>
      <Pressable style={styles.attachBtn} onPress={pickEvidences}>
        <Text style={styles.attachBtnText}>Agregar evidencias</Text>
        <Text style={styles.attachHint}>Imagen, PDF o TXT - max 2MB c/u, hasta 3 archivos</Text>
      </Pressable>

      {evidences.length > 0 && (
        <View style={styles.evidenceList}>
          {evidences.map((file, index) => (
            <View key={`${file.uri}-${index}`} style={styles.evidenceRow}>
              <Text style={styles.evidenceName} numberOfLines={1}>{file.name || `Evidencia ${index + 1}`}</Text>
              <Pressable onPress={() => removeEvidence(index)}>
                <Text style={styles.removeEvidence}>Quitar</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

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
  inlineHint: {
    color: colors.textMuted,
    fontSize: 12,
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
  attachBtn: {
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  attachBtnText: {
    color: '#1D4ED8',
    fontWeight: '800',
  },
  attachHint: {
    color: '#1E40AF',
    fontSize: 12,
    marginTop: 2,
  },
  evidenceList: {
    marginBottom: 10,
    gap: 6,
  },
  evidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  evidenceName: {
    flex: 1,
    color: colors.textPrimary,
    marginRight: 10,
    fontSize: 12,
  },
  removeEvidence: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 12,
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
