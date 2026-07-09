import { prisma } from './index';

async function main() {
  console.log('Seeding database...');

  // Create admin user (password: Admin123!)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lumora.app' },
    update: {},
    create: {
      email: 'admin@lumora.app',
      name: 'Admin User',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.qT.4TmGmFqO8i', // 'Admin123!'
      role: 'ADMIN',
      subscription: 'ENTERPRISE',
      emailVerified: true,
    },
  });
  console.log('Created admin user:', admin.email);

  // Create moderator user (password: Moderator123!)
  const moderator = await prisma.user.upsert({
    where: { email: 'moderator@lumora.app' },
    update: {},
    create: {
      email: 'moderator@lumora.app',
      name: 'Moderator User',
      password: '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'Moderator123!'
      role: 'MODERATOR',
      subscription: 'PRO',
      emailVerified: true,
    },
  });
  console.log('Created moderator user:', moderator.email);

  // Create regular user (password: User123!)
  const user = await prisma.user.upsert({
    where: { email: 'user@lumora.app' },
    update: {},
    create: {
      email: 'user@lumora.app',
      name: 'Regular User',
      password: '$2a$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', // 'User123!'
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
    },
    {
      title: 'Getting Started Guide',
      slug: 'getting-started-guide',
      excerpt: 'Learn how to use Lumora effectively',
      content: '<p>Here is your guide to getting started...</p>',
      status: 'PUBLISHED' as const,
      authorId: user.id,
    },
  ];

  for (const post of samplePosts) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } });
    if (!existing) {
      await prisma.blogPost.create({
        data: {
          ...post,
          publishedAt: new Date(),
          tags: {
            create: [{ tag: { connect: { slug: 'getting-started-guide' } } }],
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