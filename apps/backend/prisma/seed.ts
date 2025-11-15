import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@omniforge.dev' },
    update: {},
    create: {
      email: 'demo@omniforge.dev',
      name: 'Demo User',
      clerkId: 'demo_user_123',
    },
  });

  console.log('✅ Created demo user:', demoUser.email);

  // Create demo idea
  const demoIdea = await prisma.idea.create({
    data: {
      userId: demoUser.id,
      title: 'Telemedicine App Demo',
      description: 'A telemedicine app for remote consultations with video calls, prescription management, and appointment scheduling',
      rawInput: 'I want to build a telemedicine platform where patients can book appointments, have video consultations with doctors, and receive digital prescriptions. The app should support both web and mobile.',
      status: 'PARSED',
      branch: 'main',
      specJson: {
        version: '1.0.0',
        name: 'Telemedicine App Demo',
        pages: [
          { id: 'home', name: 'Home', path: '/' },
          { id: 'dashboard', name: 'Dashboard', path: '/dashboard' },
        ],
        dataModels: [
          { name: 'User', fields: [] },
          { name: 'Appointment', fields: [] },
        ],
        apis: [
          { path: '/api/appointments', method: 'GET' },
        ],
        integrations: [
          { name: 'Zoom', type: 'video' },
        ],
        ui: { theme: 'light', primaryColor: '#2563eb' },
      },
    },
  });

  console.log('✅ Created demo idea:', demoIdea.id);

  // Create demo project
  const demoProject = await prisma.project.create({
    data: {
      ideaId: demoIdea.id,
      userId: demoUser.id,
      name: 'Telemedicine App',
      description: 'Generated from telemedicine idea',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Created demo project:', demoProject.id);

  // Create demo design tokens
  const tokens = [
    { key: 'color.primary', value: '#2563eb', category: 'colors' },
    { key: 'color.secondary', value: '#8b5cf6', category: 'colors' },
    { key: 'spacing.md', value: '1rem', category: 'spacing' },
    { key: 'font.family', value: 'Inter, sans-serif', category: 'typography' },
  ];

  for (const token of tokens) {
    await prisma.designToken.upsert({
      where: {
        projectId_key: {
          projectId: demoProject.id,
          key: token.key,
        },
      },
      update: {},
      create: {
        projectId: demoProject.id,
        key: token.key,
        value: token.value,
        category: token.category,
      },
    });
  }

  console.log('✅ Created demo design tokens');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

