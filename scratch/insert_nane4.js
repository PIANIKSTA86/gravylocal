const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const existing = db.prepare('SELECT id FROM electronic_payrolls WHERE prefijo = ? AND consecutivo = ?').get('NANE', 4);
if (!existing) {
  const id = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 9);
  db.prepare(`
    INSERT INTO electronic_payrolls (
      id, periodo_id, employee_id, ano, mes, consecutivo, prefijo,
      total_devengos, total_deducciones, total_neto, total_empleador, total_empleados,
      cufe, estado_dian, dian_response, fecha_envio, tipo_ambiente, created, updated
    ) VALUES (
      ?, 'ee1fqygbh9nkr14', 'vsu8bz83547sxrn', 2026, 9, 4, 'NANE',
      0, 0, 0, 0, 1,
      '646d0d1beda74fb9c405a67bd781ed8b4f207a8d4abd14feaafb261d70bb669eda9a8923e3bc54d6c6d49a2535f1ed7e',
      'APROBADO', 'Nota de Ajuste de Eliminación aprobada por la DIAN (CUNE: 646d0d1beda74fb9c405a67bd781ed8b4f207a8d4abd14feaafb261d70bb669eda9a8923e3bc54d6c6d49a2535f1ed7e)',
      '2026-11-09 08:43:27', '1', datetime('now'), datetime('now')
    )
  `).run(id);
  console.log('NANE-4 insertado con id:', id);
} else {
  console.log('NANE-4 ya existía');
}

db.prepare("UPDATE dian_resolutions SET current_number = 5 WHERE id = '5mzbip81b0xso8k'").run();
console.log('dian_resolutions NANE actualizado a 5');

