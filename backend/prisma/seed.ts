/**
 * Database Seed Script.
 *
 * Populates the database with initial data for development.
 * Run with: npx tsx prisma/seed.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Create Admin User ─────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@eato.com' },
    update: {},
    create: {
      email: 'admin@eato.com',
      password: adminPassword,
      name: 'Admin',
      role: 'admin',
    },
  });
  console.log(`  ✅ Admin user: ${admin.email}`);

  // ── Create Staff User ─────────────────────────────────────
  const staffPassword = await bcrypt.hash('Staff123!', 12);
  const staff = await prisma.user.upsert({
    where: { email: 'staff@eato.com' },
    update: {},
    create: {
      email: 'staff@eato.com',
      password: staffPassword,
      name: 'John Server',
      role: 'staff',
    },
  });
  console.log(`  ✅ Staff user: ${staff.email}`);

  // ── Create Kitchen User ───────────────────────────────────
  const kitchen = await prisma.user.upsert({
    where: { email: 'kitchen@eato.com' },
    update: {},
    create: {
      email: 'kitchen@eato.com',
      password: staffPassword,
      name: 'Jane Chef',
      role: 'kitchen',
    },
  });
  console.log(`  ✅ Kitchen user: ${kitchen.email}`);

  // ── Create Demo Customer ──────────────────────────────────
  const customerPassword = await bcrypt.hash('Customer123!', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@eato.com' },
    update: {},
    create: {
      email: 'customer@eato.com',
      password: customerPassword,
      name: 'Alice Customer',
      phone: '+1234567890',
      role: 'customer',
    },
  });
  console.log(`  ✅ Customer user: ${customer.email}`);

  // ── Create Menu Categories ────────────────────────────────
  const categories = await Promise.all([
    prisma.menuCategory.upsert({
      where: { id: 'cat-appetizers' },
      update: {},
      create: {
        id: 'cat-appetizers',
        name: 'Appetizers',
        description: 'Start your meal with our delicious starters',
        sortOrder: 1,
      },
    }),
    prisma.menuCategory.upsert({
      where: { id: 'cat-mains' },
      update: {},
      create: {
        id: 'cat-mains',
        name: 'Main Course',
        description: 'Hearty and satisfying main dishes',
        sortOrder: 2,
      },
    }),
    prisma.menuCategory.upsert({
      where: { id: 'cat-desserts' },
      update: {},
      create: {
        id: 'cat-desserts',
        name: 'Desserts',
        description: 'Sweet endings to your meal',
        sortOrder: 3,
      },
    }),
    prisma.menuCategory.upsert({
      where: { id: 'cat-drinks' },
      update: {},
      create: {
        id: 'cat-drinks',
        name: 'Drinks',
        description: 'Refreshing beverages',
        sortOrder: 4,
      },
    }),
  ]);
  console.log(`  ✅ ${categories.length} menu categories`);

  // ── Create Menu Items ─────────────────────────────────────
  const menuItems = await Promise.all([
    // Appetizers
    prisma.menuItem.create({
      data: {
        categoryId: 'cat-appetizers',
        name: 'Spring Rolls',
        description: 'Crispy vegetable spring rolls with sweet chili sauce',
        price: 899,
        tags: ['vegetarian', 'crispy'],
        preparationTime: 10,
        isFeatured: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: 'cat-appetizers',
        name: 'Garlic Bread',
        description: 'Toasted bread with garlic butter and herbs',
        price: 599,
        tags: ['vegetarian'],
        preparationTime: 8,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: 'cat-appetizers',
        name: 'Chicken Wings',
        description: 'Spicy buffalo wings with blue cheese dip',
        price: 1299,
        tags: ['spicy', 'protein'],
        preparationTime: 15,
        isFeatured: true,
      },
    }),

    // Main Course
    prisma.menuItem.create({
      data: {
        categoryId: 'cat-mains',
        name: 'Grilled Salmon',
        description: 'Atlantic salmon with lemon butter sauce and seasonal vegetables',
        price: 2499,
        tags: ['seafood', 'healthy'],
        preparationTime: 20,
        isFeatured: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: 'cat-mains',
        name: 'Beef Steak',
        description: '250g ribeye steak with mashed potatoes and gravy',
        price: 3299,
        tags: ['protein', 'premium'],
        preparationTime: 25,
        isFeatured: true,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: 'cat-mains',
        name: 'Pasta Carbonara',
        description: 'Classic Italian pasta with pancetta and parmesan',
        price: 1699,
        tags: ['pasta', 'italian'],
        preparationTime: 18,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: 'cat-mains',
        name: 'Veggie Burger',
        description: 'Plant-based burger with avocado and sweet potato fries',
        price: 1499,
        tags: ['vegetarian', 'vegan-option'],
        preparationTime: 15,
      },
    }),

    // Desserts
    prisma.menuItem.create({
      data: {
        categoryId: 'cat-desserts',
        name: 'Chocolate Cake',
        description: 'Rich dark chocolate cake with vanilla ice cream',
        price: 999,
        tags: ['sweet', 'chocolate'],
        preparationTime: 5,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: 'cat-desserts',
        name: 'Tiramisu',
        description: 'Classic Italian coffee-flavored dessert',
        price: 899,
        tags: ['sweet', 'coffee'],
        preparationTime: 5,
        isFeatured: true,
      },
    }),

    // Drinks
    prisma.menuItem.create({
      data: {
        categoryId: 'cat-drinks',
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed orange juice',
        price: 499,
        tags: ['fresh', 'healthy'],
        preparationTime: 3,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: 'cat-drinks',
        name: 'Iced Lemon Tea',
        description: 'Refreshing iced tea with lemon',
        price: 399,
        tags: ['refreshing'],
        preparationTime: 3,
      },
    }),
    prisma.menuItem.create({
      data: {
        categoryId: 'cat-drinks',
        name: 'Espresso',
        description: 'Double shot of premium espresso',
        price: 349,
        tags: ['coffee', 'hot'],
        preparationTime: 3,
      },
    }),
  ]);
  console.log(`  ✅ ${menuItems.length} menu items`);

  // ── Create Tables ─────────────────────────────────────────
  const tables = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      prisma.table.upsert({
        where: { number: i + 1 },
        update: {},
        create: {
          number: i + 1,
          capacity: i < 4 ? 2 : i < 8 ? 4 : 6,
        },
      })
    )
  );
  console.log(`  ✅ ${tables.length} tables`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Login credentials:');
  console.log('  Admin:    admin@eato.com / Admin123!');
  console.log('  Staff:    staff@eato.com / Staff123!');
  console.log('  Kitchen:  kitchen@eato.com / Staff123!');
  console.log('  Customer: customer@eato.com / Customer123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
