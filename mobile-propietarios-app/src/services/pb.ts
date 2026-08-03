import PocketBase from 'pocketbase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Puedes sobreescribir esta URL con EXPO_PUBLIC_PB_URL.
const DEFAULT_PB_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8090' : 'http://localhost:8090';
const PB_URL = process.env.EXPO_PUBLIC_PB_URL || DEFAULT_PB_URL;

export const pb = new PocketBase(PB_URL);

type AnyRecord = Record<string, any>;

export type PhProperty = {
  id: string;
  code?: string;
  name?: string;
  owner_id?: string;
};

export type PhInvoice = {
  id: string;
  number?: string;
  period?: string;
  total?: number;
  due_date?: string;
  date?: string;
  status?: 'draft' | 'posted' | 'paid' | 'voided' | string;
  property_id?: string;
  expand?: {
    property_id?: PhProperty;
  };
};

export type PhCommonArea = {
  id: string;
  code?: string;
  name?: string;
  capacity?: number;
  active?: boolean;
};

export type PhReservation = {
  id: string;
  area_id: string;
  property_id: string;
  date: string;
  time_from: string;
  time_to: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | string;
  attendees?: number;
  notes?: string;
  expand?: {
    area_id?: PhCommonArea;
    property_id?: PhProperty;
  };
};

export type PhPqrs = {
  id: string;
  number?: string;
  property_id?: string;
  evidences?: string[];
  pqrs_type: 'PETICION' | 'QUEJA' | 'RECLAMO' | 'SUGERENCIA' | 'FELICITACION';
  priority?: 'baja' | 'media' | 'alta' | string;
  subject: string;
  description: string;
  status?: 'open' | 'in_process' | 'resolved' | 'closed' | string;
  response?: string;
  opened_at?: string;
  created?: string;
  expand?: {
    property_id?: PhProperty;
  };
};

export type PqrsEvidenceInput = {
  uri: string;
  name?: string;
  mimeType?: string;
  size?: number;
};

export type AppNotification = {
  id: string;
  type: 'billing' | 'reservation' | 'pqrs';
  level: 'info' | 'warning' | 'danger';
  title: string;
  message: string;
  dateRef?: string;
};

export type OwnerNotification = AppNotification & {
  isRead: boolean;
};

export type CopropiedadInfo = {
  name: string;
  nit: string;
  address: string;
};

export type OwnerRegistrationMatch = {
  id: string;
  name: string;
  docType?: string;
  docNumber?: string;
  propertiesCount: number;
};

type OwnerRegistrationResponse = {
  message?: string;
  code?: string;
  owner?: OwnerRegistrationMatch;
  linkedUser?: {
    id?: string;
    email?: string;
  };
};

type OwnerContextResponse = {
  owner?: {
    id?: string;
    name?: string;
    docNumber?: string;
  } | null;
  properties?: PhProperty[];
};

export async function loginWithPassword(email: string, password: string) {
  return pb.collection('users').authWithPassword(email.trim(), password);
}

function normalizeDocument(value: string) {
  return String(value || '').replace(/[^0-9A-Za-z]/g, '').toUpperCase();
}

function normalizeText(value: string) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

async function fetchOwnerRegistrationMatch(documentNumber: string): Promise<OwnerRegistrationMatch | null> {
  const response = await fetch(`${PB_URL}/api/public/owner-registration-check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ documentNumber }),
  });

  const payload = (await response.json().catch(() => ({}))) as OwnerRegistrationResponse;

  if (response.status === 404) {
    return null;
  }

  if (response.status === 409 && payload.code === 'OWNER_ALREADY_LINKED') {
    const linkedEmail = String(payload.linkedUser?.email || '').trim();
    const hint = linkedEmail ? ` Correo asociado: ${linkedEmail}.` : '';
    throw new Error(`Este propietario ya tiene un usuario registrado.${hint}`);
  }

  if (!response.ok) {
    throw new Error(payload.message || 'No se pudo validar la identificación del propietario.');
  }

  return payload.owner || null;
}

export async function findEligibleOwnerByDocument(documentNumber: string): Promise<OwnerRegistrationMatch | null> {
  const normalizedDocument = normalizeDocument(documentNumber);
  if (!normalizedDocument) return null;
  return fetchOwnerRegistrationMatch(normalizedDocument);
}

export async function registerWithPassword(input: {
  fullName: string;
  email: string;
  password: string;
  documentNumber: string;
}) {
  const owner = await findEligibleOwnerByDocument(input.documentNumber);
  if (!owner) {
    throw new Error(
      'La identificacion no corresponde a un propietario activo con unidades asignadas. Solicita validacion a la administracion.',
    );
  }

  return pb.collection('users').create({
    email: input.email.trim(),
    password: input.password,
    passwordConfirm: input.password,
    name: input.fullName.trim(),
    full_name: input.fullName.trim(),
    role: 'propietario',
    active: true,
    owner_id: owner.id,
  });
}

export function logout() {
  pb.authStore.clear();
}

export function currentUser() {
  return pb.authStore.record;
}

function relationValueToId(value: any) {
  if (!value) return '';

  if (typeof value === 'string') {
    const raw = String(value || '').trim();
    if (!raw) return '';

    // PocketBase relation values may occasionally come serialized as JSON strings.
    if ((raw.startsWith('[') && raw.endsWith(']')) || (raw.startsWith('{') && raw.endsWith('}'))) {
      try {
        const parsed = JSON.parse(raw);
        return relationValueToId(parsed);
      } catch {
        // Keep fallback below if parsing fails.
      }
    }

    return raw.replace(/^"|"$/g, '');
  }

  if (Array.isArray(value)) {
    if (!value.length) return '';
    const first = value[0];
    if (typeof first === 'object' && first) return String((first as AnyRecord).id || '');
    return String(first || '');
  }
  if (typeof value === 'object') {
    return String((value as AnyRecord).id || '');
  }
  return String(value || '');
}

function getOwnerRefFromUser(user: AnyRecord | null | undefined) {
  if (!user) return '';

  const candidates = [
    user.owner_id,
    user.third_party_id,
    user.tercero_id,
    user.third_party,
    user.tercero,
    user?.expand?.owner_id,
    user?.expand?.third_party_id,
    user?.expand?.tercero_id,
    user?.expand?.third_party,
    user?.expand?.tercero,
  ];

  for (const candidate of candidates) {
    const relationId = relationValueToId(candidate);
    if (relationId) return relationId;
  }

  return '';
}

async function resolveOwnerRefFromCurrentUser() {
  const user = currentUser() as AnyRecord | null;
  if (!user) return '';

  const immediate = getOwnerRefFromUser(user);
  if (immediate) return immediate;

  const userId = String(user.id || '');
  if (!userId) return '';

  // Fuente primaria: contexto server-side del propietario autenticado.
  try {
    const token = String(pb.authStore.token || '');
    if (token) {
      const res = await fetch(`${PB_URL}/api/public/owner-context`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const payload = (await res.json().catch(() => ({}))) as OwnerContextResponse;
        const ownerId = String(payload?.owner?.id || '');
        if (ownerId) {
          const patchedUser = {
            ...user,
            owner_id: ownerId,
          };
          pb.authStore.save(pb.authStore.token, patchedUser as any);
          return ownerId;
        }
      }
    }
  } catch {
    // noop: fallback below
  }

  try {
    const fresh = (await pb.collection('users').getOne(userId)) as AnyRecord;
    const resolved = getOwnerRefFromUser(fresh);
    if (resolved) {
      pb.authStore.save(pb.authStore.token, fresh as any);
      return resolved;
    }
  } catch {
    // noop: seguimos con fallback por nombre
  }

  // Fallback: si owner_id no llega en sesion, intentamos resolver por nombre del tercero.
  try {
    const userNames = [
      normalizeText(String(user.full_name || '')),
      normalizeText(String(user.name || '')),
      normalizeText(String(user.email || '').split('@')[0] || ''),
    ].filter(Boolean);

    if (!userNames.length) return '';

    const owners = (await pb.collection('third_parties').getFullList({
      sort: 'name',
    })) as AnyRecord[];

    const properties = (await pb.collection('ph_properties').getFullList({
      sort: 'code',
    })) as AnyRecord[];

    const ownerUnits = new Map<string, number>();
    properties.forEach((property) => {
      const ownerId = relationValueToId(property.owner_id);
      if (!ownerId) return;
      ownerUnits.set(ownerId, (ownerUnits.get(ownerId) || 0) + 1);
    });

    const candidates = owners
      .map((owner) => {
        const ownerId = String(owner.id || '');
        const normalizedOwnerName = normalizeText(String(owner.name || owner.getString?.('name') || ''));
        const matchesName = userNames.some((n) => n && normalizedOwnerName && (normalizedOwnerName === n || normalizedOwnerName.includes(n) || n.includes(normalizedOwnerName)));
        return {
          id: ownerId,
          type: String(owner.type || owner.getString?.('type') || ''),
          matchesName,
          units: ownerUnits.get(ownerId) || 0,
        };
      })
      .filter((row) => row.matchesName && row.units > 0)
      .sort((a, b) => {
        if ((a.type === 'CLIENTE') !== (b.type === 'CLIENTE')) {
          return a.type === 'CLIENTE' ? -1 : 1;
        }
        return b.units - a.units;
      });

    const guessedOwnerId = candidates[0]?.id || '';
    if (!guessedOwnerId) return '';

    const patchedUser = {
      ...user,
      owner_id: guessedOwnerId,
    };
    pb.authStore.save(pb.authStore.token, patchedUser as any);
    return guessedOwnerId;
  } catch {
    return '';
  }
}

function toIsoDate(value: string | undefined) {
  if (!value) return null;
  const dt = new Date(`${value}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

export async function getOwnerProperties(): Promise<PhProperty[]> {
  const ownerRef = await resolveOwnerRefFromCurrentUser();
  if (!ownerRef) return [];

  // Fuente primaria: endpoint server-side ya resuelto para el auth actual.
  try {
    const token = String(pb.authStore.token || '');
    if (token) {
      const res = await fetch(`${PB_URL}/api/public/owner-context`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const payload = (await res.json().catch(() => ({}))) as OwnerContextResponse;
        const properties = Array.isArray(payload?.properties) ? payload.properties : [];
        if (properties.length > 0) {
          return properties;
        }
      }
    }
  } catch {
    // noop: fallback a consultas directas abajo
  }

  const rows = (await pb.collection('ph_properties').getFullList({
    sort: 'code',
    expand: 'owner_id',
  })) as AnyRecord[];

  const localMatches = rows.filter((p) => {
    const candidates = [
      p.owner_id,
      p.ownerId,
      p.owner,
      p.third_party_id,
      p.tercero_id,
      p?.expand?.owner_id,
      p?.expand?.owner,
      p?.expand?.third_party_id,
      p?.expand?.tercero_id,
    ];

    for (const candidate of candidates) {
      const relationId = relationValueToId(candidate);
      if (relationId === ownerRef) return true;
    }
    return false;
  }) as PhProperty[];

  if (localMatches.length > 0) {
    return localMatches;
  }

  // Fallback para casos en los que el SDK devuelve la relación con una forma no esperada.
  try {
    const filtered = (await pb.collection('ph_properties').getFullList({
      filter: `owner_id = "${ownerRef}"`,
      sort: 'code',
    })) as PhProperty[];
    return filtered;
  } catch {
    return [];
  }
}

export async function getCopropiedadInfo(): Promise<CopropiedadInfo> {
  const rows = (await pb.collection('settings').getFullList()) as AnyRecord[];
  const map = new Map<string, string>();

  rows.forEach((r) => {
    const k = String(r.key || '');
    const v = String(r.value || '');
    if (k) map.set(k, v);
  });

  return {
    name: map.get('company_name') || 'Copropiedad',
    nit: map.get('company_nit') || 'Sin NIT',
    address: map.get('company_address') || 'Sin direccion registrada',
  };
}

export async function getOwnerInvoices(): Promise<PhInvoice[]> {
  const props = await getOwnerProperties();
  const propIds = new Set(props.map((p) => p.id));
  if (!propIds.size) return [];

  const rows = (await pb.collection('ph_invoices').getFullList({
    sort: '-date',
    expand: 'property_id',
  })) as PhInvoice[];

  return rows
    .filter((inv) => propIds.has(String(inv.property_id || '')))
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
}

export function getInvoiceSummary(invoices: PhInvoice[]) {
  const pendingRows = invoices.filter((i) => i.status !== 'paid' && i.status !== 'voided');
  const today = new Date();

  const pending = pendingRows.reduce((sum, row) => sum + Number(row.total || 0), 0);
  const overdue = pendingRows.reduce((sum, row) => {
    const due = toIsoDate(row.due_date);
    if (!due || due >= today) return sum;
    return sum + Number(row.total || 0);
  }, 0);

  return {
    pending,
    overdue,
    count: pendingRows.length,
  };
}

export async function getCommonAreas(): Promise<PhCommonArea[]> {
  const rows = (await pb.collection('ph_common_areas').getFullList({
    sort: 'code',
  })) as PhCommonArea[];

  return rows.filter((a) => a.active !== false);
}

export async function getOwnerReservations(): Promise<PhReservation[]> {
  const props = await getOwnerProperties();
  const propIds = new Set(props.map((p) => p.id));
  if (!propIds.size) return [];

  const rows = (await pb.collection('ph_reservations').getFullList({
    sort: '-date',
    expand: 'area_id,property_id',
  })) as PhReservation[];

  return rows
    .filter((row) => propIds.has(String(row.property_id || '')))
    .sort((a, b) => {
      const dateCmp = String(b.date || '').localeCompare(String(a.date || ''));
      if (dateCmp !== 0) return dateCmp;
      return String(b.time_from || '').localeCompare(String(a.time_from || ''));
    });
}

export async function createOwnerReservation(input: {
  areaId: string;
  propertyId: string;
  date: string;
  timeFrom: string;
  timeTo: string;
  attendees: number;
  notes?: string;
}) {
  return pb.collection('ph_reservations').create({
    area_id: input.areaId,
    property_id: input.propertyId,
    date: input.date,
    time_from: input.timeFrom,
    time_to: input.timeTo,
    attendees: input.attendees,
    notes: input.notes || '',
    status: 'pending',
  });
}

export async function getOwnerPqrs(): Promise<PhPqrs[]> {
  const props = await getOwnerProperties();
  const propIds = new Set(props.map((p) => p.id));
  if (!propIds.size) return [];

  const rows = (await pb.collection('ph_pqrs').getFullList({
    sort: '-created',
    expand: 'property_id',
  })) as PhPqrs[];

  return rows.filter((row) => propIds.has(String(row.property_id || '')));
}

export async function nextPqrsNumber() {
  const head = await pb.collection('ph_pqrs').getList(1, 1);
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const n = Number(head.totalItems || 0) + 1;
  return `PQR-${today}-${String(n).padStart(4, '0')}`;
}

export async function createOwnerPqrs(input: {
  propertyId: string;
  type: PhPqrs['pqrs_type'];
  priority: 'baja' | 'media' | 'alta';
  subject: string;
  description: string;
  evidences?: PqrsEvidenceInput[];
}) {
  const number = await nextPqrsNumber();
  const openedAt = new Date().toISOString().slice(0, 10);

  const attachments = (input.evidences || []).filter((f) => !!String(f?.uri || '').trim());

  if (!attachments.length) {
    return pb.collection('ph_pqrs').create({
      number,
      property_id: input.propertyId,
      pqrs_type: input.type,
      priority: input.priority,
      subject: input.subject.trim(),
      description: input.description.trim(),
      status: 'open',
      opened_at: openedAt,
    });
  }

  const form = new FormData();
  form.append('number', number);
  form.append('property_id', input.propertyId);
  form.append('pqrs_type', input.type);
  form.append('priority', input.priority);
  form.append('subject', input.subject.trim());
  form.append('description', input.description.trim());
  form.append('status', 'open');
  form.append('opened_at', openedAt);

  attachments.forEach((file, index) => {
    const safeName = file.name || `evidencia_${index + 1}`;
    const safeType = file.mimeType || 'application/octet-stream';
    form.append('evidences', {
      uri: file.uri,
      name: safeName,
      type: safeType,
    } as any);
  });

  const token = String(pb.authStore.token || '');
  const response = await fetch(`${PB_URL}/api/collections/ph_pqrs/records`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(String((payload as AnyRecord)?.message || 'No fue posible radicar la PQRS con evidencias.'));
  }

  return payload;
}

function todayAtMidnight() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function daysBetween(base: Date, target: Date) {
  const ms = target.getTime() - base.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

type InvoiceStatusSnapshot = Record<string, string>;

function invoiceStatusStorageKey() {
  const user = currentUser() as AnyRecord | null;
  const uid = String(user?.id || 'anon');
  return `gravy_mobile_invoice_status_${uid}`;
}

async function getInvoiceStatusSnapshot(): Promise<InvoiceStatusSnapshot> {
  try {
    const raw = await AsyncStorage.getItem(invoiceStatusStorageKey());
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const out: InvoiceStatusSnapshot = {};
    Object.keys(parsed).forEach((key) => {
      out[String(key)] = String((parsed as AnyRecord)[key] || '');
    });
    return out;
  } catch {
    return {};
  }
}

async function setInvoiceStatusSnapshot(snapshot: InvoiceStatusSnapshot) {
  await AsyncStorage.setItem(invoiceStatusStorageKey(), JSON.stringify(snapshot));
}

async function getInvoiceLifecycleNotifications(invoices: PhInvoice[]): Promise<AppNotification[]> {
  const previous = await getInvoiceStatusSnapshot();
  const next: InvoiceStatusSnapshot = {};
  const items: AppNotification[] = [];

  for (const inv of invoices) {
    const id = String(inv.id || '');
    if (!id) continue;

    const status = String(inv.status || '').toLowerCase();
    const was = String(previous[id] || '').toLowerCase();
    next[id] = status;

    const ref = inv.number || inv.id;
    if (!was) {
      if (status === 'posted') {
        items.push({
          id: `bill-issued-${id}`,
          type: 'billing',
          level: 'info',
          title: 'Factura emitida',
          message: `${ref} fue emitida.`,
          dateRef: inv.date,
        });
      } else if (status === 'paid') {
        items.push({
          id: `bill-paid-${id}`,
          type: 'billing',
          level: 'info',
          title: 'Factura pagada',
          message: `${ref} ya registra pago.`,
          dateRef: inv.date,
        });
      }
      continue;
    }

    if (was !== 'posted' && status === 'posted') {
      items.push({
        id: `bill-issued-${id}`,
        type: 'billing',
        level: 'info',
        title: 'Factura emitida',
        message: `${ref} fue emitida.`,
        dateRef: inv.date,
      });
    }

    if (was !== 'paid' && status === 'paid') {
      items.push({
        id: `bill-paid-${id}`,
        type: 'billing',
        level: 'info',
        title: 'Factura pagada',
        message: `${ref} fue marcada como pagada.`,
        dateRef: inv.date,
      });
    }
  }

  await setInvoiceStatusSnapshot(next);
  return items;
}

export async function getOwnerNotifications(): Promise<AppNotification[]> {
  const [invoices, reservations, pqrs] = await Promise.all([
    getOwnerInvoices(),
    getOwnerReservations(),
    getOwnerPqrs(),
  ]);

  const items: AppNotification[] = [];
  const today = todayAtMidnight();

  const lifecycleItems = await getInvoiceLifecycleNotifications(invoices);
  items.push(...lifecycleItems);

  for (const inv of invoices) {
    if (inv.status === 'paid' || inv.status === 'voided') continue;
    const due = toIsoDate(inv.due_date);
    if (!due) continue;

    const d = daysBetween(today, due);
    const ref = inv.number || inv.id;

    if (d < 0) {
      items.push({
        id: `bill-overdue-${inv.id}`,
        type: 'billing',
        level: 'danger',
        title: 'Factura vencida',
        message: `${ref} vencio hace ${Math.abs(d)} dia(s).`,
        dateRef: inv.due_date,
      });
      continue;
    }

    if (d <= 5) {
      items.push({
        id: `bill-soon-${inv.id}`,
        type: 'billing',
        level: 'warning',
        title: 'Factura proxima a vencer',
        message: `${ref} vence en ${d} dia(s).`,
        dateRef: inv.due_date,
      });
    }
  }

  for (const r of reservations) {
    if (r.status === 'confirmed') {
      items.push({
        id: `res-confirmed-${r.id}`,
        type: 'reservation',
        level: 'info',
        title: 'Reserva confirmada',
        message: `${r.expand?.area_id?.name || 'Tu reserva'} fue confirmada para ${r.date}.`,
        dateRef: r.date,
      });
    }

    if (r.status === 'cancelled') {
      items.push({
        id: `res-cancelled-${r.id}`,
        type: 'reservation',
        level: 'warning',
        title: 'Reserva cancelada',
        message: `${r.expand?.area_id?.name || 'Una reserva'} fue cancelada.`,
        dateRef: r.date,
      });
    }
  }

  for (const p of pqrs) {
    const hasResponse = !!String(p.response || '').trim();
    if (!hasResponse && p.status !== 'resolved' && p.status !== 'closed') continue;

    items.push({
      id: `pqrs-${p.id}`,
      type: 'pqrs',
      level: 'info',
      title: 'Novedad en PQRS',
      message: `${p.number || 'PQRS'} tiene actualizacion (${p.status || 'open'}).`,
      dateRef: p.opened_at || p.created,
    });
  }

  return items.sort((a, b) => String(b.dateRef || '').localeCompare(String(a.dateRef || '')));
}

function notificationsReadStorageKey() {
  const user = currentUser() as AnyRecord | null;
  const uid = String(user?.id || 'anon');
  return `gravy_mobile_read_notifications_${uid}`;
}

async function getReadNotificationIds() {
  try {
    const raw = await AsyncStorage.getItem(notificationsReadStorageKey());
    if (!raw) return new Set<string>();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set<string>();
    return new Set<string>(arr.map((v) => String(v)));
  } catch {
    return new Set<string>();
  }
}

async function setReadNotificationIds(ids: Set<string>) {
  const payload = JSON.stringify(Array.from(ids));
  await AsyncStorage.setItem(notificationsReadStorageKey(), payload);
}

export async function getUnreadOwnerNotifications(): Promise<AppNotification[]> {
  const [all, readIds] = await Promise.all([getOwnerNotifications(), getReadNotificationIds()]);
  return all.filter((n) => !readIds.has(n.id));
}

export async function getOwnerNotificationsWithReadState(): Promise<OwnerNotification[]> {
  const [all, readIds] = await Promise.all([getOwnerNotifications(), getReadNotificationIds()]);
  return all.map((n) => ({
    ...n,
    isRead: readIds.has(n.id),
  }));
}

export async function markNotificationsAsRead(ids: string[]) {
  if (!ids.length) return;
  const readIds = await getReadNotificationIds();
  ids.forEach((id) => readIds.add(String(id)));
  await setReadNotificationIds(readIds);
}

export async function markNotificationAsRead(id: string) {
  if (!id) return;
  await markNotificationsAsRead([id]);
}

export async function markNotificationAsUnread(id: string) {
  if (!id) return;
  const readIds = await getReadNotificationIds();
  readIds.delete(String(id));
  await setReadNotificationIds(readIds);
}

export async function markAllOwnerNotificationsAsRead() {
  const unread = await getUnreadOwnerNotifications();
  await markNotificationsAsRead(unread.map((n) => n.id));
  return unread.length;
}
