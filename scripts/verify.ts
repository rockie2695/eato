/**
 * Project Verification Script.
 *
 * Checks that the project structure matches the prompt requirements.
 * Run with: npx tsx scripts/verify.ts
 */

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '..');

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: CheckResult[] = [];

function check(name: string, condition: boolean, message: string) {
  results.push({ name, passed: condition, message });
  console.log(`${condition ? '✅' : '❌'} ${name}: ${message}`);
}

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function dirExists(relativePath: string): boolean {
  const fullPath = path.join(ROOT, relativePath);
  return fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
}

// ─── Monorepo Structure ────────────────────────────────────────

console.log('\n📦 Monorepo Structure');
check('Root package.json', fileExists('package.json'), 'Root package.json exists');
check('pnpm-workspace.yaml', fileExists('pnpm-workspace.yaml'), 'pnpm workspace config exists');
check('Root tsconfig.json', fileExists('tsconfig.json'), 'Root tsconfig exists');
check('.gitignore', fileExists('.gitignore'), '.gitignore exists');

// ─── Shared Package ────────────────────────────────────────────

console.log('\n📦 Shared Package');
check('shared/package.json', fileExists('packages/shared/package.json'), 'Shared package.json exists');
check('shared/tsconfig.json', fileExists('packages/shared/tsconfig.json'), 'Shared tsconfig exists');
check('shared/src/index.ts', fileExists('packages/shared/src/index.ts'), 'Shared index.ts exists');
check('shared/src/api/', dirExists('packages/shared/src/api'), 'API client directory exists');
check('shared/src/types/', dirExists('packages/shared/src/types'), 'Types directory exists');
check('shared/src/stores/', dirExists('packages/shared/src/stores'), 'Stores directory exists');
check('shared/src/utils/', dirExists('packages/shared/src/utils'), 'Utils directory exists');
check('shared/src/constants/', dirExists('packages/shared/src/constants'), 'Constants directory exists');

// ─── Web Package ───────────────────────────────────────────────

console.log('\n🌐 Web Package');
check('web/package.json', fileExists('packages/web/package.json'), 'Web package.json exists');
check('web/vite.config.ts', fileExists('packages/web/vite.config.ts'), 'Vite config exists');
check('web/tailwind.config.js', fileExists('packages/web/tailwind.config.js'), 'Tailwind config exists');
check('web/index.html', fileExists('packages/web/index.html'), 'index.html exists');
check('web/src/main.tsx', fileExists('packages/web/src/main.tsx'), 'main.tsx exists');
check('web/src/App.tsx', fileExists('packages/web/src/App.tsx'), 'App.tsx exists');
check('web/src/pages/', dirExists('packages/web/src/pages'), 'Pages directory exists');
check('web/src/components/', dirExists('packages/web/src/components'), 'Components directory exists');
check('web/src/hooks/', dirExists('packages/web/src/hooks'), 'Hooks directory exists');

// ─── Mobile Package ────────────────────────────────────────────

console.log('\n📱 Mobile Package');
check('mobile/package.json', fileExists('packages/mobile/package.json'), 'Mobile package.json exists');
check('mobile/app.json', fileExists('packages/mobile/app.json'), 'app.json exists');
check('mobile/App.tsx', fileExists('packages/mobile/App.tsx'), 'App.tsx exists');
check('mobile/src/screens/', dirExists('packages/mobile/src/screens'), 'Screens directory exists');
check('mobile/src/stores/', dirExists('packages/mobile/src/stores'), 'Stores directory exists');

// ─── Backend ───────────────────────────────────────────────────

console.log('\n🖥️ Backend');
check('backend/package.json', fileExists('backend/package.json'), 'Backend package.json exists');
check('backend/tsconfig.json', fileExists('backend/tsconfig.json'), 'Backend tsconfig exists');
check('backend/prisma/schema.prisma', fileExists('backend/prisma/schema.prisma'), 'Prisma schema exists');
check('backend/src/app.ts', fileExists('backend/src/app.ts'), 'Express app exists');
check('backend/src/server.ts', fileExists('backend/src/server.ts'), 'Server entry exists');
check('backend/src/config/', dirExists('backend/src/config'), 'Config directory exists');
check('backend/src/middleware/', dirExists('backend/src/middleware'), 'Middleware directory exists');
check('backend/src/modules/', dirExists('backend/src/modules'), 'Modules directory exists');
check('backend/src/socket/', dirExists('backend/src/socket'), 'Socket directory exists');

// ─── Backend Modules ───────────────────────────────────────────

console.log('\n📦 Backend Modules');
check('auth module', fileExists('backend/src/modules/auth/routes.ts'), 'Auth routes exist');
check('menu module', fileExists('backend/src/modules/menu/routes.ts'), 'Menu routes exist');
check('cart module', fileExists('backend/src/modules/cart/routes.ts'), 'Cart routes exist');
check('order module', fileExists('backend/src/modules/order/routes.ts'), 'Order routes exist');
check('payment module', fileExists('backend/src/modules/payment/routes.ts'), 'Payment routes exist');
check('staff module', fileExists('backend/src/modules/staff/routes.ts'), 'Staff routes exist');

// ─── Shared Features ───────────────────────────────────────────

console.log('\n🔧 Shared Features');
check('API client', fileExists('packages/shared/src/api/client.ts'), 'API client with platform adaptation');
check('Auth store', fileExists('packages/shared/src/stores/authStore.ts'), 'Auth store exists');
check('Cart store', fileExists('packages/shared/src/stores/cartStore.ts'), 'Cart store exists');
check('Order store', fileExists('packages/shared/src/stores/orderStore.ts'), 'Order store exists');
check('Theme store', fileExists('packages/shared/src/stores/themeStore.ts'), 'Theme store exists');

// ─── Web Features ──────────────────────────────────────────────

console.log('\n🎨 Web Features');
check('Home page', fileExists('packages/web/src/pages/home.tsx'), 'Home page exists');
check('Menu page', fileExists('packages/web/src/pages/menu.tsx'), 'Menu page exists');
check('Cart page', fileExists('packages/web/src/pages/cart.tsx'), 'Cart page exists');
check('Orders page', fileExists('packages/web/src/pages/orders.tsx'), 'Orders page exists');
check('Login page', fileExists('packages/web/src/pages/login.tsx'), 'Login page exists');
check('Register page', fileExists('packages/web/src/pages/register.tsx'), 'Register page exists');
check('Admin page', fileExists('packages/web/src/pages/admin.tsx'), 'Admin page exists');
check('Socket hook', fileExists('packages/web/src/hooks/useSocket.ts'), 'Socket hook exists');

// ─── Mobile Features ───────────────────────────────────────────

console.log('\n📱 Mobile Features');
check('Home screen', fileExists('packages/mobile/src/screens/HomeScreen.tsx'), 'Home screen exists');
check('Menu screen', fileExists('packages/mobile/src/screens/MenuScreen.tsx'), 'Menu screen exists');
check('Cart screen', fileExists('packages/mobile/src/screens/CartScreen.tsx'), 'Cart screen exists');
check('Orders screen', fileExists('packages/mobile/src/screens/OrdersScreen.tsx'), 'Orders screen exists');
check('Login screen', fileExists('packages/mobile/src/screens/LoginScreen.tsx'), 'Login screen exists');
check('Order detail screen', fileExists('packages/mobile/src/screens/OrderDetailScreen.tsx'), 'Order detail screen exists');

// ─── Documentation ─────────────────────────────────────────────

console.log('\n📚 Documentation');
check('README.md', fileExists('README.md'), 'README exists');
check('Architecture docs', fileExists('docs/architecture.md'), 'Architecture docs exist');
check('API docs', fileExists('docs/api.md'), 'API docs exist');
check('Deployment docs', fileExists('docs/deployment.md'), 'Deployment docs exist');
check('Development docs', fileExists('docs/development.md'), 'Development docs exist');

// ─── Deployment ────────────────────────────────────────────────

console.log('\n🚀 Deployment');
check('docker-compose.yml', fileExists('docker-compose.yml'), 'Docker compose exists');
check('Vercel config', fileExists('packages/web/vercel.json'), 'Vercel config exists');
check('.env.example', fileExists('backend/.env.example'), '.env.example exists');
check('LICENSE', fileExists('LICENSE'), 'LICENSE exists');

// ─── Tests ─────────────────────────────────────────────────────

console.log('\n🧪 Tests');
check('Shared utils tests', fileExists('packages/shared/src/__tests__/utils.test.ts'), 'Utils tests exist');
check('Shared constants tests', fileExists('packages/shared/src/__tests__/constants.test.ts'), 'Constants tests exist');
check('Shared stores tests', fileExists('packages/shared/src/__tests__/stores.test.ts'), 'Stores tests exist');
check('Backend auth validation tests', fileExists('backend/src/__tests__/auth-validation.test.ts'), 'Auth validation tests exist');
check('Backend menu validation tests', fileExists('backend/src/__tests__/menu-validation.test.ts'), 'Menu validation tests exist');
check('Backend order validation tests', fileExists('backend/src/__tests__/order-validation.test.ts'), 'Order validation tests exist');
check('Backend error handler tests', fileExists('backend/src/__tests__/errorHandler.test.ts'), 'Error handler tests exist');
check('Backend validate middleware tests', fileExists('backend/src/__tests__/validate.test.ts'), 'Validate middleware tests exist');

// ─── Summary ───────────────────────────────────────────────────

console.log('\n' + '='.repeat(50));
const passed = results.filter((r) => r.passed).length;
const failed = results.filter((r) => !r.passed).length;
const total = results.length;

console.log(`\n📊 Results: ${passed}/${total} checks passed`);

if (failed > 0) {
  console.log(`\n❌ Failed checks:`);
  results
    .filter((r) => !r.passed)
    .forEach((r) => console.log(`  - ${r.name}: ${r.message}`));
  process.exit(1);
} else {
  console.log('\n✅ All checks passed!');
  process.exit(0);
}
