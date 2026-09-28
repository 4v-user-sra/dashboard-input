// Utility functions for Brazilian numeric parsing, formatting and calculations

export function parseBrNumber(value: string | number): number {
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }
  if (!value) return 0;

  let clean = String(value).trim().toLowerCase();
  
  // Handle shortcuts like 1.2m or 800k
  if (clean.endsWith('m')) {
    const num = parseFloat(clean.replace('m', '').replace(',', '.'));
    return isNaN(num) ? 0 : Math.round(num * 1_000_000);
  }
  if (clean.endsWith('k')) {
    const num = parseFloat(clean.replace('k', '').replace(',', '.'));
    return isNaN(num) ? 0 : Math.round(num * 1_000);
  }

  // Remove currency symbols and spaces
  clean = clean.replace(/r\$/g, '').replace(/\s/g, '');

  // Detect format:
  // If has both dots and commas (e.g. 1.200.000,00 or 1,200,000.00)
  if (clean.includes('.') && clean.includes(',')) {
    if (clean.lastIndexOf(',') > clean.lastIndexOf('.')) {
      // Brazilian format: 1.200.000,50
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else {
      // US format: 1,200,000.50
      clean = clean.replace(/,/g, '');
    }
  } else if (clean.includes('.')) {
    // Check if dot is thousand separator (e.g. 1.200 or 1.200.000)
    const parts = clean.split('.');
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      clean = clean.replace(/\./g, '');
    }
  } else if (clean.includes(',')) {
    // Comma as decimal separator
    clean = clean.replace(',', '.');
  }

  const result = parseFloat(clean);
  return isNaN(result) ? 0 : result;
}

export function formatCurrency(val: number): string {
  const num = typeof val === 'number' && !isNaN(val) ? val : 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatNumber(val: number): string {
  const num = typeof val === 'number' && !isNaN(val) ? val : 0;
  return new Intl.NumberFormat('pt-BR').format(num);
}

export function calculateKpi(meta: number, realizado: number) {
  const m = Math.max(0, meta || 0);
  const r = Math.max(0, realizado || 0);
  const restante = Math.max(0, m - r);
  const percent = m > 0 ? Math.round((r / m) * 100) : 0;
  const superou = r > m;
  const excedente = superou ? r - m : 0;

  return {
    meta: m,
    realizado: r,
    restante,
    percent,
    superou,
    excedente,
  };
}

export function calculateEmissoes(novos: number, renovacao: number) {
  const n = Math.max(0, Math.round(novos || 0));
  const rn = Math.max(0, Math.round(renovacao || 0));
  const total = n + rn;
  const novosPercent = total > 0 ? Math.round((n / total) * 100) : 0;
  const renovacaoPercent = total > 0 ? 100 - novosPercent : 0;

  return {
    novos: n,
    renovacao: rn,
    total,
    novosPercent,
    renovacaoPercent,
  };
}
