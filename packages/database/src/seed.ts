import { prisma } from './index';

async function main() {
  console.log('Seeding database...');

  await prisma.user.deleteMany({
    where: { email: { in: ['admin@lumora.app', 'moderator@lumora.app', 'user@lumora.app'] } },
  });

  // Create admin user (password: Admin123!)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@lumora.app',
      name: 'Admin User',
      password: '$2a$12$fiN0JnKrynfYVOZweg/IUORwqfN11Vzw7.i6aYR4UpASCdJujUQJW', // 'Admin123!'
      role: 'ADMIN',
      subscription: 'ENTERPRISE',
      emailVerified: true,
    },
  });
  console.log('Created admin user:', admin.email);

  // Create moderator user (password: Moderator123!)
  const moderator = await prisma.user.create({
    data: {
      email: 'moderator@lumora.app',
      name: 'Moderator User',
      password: '$2a$12$XCHTpT6WaMj1d2MtRI04UuGOb8kzP7/LNdH5X/ZiIMlupOA3YJqs6', // 'Moderator123!'
      role: 'MODERATOR',
      subscription: 'PRO',
      emailVerified: true,
    },
  });
  console.log('Created moderator user:', moderator.email);

  // Create regular user (password: User123!)
  const user = await prisma.user.create({
    data: {
      email: 'user@lumora.app',
      name: 'Regular User',
      password: '$2a$12$6JJ6dCXwH3Ux1eiZoxj1aeTjt6hWuDV6tLFqj4dvZXDf8MpjG7sia', // 'User123!'
      role: 'USER',
      subscription: 'FREE',
      emailVerified: true,
    },
  });
  console.log('Created regular user:', user.email);

  // Create sample blog tags
  const tags = ['Technology', 'Design', 'Development', 'Productivity'];
  for (const tagName of tags) {
    const tag = await prisma.blogTag.upsert({
      where: { slug: tagName.toLowerCase() },
      update: {},
      create: {
        name: tagName,
        slug: tagName.toLowerCase(),
      },
    });
    console.log('Created tag:', tag.name);
  }

  // Create sample blog posts
  const samplePosts = [
    {
      title: 'Welcome to Lumora',
      slug: 'welcome-to-lumora',
      excerpt: 'Your journey to clarity starts here',
      content: '<p>This is the first post on Lumora...</p>',
      status: 'PUBLISHED' as const,
      authorId: admin.id,
      tagNames: ['Technology'],
    },
    {
      title: 'Getting Started Guide',
      slug: 'getting-started-guide',
      excerpt: 'Learn how to use Lumora effectively',
      content: '<p>Here is your guide to getting started...</p>',
      status: 'PUBLISHED' as const,
      authorId: user.id,
      tagNames: ['Development'],
    },
  ];

  for (const post of samplePosts) {
    const { tagNames, ...postData } = post;
    const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } });
    if (!existing) {
      const tagRecords = await Promise.all(
        tagNames.map(async (name) =>
          prisma.blogTag.upsert({
            where: { slug: name.toLowerCase() },
            update: {},
            create: { name, slug: name.toLowerCase() },
          }),
        ),
      );
      await prisma.blogPost.create({
        data: {
          ...postData,
          publishedAt: new Date(),
          tags: {
            create: tagRecords.map((tag) => ({ tag: { connect: { id: tag.id } } })),
          },
        },
      });
      console.log('Created post:', post.title);
    }
  }

  // Create default settings
  const settings = [
    { key: 'app_name', value: 'Lumora' },
    { key: 'max_file_size', value: '52428800' },
    { key: 'allowed_file_types', value: 'image/*,video/*,application/pdf' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
    console.log('Created setting:', setting.key);
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
