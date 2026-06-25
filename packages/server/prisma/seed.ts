import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function toJSON(val: any): string | null {
  if (val === null || val === undefined) return null;
  return JSON.stringify(val);
}

async function main() {
  console.log('Seeding database...');

  // Create demo profile (this would be created by Supabase Auth in production)
  const profile = await prisma.profile.upsert({
    where: { userId: 'demo-user-id' },
    update: {},
    create: {
      userId: 'demo-user-id',
      email: 'demo@aigc-mas.com',
      name: '演示用户',
      role: 'creator',
    },
  });

  console.log('Demo profile created:', profile.name);

  const demoProjects = [
    {
      name: '都市逆袭爽剧《重生之我要当首富》',
      type: 'short_drama' as const,
      description: '一部都市逆袭题材的短剧，讲述主角重生后抓住机遇逆袭人生的故事。',
      brief: {
        title: '重生之我要当首富',
        targetAudience: '18-35岁年轻观众，偏好爽剧，逆袭题材',
        duration: 90,
        style: '快节奏、强反转、爽感十足',
        objectives: ['打造高完播率短剧', '吸引粉丝关注', '商业变现'],
        keyMessages: ['命运掌握在自己手中', '努力终有回报'],
      },
      tags: ['短剧', '都市', '逆袭', '爽剧'],
      shortDrama: {
        genre: '都市逆袭',
        episodeCount: 3,
        episodeDuration: 30,
        tone: '爽感',
        targetPlatform: '抖音/快手',
        plotSummary: '主角意外重生回到十年前，凭借前世记忆抓住每一个机遇，从一无所有到商业巨鳄，同时收获了真挚的爱情。',
      },
    },
    {
      name: '智创科技企业宣传片',
      type: 'corporate_video' as const,
      description: '为智创科技有限公司制作的企业品牌宣传片，展示企业实力与未来愿景。',
      brief: {
        title: '智创科技 - 引领智能未来',
        targetAudience: '企业客户、合作伙伴、投资者',
        duration: 120,
        style: '科技感，专业、大气',
        objectives: ['展示企业实力', '提升品牌形象', '吸引合作'],
        keyMessages: ['科技创新，引领未来', '专业可靠，值得信赖'],
      },
      tags: ['企业宣传', '科技', '品牌'],
      corporateVideo: {
        companyName: '智创科技有限公司',
        industry: '人工智能/科技',
        videoType: '企业宣传片',
        keySellingPoints: ['技术领先', '团队专业', '服务优质', '创新能力强'],
        callToAction: '立即访问官网，了解更多',
      },
    },
    {
      name: '丽江古城文旅宣传片',
      type: 'tourism_promo' as const,
      description: '丽江古城文化旅游宣传视频，展现古城魅力与纳西文化。',
      brief: {
        title: '丽江 - 遇见最美的时光',
        targetAudience: '国内游客、文化爱好者、摄影爱好者',
        duration: 180,
        style: '唯美、文艺、治愈',
        objectives: ['提升旅游知名度', '吸引游客前往', '展示文化魅力'],
        keyMessages: ['丽江，一个来了就不想走的地方', '感受纳西文化，体验慢生活'],
      },
      tags: ['文旅', '丽江', '古城', '旅游'],
      tourismPromo: {
        location: '云南丽江古城',
        attractions: ['丽江古城', '玉龙雪山', '束河古镇', '泸沽湖'],
        culturalHighlights: ['纳西族文化', '东巴文', '白沙壁画', '纳西古乐'],
        targetTravelers: '情侣、家庭、文化爱好者',
        season: '四季皆宜，春秋最佳',
        durationDays: 5,
      },
    },
  ];

  for (const dp of demoProjects) {
    const { shortDrama, corporateVideo, tourismPromo, ...projectData } = dp as any;

    const project = await prisma.project.create({
      data: {
        ...projectData,
        ownerId: profile.id,
        status: 'draft',
        progress: 0,
      },
    });

    if (shortDrama) {
      await prisma.shortDramaProject.create({
        data: { ...shortDrama, projectId: project.id },
      });
    }
    if (corporateVideo) {
      await prisma.corporateVideoProject.create({
        data: { ...corporateVideo, projectId: project.id },
      });
    }
    if (tourismPromo) {
      await prisma.tourismPromoProject.create({
        data: { ...tourismPromo, projectId: project.id },
      });
    }

    console.log('Project created:', project.name);
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
