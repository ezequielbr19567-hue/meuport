const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
const { NextRequest } = require('next/server');

const root = path.join(__dirname, '..');
function load(file, mocks = {}) {
  const full = path.resolve(root, file);
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(full, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function('require', 'module', 'exports', code)(name => {
    if (name in mocks) return mocks[name];
    if (name.startsWith('@/')) return load(name.slice(2) + '.ts', mocks);
    if (name.startsWith('.')) return load(path.relative(root, path.resolve(path.dirname(full), name)) + '.ts', mocks);
    return require(name);
  }, module, module.exports);
  return module.exports;
}

(async () => {
  const security = load('lib/security.ts');
  const originRequest = (origin, extra = {}, url = 'https://portfolio.test/api/admin/content') =>
    new Request(url, { method: 'POST', headers: { ...(origin ? { origin } : {}), ...extra } });
  assert.equal(security.hasSameOrigin(originRequest('https://portfolio.test')), true);
  for (const origin of ['https://attacker.test', 'https://portfolio.test.attacker.test', 'null', 'http://portfolio.test', undefined]) {
    assert.equal(security.hasSameOrigin(originRequest(origin)), false);
  }
  assert.equal(security.hasSameOrigin(originRequest('https://portfolio.test', { 'sec-fetch-site': 'cross-site' })), false);
  assert.equal(security.hasSameOrigin(originRequest(undefined, { referer: 'https://portfolio.test/dev?edit=1' })), true);
  assert.equal(security.hasSameOrigin(originRequest('https://portfolio.test:444')), false);
  const consume = security.createRateLimiter();
  assert.equal(consume('visitor', 2, 1000, 100).allowed, true);
  assert.equal(consume('visitor', 2, 1000, 101).allowed, true);
  assert.equal(consume('visitor', 2, 1000, 102).allowed, false);
  assert.equal(consume('visitor', 2, 1000, 1101).allowed, true);

  const jsonRequest = (body, headers = {}) => new Request('https://portfolio.test/api/admin/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json', origin: 'https://portfolio.test', ...headers }, body,
  });
  assert.deepEqual((await security.readJsonBody(jsonRequest('{"password":"abc"}'))).data, { password: 'abc' });
  assert.equal((await security.readJsonBody(jsonRequest('{'))).error.status, 400);
  assert.equal((await security.readJsonBody(jsonRequest('{}', { 'Content-Type': 'text/plain' }))).error.status, 415);
  assert.equal((await security.readJsonBody(jsonRequest('"' + 'x'.repeat(40) + '"'), 16)).error.status, 413);
  assert.equal((await security.readJsonBody(jsonRequest('{}', { 'Content-Length': '999' }), 16)).error.status, 413);
  assert.equal((await security.readJsonBody(jsonRequest('{}', { origin: 'https://attacker.test' }))).error.status, 403);
  const form = new FormData(); form.set('title', 'Allowed');
  assert.equal((await security.readFormBody(new Request('https://portfolio.test/api/reviews', { method: 'POST', headers: { origin: 'https://portfolio.test' }, body: form }))).data.get('title'), 'Allowed');
  const oversizedForm = new Request('https://portfolio.test/api/reviews', { method: 'POST', headers: { origin: 'https://portfolio.test', 'Content-Type': 'multipart/form-data; boundary=test' }, body: new Uint8Array(security.MAX_UPLOAD_BODY_BYTES + 1) });
  assert.equal((await security.readFormBody(oversizedForm)).error.status, 413);

  let storedCookie;
  const auth = load('lib/adminAuth.ts', { 'next/headers': { cookies: async () => ({
    get: () => ({ value: storedCookie?.value || '' }),
    set: (name, value, options) => { storedCookie = { name, value, options }; },
  }) } });
  const now = 1700000000000;
  const token = auth.createSessionToken('strong-test-password', now);
  assert.notEqual(token, auth.createSessionToken('strong-test-password', now));
  assert.equal(auth.verifySessionToken(token, 'strong-test-password', now), true);
  assert.equal(auth.verifySessionToken(token, 'wrong-password', now), false);
  assert.equal(auth.verifySessionToken(token, 'strong-test-password', now + 12 * 3600 * 1000), false);
  assert.equal(auth.verifySessionToken(token + 'x', 'strong-test-password', now), false);
  assert.equal(auth.verifySessionToken('f'.repeat(64), 'strong-test-password', now), false);
  assert.equal(auth.passwordMatches('abc', 'abc'), true);
  assert.equal(auth.passwordMatches('abc', 'xyz'), false);
  assert.equal(auth.passwordMatches('', ''), false);
  const previousPassword = process.env.ADMIN_PASSWORD;
  process.env.ADMIN_PASSWORD = 'strong-test-password';
  await auth.setAdminSession();
  assert.equal(await auth.isAdminAuthenticated(), true);
  assert.equal(storedCookie.options.httpOnly, true);
  assert.equal(storedCookie.options.sameSite, 'strict');
  await auth.clearAdminSession();
  assert.equal(await auth.isAdminAuthenticated(), false);
  if (previousPassword === undefined) delete process.env.ADMIN_PASSWORD; else process.env.ADMIN_PASSWORD = previousPassword;

  let uploadedPath;
  const storage = load('lib/storage.ts', { '@/lib/supabaseAdmin': { getAdminClient: () => ({ storage: { from: () => ({
    upload: async name => { uploadedPath = name; return { error: null }; },
    getPublicUrl: name => ({ data: { publicUrl: 'https://images.test/' + name } }),
  }) } }) } });
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a+X0AAAAASUVORK5CYII=', 'base64');
  const validImage = new File([png], 'misleading.html', { type: 'image/png' });
  assert.equal(await storage.validateImageFile(validImage), null);
  assert.ok(await storage.validateImageFile(new File(['<script>alert(1)</script>'], 'image.png', { type: 'image/png' })));
  assert.ok(await storage.validateImageFile(new File([png], 'image.jpg', { type: 'image/jpeg' })));
  assert.ok(await storage.validateImageFile(new File(['<svg/>'], 'image.svg', { type: 'image/svg+xml' })));
  assert.ok(await storage.validateImageFile(new File([new Uint8Array(3 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' })));
  await storage.uploadPublicMedia(validImage, 'reviews');
  assert.match(uploadedPath, /^reviews\/[^/]+\.png$/);
  assert.equal(uploadedPath.includes('misleading'), false);

  let reviewInserted = false;
  const reviewRoute = load('app/api/reviews/route.ts', {
    '@/lib/storage': storage,
    '@/lib/supabaseAdmin': { getAdminClient: () => ({ from: () => ({ insert: async () => { reviewInserted = true; return { error: null }; } }) }) },
  });
  const reviewForm = new FormData();
  for (const [key, value] of Object.entries({ displayName: 'Visitor', identityType: 'name', title: 'Work', description: 'Delivered map', rating: '5' })) reviewForm.set(key, value);
  reviewForm.set('image', new File(['<script>bad()</script>'], 'fake.png', { type: 'image/png' }));
  assert.equal((await reviewRoute.POST(new Request('https://portfolio.test/api/reviews', { method: 'POST', headers: { origin: 'https://portfolio.test' }, body: reviewForm }))).status, 400);
  assert.equal(reviewInserted, false);

  let loggedIn = false;
  const login = load('app/api/admin/login/route.ts', { '@/lib/adminAuth': {
    getConfiguredPassword: () => 'correct', passwordMatches: auth.passwordMatches,
    setAdminSession: async () => { loggedIn = true; },
  } });
  assert.equal((await login.POST(jsonRequest('{"password":"wrong"}'))).status, 401);
  assert.equal(loggedIn, false);
  assert.equal((await login.POST(jsonRequest('{"password":"correct"}'))).status, 200);
  assert.equal(loggedIn, true);
  const denied = { '@/lib/adminAuth': { isAdminAuthenticated: async () => false } };
  for (const file of ['content', 'reviews', 'stats', 'upload']) {
    const route = load(`app/api/admin/${file}/route.ts`, denied);
    const handler = route.POST || route.PATCH;
    assert.equal((await handler(jsonRequest('{}'))).status, 401, file);
  }

  const { middleware } = load('middleware.ts');
  const request = (route, options = {}) => new NextRequest(`https://portfolio.test${route}`, {
    method: 'POST', headers: { origin: 'https://portfolio.test', ...options },
  });
  assert.equal(middleware(request('/api/admin/content', { origin: 'https://evil.test' })).status, 403);
  assert.equal(middleware(request('/api/%61dmin/content/', { origin: 'https://evil.test' })).status, 403);
  assert.equal(middleware(request('/api/admin/content', { 'Content-Length': String(1024 * 1024 + 1) })).status, 413);
  assert.equal(middleware(new NextRequest('https://portfolio.test/api/admin/session')).headers.get('Cache-Control'), 'private, no-store, max-age=0');
  for (let i = 0; i < 8; i++) assert.equal(middleware(request('/api/admin/login')).status, 200);
  const limited = middleware(request('/api/admin/login'));
  assert.equal(limited.status, 429);
  assert.equal(middleware(request('/api/%61dmin/login/')).status, 429);
  assert.ok(Number(limited.headers.get('Retry-After')) > 0);

  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  const config = load('next.config.ts').default;
  const headers = Object.fromEntries((await config.headers())[0].headers.map(item => [item.key, item.value]));
  assert.equal(headers['X-Content-Type-Options'], 'nosniff');
  assert.equal(headers['X-Frame-Options'], 'DENY');
  assert.match(headers['Content-Security-Policy'], /frame-ancestors 'none'/);
  assert.match(headers['Content-Security-Policy'], /https:\/\/www.youtube-nocookie.com/);
  assert.equal(headers['Content-Security-Policy'].includes('unsafe-eval'), false);
  if (previousNodeEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previousNodeEnv;
  console.log('PASS security: session tampering/expiry, secure cookie, login, authorization, CSRF, throttling, bounded JSON/forms, forged uploads, safe extensions, CSP/headers');
})().catch(error => { console.error(error); process.exitCode = 1; });
