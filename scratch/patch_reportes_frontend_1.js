const fs = require('fs');

const file = 'frontend/src/modules/reportes.ts';
let code = fs.readFileSync(file, 'utf8');

// 1. Update buildOpenPortfolioDocs and buildAgingDocsDirect
const oldBuild = `async function buildOpenPortfolioDocs({ mode = 'cxc', asOfDate = todayStr(), thirdType = '', sellerId = '' } = {}) {
  const scopeParams = getScopeQueryParams();
  const cacheKey = \`\${mode}|\${asOfDate}|\${thirdType}|\${sellerId}|\${scopeParams}\`;
  if (REPORT_STATE.portfolioCache[cacheKey]) {
    return REPORT_STATE.portfolioCache[cacheKey];
  }

  const items = await pb.send(\`/api/gravy/report-portfolio-aging?mode=\${mode}&asOfDate=\${asOfDate}&thirdType=\${encodeURIComponent(thirdType)}&sellerId=\${encodeURIComponent(sellerId)}\${scopeParams}\`, {
    method: 'GET'
  });

  REPORT_STATE.portfolioCache[cacheKey] = items || [];
  return items || [];
}

/**
 * Dedicated, optimized query for Cartera por Edades.
 * Fetches ONLY the account codes relevant to the mode (13 for CxC, 22/23/25 for CxP)
 * and filters by date server-side. Uses a local cache keyed by mode|asOfDate|sellerId.
 */
async function buildAgingDocsDirect({ mode = 'cxc', asOfDate = todayStr(), sellerId = '' } = {}) {
  return buildOpenPortfolioDocs({ mode, asOfDate, thirdType: '', sellerId });
}`;

const newBuild = `async function buildOpenPortfolioDocs({ mode = 'cxc', asOfDate = todayStr(), thirdType = '', sellerId = '', accountCodes = '' } = {}) {
  const scopeParams = getScopeQueryParams();
  const cacheKey = \`\${mode}|\${asOfDate}|\${thirdType}|\${sellerId}|\${accountCodes}|\${scopeParams}\`;
  if (REPORT_STATE.portfolioCache[cacheKey]) {
    return REPORT_STATE.portfolioCache[cacheKey];
  }

  const items = await pb.send(\`/api/gravy/report-portfolio-aging?mode=\${mode}&asOfDate=\${asOfDate}&thirdType=\${encodeURIComponent(thirdType)}&sellerId=\${encodeURIComponent(sellerId)}&accountCodes=\${encodeURIComponent(accountCodes)}\${scopeParams}\`, {
    method: 'GET'
  });

  REPORT_STATE.portfolioCache[cacheKey] = items || [];
  return items || [];
}

/**
 * Dedicated, optimized query for Cartera por Edades.
 * Fetches ONLY the account codes relevant to the mode (13 for CxC, 22/23/25 for CxP)
 * or specific accountCodes chosen by the user, and filters by date server-side.
 */
async function buildAgingDocsDirect({ mode = 'cxc', asOfDate = todayStr(), sellerId = '', accountCodes = '' } = {}) {
  return buildOpenPortfolioDocs({ mode, asOfDate, thirdType: '', sellerId, accountCodes });
}`;

const normalize = s => s.replace(/\r\n/g, '\n');

if (normalize(code).includes(normalize(oldBuild))) {
  code = normalize(code).replace(normalize(oldBuild), normalize(newBuild));
  console.log('buildOpenPortfolioDocs updated.');
} else {
  console.error('Could not find oldBuild');
}

fs.writeFileSync(file, code, 'utf8');

