import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo users
  const passwordHash = await bcrypt.hash('password123', 12);

  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      name: 'Alice Johnson',
      passwordHash,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      name: 'Bob Smith',
      passwordHash,
    },
  });

  // Create demo blogs
  const blogs = [
    {
      userId: user1.id,
      title: 'Getting Started with NestJS',
      slug: 'getting-started-with-nestjs',
      content: `NestJS is a progressive Node.js framework for building efficient, reliable and scalable server-side applications. It uses progressive JavaScript, is built with TypeScript (preserves compatibility with pure JavaScript) and combines elements of OOP, FP, and FRP.\n\nNest provides an out-of-the-box application architecture which allows developers and teams to create highly testable, scalable, loosely coupled, and easily maintainable applications. The architecture is heavily inspired by Angular.`,
      summary: 'NestJS is a progressive Node.js framework for building efficient, reliable and scalable server-side applications...',
      isPublished: true,
    },
    {
      userId: user1.id,
      title: 'Prisma ORM Best Practices',
      slug: 'prisma-orm-best-practices',
      content: `Prisma is a next-generation ORM that makes working with databases easy for application developers. It provides a type-safe query builder, automated migrations, and a visual database browser.\n\nHere are some best practices:\n1. Always use select to limit returned fields\n2. Use include wisely to avoid N+1 queries\n3. Leverage Prisma's transaction API for complex operations\n4. Create proper indexes for frequently queried fields`,
      summary: 'Prisma is a next-generation ORM that makes working with databases easy for application developers...',
      isPublished: true,
    },
    {
      userId: user2.id,
      title: 'Building a Secure Authentication System',
      slug: 'building-secure-authentication-system',
      content: `Authentication is one of the most critical aspects of any web application. In this post, we'll explore how to build a secure JWT-based authentication system.\n\nKey principles:\n- Always hash passwords with bcrypt (12+ rounds)\n- Use short-lived access tokens (15 min)\n- Implement refresh tokens for seamless UX\n- Validate all inputs server-side\n- Never expose sensitive data in responses`,
      summary: 'Authentication is one of the most critical aspects of any web application...',
      isPublished: true,
    },
    {
      userId: user2.id,
      title: 'Draft: My Upcoming Post',
      slug: 'draft-upcoming-post',
      content: 'This is a draft post that should not be visible on the public feed.',
      summary: 'This is a draft post...',
      isPublished: false,
    },
  ];

  for (const blog of blogs) {
    await prisma.blog.upsert({
      where: { slug: blog.slug },
      update: {},
      create: blog,
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log(`Created ${2} users and ${blogs.length} blogs`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
