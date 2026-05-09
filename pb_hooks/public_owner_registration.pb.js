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