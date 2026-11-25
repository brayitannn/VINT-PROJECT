import { chromium } from 'playwright-core';
import fs from 'fs';

const BASE_URL = process.env.VINT_WEB_URL || 'https://vint-project-git-develop-elbrayanf022-6820s-projects.vercel.app';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT_FILE = 'C:\\Users\\DELL\\Downloads\\front y api\\tests\\sistema\\reportes\\e2e_compat_results.json';

const VENDEDOR_EMAIL = process.env.QA_VENDEDOR_EMAIL;
const COMPRADOR_EMAIL = process.env.QA_COMPRADOR_EMAIL;
const ADMIN_EMAIL = process.env.QA_ADMIN_EMAIL;
const QA_PASS = process.env.QA_PASS;

async function loginAs(page, email, password) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
  const emailInput = page.locator('input[type="email"], input[name="email"], input#email').first();
  const passInput = page.locator('input[type="password"], input[name="password"], input#password').first();
  await emailInput.waitFor({ state: 'visible', timeout: 15000 });
  await emailInput.fill(email);
  await passInput.fill(password);
  const submitBtn = page.locator('button[type="submit"]').first();
  await submitBtn.click();
  // Esperar redirección fuera de /login (hasta 18s por loader animado en VINT)
  try {
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 18000 });
  } catch {
    // mantener URL actual para diagnóstico real
  }
  await page.waitForTimeout(1500);
  return page.url();
}

async function run() {
  const results = {
    baseUrl: BASE_URL,
    timestamp: new Date().toISOString(),
    e2e: [],
    compat: [],
  };

  // 1. E2E en Google Chrome
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  });
  const chromeVer = browser.version();
  results.chromeVersion = chromeVer;

  try {
    // ── CP-SIS-001: Registro, forgot-password y login con redirección por rol ──
    {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await ctx.newPage();
      const pageErrors = [];
      page.on('pageerror', (e) => pageErrors.push(e.message));
      try {
        await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle', timeout: 30000 });
        const hasRegForm = await page.locator('form').count() > 0;
        await page.goto(`${BASE_URL}/forgot-password`, { waitUntil: 'networkidle', timeout: 30000 });
        const hasForgotForm = await page.locator('input[type="email"]').count() > 0;
        const vendUrl = await loginAs(page, VENDEDOR_EMAIL, QA_PASS);
        const vendOk = vendUrl.includes('/dashboard');
        results.e2e.push({
          id: 'CP-SIS-001',
          scenario: 'Registro (/register), recuperación (/forgot-password) e inicio de sesión con redirección por rol',
          passed: hasRegForm && hasForgotForm && vendOk && pageErrors.length === 0,
          details: `Form registro: ${hasRegForm}, Form forgot-password: ${hasForgotForm}, URL tras login VENDEDOR: ${vendUrl}, errores JS: ${pageErrors.length}`,
          errors: pageErrors,
        });
      } catch (err) {
        results.e2e.push({ id: 'CP-SIS-001', passed: false, details: String(err) });
      } finally {
        await ctx.close();
      }
    }

    // ── CP-SIS-002: Catálogo /explorar, /tienda y panel Mi Tienda del Vendedor ──
    {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await ctx.newPage();
      const pageErrors = [];
      page.on('pageerror', (e) => pageErrors.push(e.message));
      try {
        await page.goto(`${BASE_URL}/explorar`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(1500);
        const bodyLenExp = (await page.locator('body').innerText()).trim().length;
        await page.goto(`${BASE_URL}/tienda`, { waitUntil: 'networkidle', timeout: 30000 });
        const bodyLenTienda = (await page.locator('body').innerText()).trim().length;
        await loginAs(page, VENDEDOR_EMAIL, QA_PASS);
        await page.goto(`${BASE_URL}/dashboard/vendedor/mi-tienda`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(1500);
        const miTiendaUrl = page.url();
        const miTiendaTextLen = (await page.locator('body').innerText()).trim().length;
        const ok = bodyLenExp > 100 && bodyLenTienda > 100 && miTiendaUrl.includes('vendedor') && miTiendaTextLen > 50 && pageErrors.length === 0;
        results.e2e.push({
          id: 'CP-SIS-002',
          scenario: 'Exploración de catálogo (/explorar, /tienda) y acceso a gestión Mi Tienda del Vendedor',
          passed: ok,
          details: `/explorar (${bodyLenExp} chars), /tienda (${bodyLenTienda} chars), Mi Tienda URL: ${miTiendaUrl} (${miTiendaTextLen} chars), errores JS: ${pageErrors.length}`,
          errors: pageErrors,
        });
      } catch (err) {
        results.e2e.push({ id: 'CP-SIS-002', passed: false, details: String(err) });
      } finally {
        await ctx.close();
      }
    }

    // ── CP-SIS-003: Flujo Comprador (login -> dashboard comprador -> favoritos -> checkout -> perfil) ──
    {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await ctx.newPage();
      const pageErrors = [];
      page.on('pageerror', (e) => pageErrors.push(e.message));
      try {
        const compUrl = await loginAs(page, COMPRADOR_EMAIL, QA_PASS);
        await page.goto(`${BASE_URL}/favoritos`, { waitUntil: 'networkidle', timeout: 30000 });
        const favOk = (await page.locator('body').innerText()).trim().length > 40;
        await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle', timeout: 30000 });
        const chkOk = (await page.locator('body').innerText()).trim().length > 40;
        await page.goto(`${BASE_URL}/perfil`, { waitUntil: 'networkidle', timeout: 30000 });
        const perfOk = (await page.locator('body').innerText()).trim().length > 40;
        const ok = compUrl.includes('/dashboard') && favOk && chkOk && perfOk && pageErrors.length === 0;
        results.e2e.push({
          id: 'CP-SIS-003',
          scenario: 'Flujo Comprador: login por rol, favoritos (/favoritos), checkout (/checkout) y perfil (/perfil)',
          passed: ok,
          details: `URL tras login COMPRADOR: ${compUrl}, /favoritos: ${favOk}, /checkout: ${chkOk}, /perfil: ${perfOk}, errores JS: ${pageErrors.length}`,
          errors: pageErrors,
        });
      } catch (err) {
        results.e2e.push({ id: 'CP-SIS-003', passed: false, details: String(err) });
      } finally {
        await ctx.close();
      }
    }

    // ── CP-SIS-004: Panel Admin como ADMIN y protección de ruta frente a COMPRADOR ──
    {
      const ctxAdmin = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const pageAdmin = await ctxAdmin.newPage();
      const errsA = [];
      pageAdmin.on('pageerror', (e) => errsA.push(e.message));

      const ctxComp = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const pageComp = await ctxComp.newPage();
      try {
        const adminLoginUrl = await loginAs(pageAdmin, ADMIN_EMAIL, QA_PASS);
        await pageAdmin.goto(`${BASE_URL}/dashboard/admin`, { waitUntil: 'networkidle', timeout: 30000 });
        await pageAdmin.waitForTimeout(2000);
        const adminFinalUrl = pageAdmin.url();
        const adminBodyLen = (await pageAdmin.locator('body').innerText()).trim().length;

        // Comprador intenta entrar a /dashboard/admin
        await loginAs(pageComp, COMPRADOR_EMAIL, QA_PASS);
        await pageComp.goto(`${BASE_URL}/dashboard/admin`, { waitUntil: 'networkidle', timeout: 30000 });
        await pageComp.waitForTimeout(2000);
        const compAttemptUrl = pageComp.url();
        const compText = (await pageComp.locator('body').innerText()).toLowerCase();
        const compBlocked = !compAttemptUrl.includes('/dashboard/admin') || compText.includes('denegado') || compText.includes('permiso') || compText.includes('no autorizado');

        results.e2e.push({
          id: 'CP-SIS-004',
          scenario: 'Acceso al panel /dashboard/admin como ADMIN y bloqueo/redirección para rol COMPRADOR',
          passed: adminFinalUrl.includes('/dashboard/admin') && adminBodyLen > 80 && compBlocked && errsA.length === 0,
          details: `Login ADMIN: ${adminLoginUrl}, /dashboard/admin: ${adminFinalUrl} (${adminBodyLen} chars), Intento COMPRADOR terminó en: ${compAttemptUrl} (bloqueado=${compBlocked}), errores JS: ${errsA.length}`,
          errors: errsA,
        });
      } catch (err) {
        results.e2e.push({ id: 'CP-SIS-004', passed: false, details: String(err) });
      } finally {
        await ctxAdmin.close();
        await ctxComp.close();
      }
    }

    // ── Compatibilidad Chrome Desktop 1920x1080 & Mobile Responsive 390x844 ──
    for (const vp of [
      { label: 'Google Chrome (Escritorio)', w: 1920, h: 1080 },
      { label: 'Google Chrome (Vista Móvil Responsive)', w: 390, h: 844 },
    ]) {
      const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
      const page = await ctx.newPage();
      const errs = [];
      page.on('pageerror', (e) => errs.push(e.message));
      let overflow = false;
      for (const route of ['/', '/explorar', '/login']) {
        await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle', timeout: 30000 });
        const hasOv = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 10);
        if (hasOv) overflow = true;
      }
      results.compat.push({
        platform: vp.label,
        version: chromeVer,
        resolution: `${vp.w}×${vp.h}`,
        passed: errs.length === 0,
        overflow,
        errors: errs,
      });
      await ctx.close();
    }
  } finally {
    await browser.close();
  }

  // 2. Compatibilidad Microsoft Edge 1920x1080
  if (fs.existsSync(EDGE_PATH)) {
    const edge = await chromium.launch({
      executablePath: EDGE_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });
    const edgeVer = edge.version();
    results.edgeVersion = edgeVer;
    try {
      const ctx = await edge.newContext({ viewport: { width: 1920, height: 1080 } });
      const page = await ctx.newPage();
      const errs = [];
      page.on('pageerror', (e) => errs.push(e.message));
      let overflow = false;
      for (const route of ['/', '/explorar', '/login']) {
        await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle', timeout: 30000 });
        const hasOv = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 10);
        if (hasOv) overflow = true;
      }
      results.compat.push({
        platform: 'Microsoft Edge (Escritorio)',
        version: edgeVer,
        resolution: '1920×1080',
        passed: errs.length === 0,
        overflow,
        errors: errs,
      });
      await ctx.close();
    } finally {
      await edge.close();
    }
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(results, null, 2), 'utf-8');
  console.log('E2E_COMPAT_DONE:', JSON.stringify(results, null, 2));
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
