function getColombiaDateStr(d) {
  if (typeof d === 'string') {
    const trimmed = d.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
      const dt = new Date(trimmed);
      if (!isNaN(dt.getTime())) {
        try {
          return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' }).format(dt);
        } catch {
          const cot = new Date(dt.getTime() - 5 * 3600 * 1000);
          return cot.toISOString().slice(0, 10);
        }
      }
    }
  }
  const dt = d ? (d instanceof Date ? d : new Date(d)) : new Date();
  if (isNaN(dt.getTime())) return '';
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' }).format(dt);
  } catch {
    const cot = new Date(dt.getTime() - 5 * 3600 * 1000);
    return cot.toISOString().slice(0, 10);
  }
}

function fmtDate(d) {
  if (!d) return '—';
  if (typeof d === 'string') {
    const trimmed = d.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const parts = trimmed.split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }
  const dateStr = getColombiaDateStr(d);
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

console.log('2026-09-01 =>', fmtDate('2026-09-01'));
console.log('2026-09-10 =>', fmtDate('2026-09-10'));
console.log('ISO string 2026-09-01T10:00:00Z =>', fmtDate('2026-09-01T10:00:00Z'));
