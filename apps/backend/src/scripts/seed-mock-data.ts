import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Simple hash function for demo (use bcrypt in production)
const hashPassword = (password: string) => crypto.createHash('sha256').update(password).digest('hex');

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create a Market Environment
  const market = await prisma.market.create({
    data: {
      name: 'Central Tech Market',
      location: 'Central_Instance_1',
      environmentId: 'cyber_district_v1'
    },
  });
  console.log(`✅ Market created: ${market.name}`);

  // 2. Create the "Mock Vendor" Account
  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor@test.com' },
    update: {},
    create: {
      email: 'vendor@test.com',
      passwordHash: hashPassword('vendor123'),
      role: 'VENDOR',
      fullName: 'Test Vendor',
      walletAddress: '0x123...abc'
    },
  });
  console.log(`✅ Mock Vendor created: ${vendorUser.email} / vendor123`);

  // 3. Create Vendor Profile
  const vendorProfile = await prisma.vendorProfile.create({
    data: {
      userId: vendorUser.id,
      storeName: 'CyberGadgets',
      description: 'The best futuristic tech in the market.',
      isVerified: true,
      rating: 4.8
    }
  });

  // 4. Create a Stall for the Vendor
  const stall = await prisma.stall.create({
    data: {
      name: 'Stall 101 - CyberGadgets',
      marketId: market.id,
      vendorId: vendorProfile.id,
    }
  });
  console.log(`✅ Mock Stall created: ${stall.name}`);

  // 5. Add Products to the Stall (with 3D coordinates)
  await prisma.product.createMany({
    data: [
      {
        name: 'Quantum Processor',
        description: 'Next-gen computing power.',
        price: 299.99,
        category: 'Electronics',
        stallId: stall.id,
        meshId: 'cpu_v2.glb',
        positionX: -1.5, positionY: 1.2, positionZ: -0.5
      },
      {
        name: 'Holographic Display',
        description: '3D projection unit.',
        price: 150.00,
        category: 'Displays',
        stallId: stall.id,
        meshId: 'holo_projector.glb',
        positionX: 1.5, positionY: 1.2, positionZ: -0.5
      }
    ]
  });
  console.log(`✅ Added products to stall.`);

  // 6. Create "Mock User" Account
  const normalUser = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      passwordHash: hashPassword('user123'),
      role: 'BUYER',
      fullName: 'Test User',
    },
  });
  console.log(`✅ Mock User created: ${normalUser.email} / user123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
