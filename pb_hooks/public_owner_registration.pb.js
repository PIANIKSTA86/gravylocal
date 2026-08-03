/// <reference path="../pb_data/types.d.ts" />
/**
 * Validación pública mínima para el registro de propietarios móviles.
 * No expone las colecciones completas; solo confirma si una identificación
 * corresponde a un propietario activo con unidades asignadas.
 */

routerAdd('POST', '/api/public/owner-registration-check', (e) => {
  try {
    const normalizeDoc = (value) => String(value || '').replace(/[^0-9A-Za-z]/g, '').toUpperCase();

    const info = e.requestInfo();
    const body = info?.body || {};
    const requestedDocument = normalizeDoc(body.documentNumber || body.document_number || '');

    if (!requestedDocument) {
      e.json(400, { message: 'La identificación es obligatoria.' });
      return;
    }

    const owners = $app.findRecordsByFilter('third_parties', 'active=true', 'name', 500, 0) || [];
    const matchingOwners = owners.filter((owner) =>
      normalizeDoc(owner?.getString?.('doc_number') || owner?.doc_number || '') === requestedDocument,
    );

    if (!matchingOwners.length) {
      e.json(404, { eligible: false, message: 'No existe un propietario activo con esa identificación.' });
      return;
    }

    const properties = $app.findRecordsByFilter('ph_properties', 'active=true', 'code', 1000, 0) || [];
    const eligible = matchingOwners
      .map((owner) => {
        const ownerId = String(owner?.id || '');
        const propertiesCount = properties.filter((property) => {
          const propertyOwnerId = String(property?.getString?.('owner_id') || property?.owner_id || '');
          return propertyOwnerId === ownerId;
        }).length;

        return {
          id: ownerId,
          name: String(owner?.getString?.('name') || owner?.name || ''),
          docType: String(owner?.getString?.('doc_type') || owner?.doc_type || ''),
          docNumber: String(owner?.getString?.('doc_number') || owner?.doc_number || ''),
          propertiesCount,
          preferredType: String(owner?.getString?.('type') || owner?.type || '') === 'CLIENTE',
        };
      })
      .filter((row) => row.propertiesCount > 0)
      .sort((left, right) => {
        if (left.preferredType !== right.preferredType) {
          return left.preferredType ? -1 : 1;
        }
        return right.propertiesCount - left.propertiesCount;
      })[0];

    if (!eligible) {
      e.json(404, {
        eligible: false,
        message: 'La identificación no corresponde a un propietario activo con unidades asignadas.',
      });
      return;
    }

    const linkedUsers = $app.findRecordsByFilter(
      'users',
      `owner_id = "${eligible.id}"`,
      '-created',
      5,
      0,
    ) || [];

    if (linkedUsers.length > 0) {
      const first = linkedUsers[0];
      const linkedEmail = String(first?.getString?.('email') || first?.email || '');
      e.json(409, {
        eligible: false,
        code: 'OWNER_ALREADY_LINKED',
        message: 'Este propietario ya tiene un usuario móvil registrado.',
        owner: {
          id: eligible.id,
          name: eligible.name,
          docType: eligible.docType,
          docNumber: eligible.docNumber,
          propertiesCount: eligible.propertiesCount,
        },
        linkedUser: {
          id: String(first?.id || ''),
          email: linkedEmail,
        },
      });
      return;
    }

    e.json(200, {
      eligible: true,
      owner: {
        id: eligible.id,
        name: eligible.name,
        docType: eligible.docType,
        docNumber: eligible.docNumber,
        propertiesCount: eligible.propertiesCount,
      },
    });
  } catch (err) {
    e.json(500, { eligible: false, message: 'No se pudo validar la identificación: ' + String(err) });
  }
});

/**
 * Contexto autenticado para app móvil de propietarios.
 * Devuelve owner resuelto + unidades asociadas para evitar ambigüedades de relaciones en el cliente.
 */
routerAdd('GET', '/api/public/owner-context', (e) => {
  try {
    const normalizeText = (value) => String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^0-9A-Za-z ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase();

    const relationValueToId = (value) => {
      if (!value) return '';
      if (Array.isArray(value)) {
        if (!value.length) return '';
        const first = value[0];
        if (typeof first === 'object' && first) return String(first.id || '');
        return String(first || '');
      }
      if (typeof value === 'object') {
        return String(value.id || '');
      }
      return String(value || '');
    };

    const info = e.requestInfo();
    const auth = info?.auth;
    if (!auth) {
      e.json(401, { message: 'Autenticación requerida.' });
      return;
    }

    const ownerCandidates = [
      auth?.getString?.('owner_id'),
      auth?.owner_id,
      auth?.getString?.('third_party_id'),
      auth?.third_party_id,
      auth?.getString?.('tercero_id'),
      auth?.tercero_id,
    ];

    let ownerId = '';
    for (const candidate of ownerCandidates) {
      const id = relationValueToId(candidate);
      if (id) {
        ownerId = id;
        break;
      }
    }

    const properties = $app.findRecordsByFilter('ph_properties', 'active=true', 'code', 2000, 0) || [];

    // Fallback por nombre si no llega owner_id en el auth record.
    if (!ownerId) {
      const owners = $app.findRecordsByFilter('third_parties', 'active=true', 'name', 2000, 0) || [];
      const ownerUnits = new Map();
      properties.forEach((property) => {
        const pid = String(property?.getString?.('owner_id') || property?.owner_id || '');
        if (!pid) return;
        ownerUnits.set(pid, (ownerUnits.get(pid) || 0) + 1);
      });

      const userNames = [
        normalizeText(auth?.getString?.('full_name') || auth?.full_name || ''),
        normalizeText(auth?.getString?.('name') || auth?.name || ''),
        normalizeText(String(auth?.getString?.('email') || auth?.email || '').split('@')[0] || ''),
      ].filter(Boolean);

      const candidates = owners
        .map((owner) => {
          const id = String(owner?.id || '');
          const ownerName = normalizeText(owner?.getString?.('name') || owner?.name || '');
          const matchesName = userNames.some((u) => u && ownerName && (u === ownerName || u.includes(ownerName) || ownerName.includes(u)));
          return {
            id,
            units: ownerUnits.get(id) || 0,
            preferredType: String(owner?.getString?.('type') || owner?.type || '') === 'CLIENTE',
            owner,
            matchesName,
          };
        })
        .filter((row) => row.matchesName && row.units > 0)
        .sort((a, b) => {
          if (a.preferredType !== b.preferredType) return a.preferredType ? -1 : 1;
          return b.units - a.units;
        });

      ownerId = String(candidates[0]?.id || '');
    }

    if (!ownerId) {
      e.json(200, {
        owner: null,
        properties: [],
      });
      return;
    }

    const owner = $app.findRecordById('third_parties', ownerId);
    const ownerProps = properties
      .filter((property) => String(property?.getString?.('owner_id') || property?.owner_id || '') === ownerId)
      .map((property) => ({
        id: String(property?.id || ''),
        code: String(property?.getString?.('code') || property?.code || ''),
        name: String(property?.getString?.('name') || property?.name || ''),
        owner_id: ownerId,
      }));

    e.json(200, {
      owner: {
        id: ownerId,
        name: String(owner?.getString?.('name') || owner?.name || ''),
        docNumber: String(owner?.getString?.('doc_number') || owner?.doc_number || ''),
      },
      properties: ownerProps,
    });
  } catch (err) {
    e.json(500, { message: 'No se pudo resolver el contexto del propietario: ' + String(err) });
  }
});