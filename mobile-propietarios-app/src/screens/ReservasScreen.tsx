import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { colors } from '../theme/colors';
import {
  PhCommonArea,
  PhProperty,
  PhReservation,
  createOwnerReservation,
  getCommonAreas,
  getOwnerProperties,
  getOwnerReservations,
} from '../services/pb';

const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const totalMinutes = index * 30;
  const h = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const m = String(totalMinutes % 60).padStart(2, '0');
  return `${h}:${m}`;
});

function todayIso() {
  const dt = new Date();
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function ReservasScreen() {
  const [properties, setProperties] = useState<PhProperty[]>([]);
  const [areas, setAreas] = useState<PhCommonArea[]>([]);
  const [rows, setRows] = useState<PhReservation[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [timeFrom, setTimeFrom] = useState('08:00');
  const [timeTo, setTimeTo] = useState('09:00');
  const [attendees, setAttendees] = useState('1');
  const [notes, setNotes] = useState('');

  const [showCalendar, setShowCalendar] = useState(false);
  const [showAreaSelector, setShowAreaSelector] = useState(false);
  const [showTimeSelector, setShowTimeSelector] = useState<'from' | 'to' | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ownerPropsRes, commonAreasRes, reservationsRes] = await Promise.allSettled([
        getOwnerProperties(),
        getCommonAreas(),
        getOwnerReservations(),
      ]);

      const ownerProps = ownerPropsRes.status === 'fulfilled' ? ownerPropsRes.value : [];
      const commonAreas = commonAreasRes.status === 'fulfilled' ? commonAreasRes.value : [];
      const reservations = reservationsRes.status === 'fulfilled' ? reservationsRes.value : [];

      setProperties(ownerProps);
      setAreas(commonAreas);
      setRows(reservations);

      if (!selectedProperty && ownerProps.length) {
        setSelectedProperty(ownerProps[0].id);
      }
      if (!selectedArea && commonAreas.length) {
        setSelectedArea(commonAreas[0].id);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedArea, selectedProperty]);

  useEffect(() => {
    load();
  }, [load]);

  const selectedAreaLabel = useMemo(() => {
    const area = areas.find((a) => a.id === selectedArea);
    return area?.name || area?.code || 'Seleccionar zona común';
  }, [areas, selectedArea]);

  const canSubmit = useMemo(() => {
    return !!selectedProperty && !!selectedArea && !!selectedDate && !!timeFrom && !!timeTo;
  }, [selectedArea, selectedDate, selectedProperty, timeFrom, timeTo]);

  const submit = async () => {
    if (!canSubmit) {
      Alert.alert('Datos incompletos', 'Selecciona unidad, zona y completa fecha/horario.');
      return;
    }

    if (timeTo <= timeFrom) {
      Alert.alert('Horario inválido', 'La hora de fin debe ser mayor a la hora de inicio.');
      return;
    }

    try {
      await createOwnerReservation({
        areaId: selectedArea,
        propertyId: selectedProperty,
        date: selectedDate,
        timeFrom,
        timeTo,
        attendees: Math.max(1, Number(attendees || '1')),
        notes: notes.trim(),
      });
      setAttendees('1');
      setNotes('');
      await load();
      Alert.alert('Reserva enviada', 'Tu solicitud quedó en estado pendiente.');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No fue posible crear la reserva.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reservas</Text>
      <Text style={styles.subtitle}>Reserva zonas comunes de la copropiedad.</Text>

      <Text style={styles.label}>Unidad</Text>
      <View style={styles.chipsRow}>
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

      <Text style={styles.label}>Zona común</Text>
      <Pressable
        style={[styles.selector, !areas.length && styles.selectorDisabled]}
        onPress={() => {
          if (!areas.length) return;
          setShowAreaSelector(true);
        }}
      >
        <Text style={styles.selectorLabel}>{selectedAreaLabel}</Text>
        <Text style={styles.selectorHint}>{areas.length ? 'Toca para cambiar' : 'No hay zonas comunes activas'}</Text>
      </Pressable>

      <View style={styles.formRow}>
        <Pressable style={[styles.input, styles.selectorInput]} onPress={() => setShowCalendar(true)}>
          <Text style={styles.selectorText}>Fecha: {selectedDate}</Text>
        </Pressable>
        <Pressable style={[styles.input, styles.selectorInput]} onPress={() => setShowTimeSelector('from')}>
          <Text style={styles.selectorText}>Desde: {timeFrom}</Text>
        </Pressable>
      </View>

      <View style={styles.formRow}>
        <Pressable style={[styles.input, styles.selectorInput]} onPress={() => setShowTimeSelector('to')}>
          <Text style={styles.selectorText}>Hasta: {timeTo}</Text>
        </Pressable>
        <TextInput
          style={styles.input}
          placeholder="Asistentes"
          keyboardType="numeric"
          value={attendees}
          onChangeText={setAttendees}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Notas (opcional)"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <Pressable style={[styles.button, !canSubmit && styles.buttonDisabled]} onPress={submit}>
        <Text style={styles.buttonText}>Solicitar reserva</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Mis reservas</Text>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={<Text style={styles.empty}>Aún no tienes reservas registradas.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.expand?.area_id?.name || 'Zona común'}</Text>
            <Text style={styles.meta}>Fecha: {item.date}</Text>
            <Text style={styles.meta}>Horario: {item.time_from} - {item.time_to}</Text>
            <Text style={styles.meta}>Estado: {item.status || 'pending'}</Text>
          </View>
        )}
      />

      <Modal visible={showCalendar} transparent animationType="fade" onRequestClose={() => setShowCalendar(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Seleccionar fecha</Text>
            <Calendar
              current={selectedDate}
              minDate={todayIso()}
              markedDates={{
                [selectedDate]: {
                  selected: true,
                  disableTouchEvent: true,
                  selectedColor: colors.primary,
                },
              }}
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                setShowCalendar(false);
              }}
              theme={{
                todayTextColor: colors.primary,
                selectedDayBackgroundColor: colors.primary,
                arrowColor: colors.primary,
              }}
            />
            <Pressable style={styles.modalClose} onPress={() => setShowCalendar(false)}>
              <Text style={styles.modalCloseText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showAreaSelector} transparent animationType="fade" onRequestClose={() => setShowAreaSelector(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Seleccionar zona común</Text>
            <FlatList
              data={areas}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={<Text style={styles.empty}>No hay zonas comunes activas.</Text>}
              renderItem={({ item }) => {
                const active = item.id === selectedArea;
                return (
                  <Pressable
                    style={[styles.modalItem, active && styles.modalItemActive]}
                    onPress={() => {
                      setSelectedArea(item.id);
                      setShowAreaSelector(false);
                    }}
                  >
                    <Text style={[styles.modalItemText, active && styles.modalItemTextActive]}>
                      {item.name || item.code || 'Zona común'}
                    </Text>
                  </Pressable>
                );
              }}
            />
            <Pressable style={styles.modalClose} onPress={() => setShowAreaSelector(false)}>
              <Text style={styles.modalCloseText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={!!showTimeSelector} transparent animationType="fade" onRequestClose={() => setShowTimeSelector(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{showTimeSelector === 'from' ? 'Seleccionar hora inicio' : 'Seleccionar hora fin'}</Text>
            <FlatList
              data={TIME_OPTIONS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const active = (showTimeSelector === 'from' ? timeFrom : timeTo) === item;
                return (
                  <Pressable
                    style={[styles.modalItem, active && styles.modalItemActive]}
                    onPress={() => {
                      if (showTimeSelector === 'from') {
                        setTimeFrom(item);
                      } else {
                        setTimeTo(item);
                      }
                      setShowTimeSelector(null);
                    }}
                  >
                    <Text style={[styles.modalItemText, active && styles.modalItemTextActive]}>{item}</Text>
                  </Pressable>
                );
              }}
            />
            <Pressable style={styles.modalClose} onPress={() => setShowTimeSelector(null)}>
              <Text style={styles.modalCloseText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    marginTop: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
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
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  formRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  selector: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  selectorDisabled: {
    opacity: 0.65,
  },
  inlineHint: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 8,
  },
  selectorLabel: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  selectorHint: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  selectorInput: {
    justifyContent: 'center',
  },
  selectorText: {
    color: colors.textPrimary,
    fontWeight: '700',
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    maxHeight: '75%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontWeight: '800',
    marginBottom: 10,
  },
  modalItem: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 8,
  },
  modalItemActive: {
    borderColor: colors.primary,
    backgroundColor: '#ECFDF5',
  },
  modalItemText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  modalItemTextActive: {
    color: colors.primary,
  },
  modalClose: {
    marginTop: 8,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  modalCloseText: {
    color: colors.textMuted,
    fontWeight: '700',
  },
});
