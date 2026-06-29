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

async function seedTemplates() {
  console.log('Seeding templates...');

  const templates = [
    {
      name: '都市逆袭爽剧模板',
      type: 'short_drama' as const,
      description: '经典都市逆袭题材，重生+打脸+商业成功元素，高完播率保障',
      isPublic: true,
      config: {
        genre: '都市逆袭',
        episodeCount: 10,
        episodeDuration: 30,
        tone: '爽感',
        targetPlatform: '抖音/快手',
        plotSummary: '主角意外重生，凭借前世记忆抓住机遇，从底层逆袭成为人生赢家',
        brief: {
          style: '快节奏、强反转、爽感十足',
          duration: 300,
        },
        script: {
          title: '都市逆袭爽剧',
          totalDuration: 300,
          scenes: [
            { id: 'scene-1', sceneNumber: 1, title: '第1集 - 重生归来', description: '主角意外重生，发现回到十年前', duration: 30, dialogue: '', voiceover: '如果人生可以重来...', visualDescription: '医院病房，主角醒来，震惊的表情', cameraAngle: '特写', location: '医院', characters: ['主角'], bgm: '悬疑紧张' },
            { id: 'scene-2', sceneNumber: 2, title: '第2集 - 抓住机遇', description: '主角凭借记忆抓住第一个商机', duration: 30, dialogue: '', voiceover: '这一世，我要改写命运', visualDescription: '股票交易所/投资场景', cameraAngle: '中景', location: '金融街', characters: ['主角'], bgm: '激昂向上' },
            { id: 'scene-3', sceneNumber: 3, title: '第3集 - 初露锋芒', description: '主角小试牛刀，引起关注', duration: 30, dialogue: '', voiceover: '好戏才刚刚开始', visualDescription: '商业谈判场景', cameraAngle: '全景', location: '会议室', characters: ['主角', '对手'], bgm: '紧张对峙' },
          ],
        },
      },
    },
    {
      name: '甜宠爱情短剧模板',
      type: 'short_drama' as const,
      description: '甜蜜恋爱题材，霸道总裁+灰姑娘，高甜高糖',
      isPublic: true,
      config: {
        genre: '甜宠爱情',
        episodeCount: 8,
        episodeDuration: 25,
        tone: '甜蜜',
        targetPlatform: '抖音/快手',
        plotSummary: '平凡女孩意外邂逅霸道总裁，从欢喜冤家到甜蜜相爱',
        brief: {
          style: '甜蜜、温馨、浪漫',
          duration: 200,
        },
      },
    },
    {
      name: '企业宣传片模板',
      type: 'corporate_video' as const,
      description: '标准企业宣传片结构，品牌实力+产品服务+团队文化',
      isPublic: true,
      config: {
        videoType: '企业宣传片',
        duration: 120,
        brief: {
          style: '专业、大气、科技感',
          duration: 120,
        },
        keySellingPoints: ['技术领先', '团队专业', '服务优质', '创新能力强'],
        callToAction: '立即访问官网，了解更多',
        script: {
          title: '企业宣传片',
          totalDuration: 120,
          scenes: [
            { id: 'scene-1', sceneNumber: 1, title: '开篇 - 品牌亮相', description: '企业Logo演绎，震撼开场', duration: 15, voiceover: '在时代的浪潮中，我们始终引领前行', visualDescription: '城市天际线+企业Logo', cameraAngle: '航拍', location: '城市', characters: [], bgm: '恢弘大气' },
            { id: 'scene-2', sceneNumber: 2, title: '企业实力', description: '展示企业规模、发展历程', duration: 25, voiceover: '历经多年发展，已成为行业领先企业', visualDescription: '办公环境、团队照片、荣誉资质', cameraAngle: '全景', location: '公司', characters: ['员工'], bgm: '稳健有力' },
            { id: 'scene-3', sceneNumber: 3, title: '产品/服务', description: '核心产品或服务介绍', duration: 30, voiceover: '我们致力于为客户提供最优质的产品和服务', visualDescription: '产品展示、服务流程', cameraAngle: '中景', location: '展厅', characters: [], bgm: '现代科技' },
            { id: 'scene-4', sceneNumber: 4, title: '团队文化', description: '团队展示，企业文化', duration: 25, voiceover: '拥有一支专业、高效、充满激情的团队', visualDescription: '团队协作、团建活动', cameraAngle: '中景', location: '办公区', characters: ['团队'], bgm: '温馨活力' },
            { id: 'scene-5', sceneNumber: 5, title: '结尾 - 展望未来', description: '愿景展望，号召行动', duration: 25, voiceover: '期待与您携手，共创美好未来', visualDescription: '日出/未来城市+联系方式', cameraAngle: '航拍', location: '城市', characters: [], bgm: '激昂升华' },
          ],
        },
      },
    },
    {
      name: '产品介绍视频模板',
      type: 'corporate_video' as const,
      description: '产品发布/介绍视频，突出卖点和优势',
      isPublic: true,
      config: {
        videoType: '产品介绍',
        duration: 60,
        brief: {
          style: '科技感、现代、简洁',
          duration: 60,
        },
      },
    },
    {
      name: '城市文旅宣传片模板',
      type: 'tourism_promo' as const,
      description: '标准城市文旅宣传结构，风光+人文+美食+体验',
      isPublic: true,
      config: {
        durationDays: 3,
        theme: '城市旅游',
        brief: {
          style: '唯美、大气、治愈',
          duration: 180,
        },
        script: {
          title: '城市文旅宣传片',
          totalDuration: 180,
          scenes: [
            { id: 'scene-1', sceneNumber: 1, title: '开篇 - 大美风光', description: '航拍全景，震撼开场', duration: 30, voiceover: '这里，是一片神奇而美丽的土地', visualDescription: '城市全景航拍，日出或日落', cameraAngle: '航拍', location: '城市', characters: [], bgm: '恢弘大气' },
            { id: 'scene-2', sceneNumber: 2, title: '自然之美', description: '自然风光展示', duration: 30, voiceover: '大自然的鬼斧神工，令人叹为观止', visualDescription: '山川湖泊、森林花海', cameraAngle: '全景', location: '自然景区', characters: ['游客'], bgm: '清新自然' },
            { id: 'scene-3', sceneNumber: 3, title: '人文历史', description: '历史文化古迹', duration: 30, voiceover: '悠久的历史，灿烂的文化', visualDescription: '古迹、博物馆、传统文化', cameraAngle: '中景', location: '历史街区', characters: [], bgm: '古朴悠远' },
            { id: 'scene-4', sceneNumber: 4, title: '特色美食', description: '当地美食展示', duration: 30, voiceover: '独特的美食，让味蕾尽情绽放', visualDescription: '特色小吃、美食街', cameraAngle: '特写', location: '美食街', characters: ['食客'], bgm: '欢快热闹' },
            { id: 'scene-5', sceneNumber: 5, title: '结尾 - 相约之旅', description: '美景回顾，热情邀请', duration: 60, voiceover: '我们在这里等您！', visualDescription: '美景混剪+微笑镜头', cameraAngle: '全景', location: '各景点', characters: [], bgm: '温暖感人' },
          ],
        },
      },
    },
    {
      name: '景区推广视频模板',
      type: 'tourism_promo' as const,
      description: '单一景区深度推广，突出特色和亮点',
      isPublic: true,
      config: {
        theme: '景区推广',
        brief: {
          style: '唯美、震撼、沉浸式',
          duration: 90,
        },
      },
    },
  ];

  for (const tpl of templates) {
    const existing = await prisma.projectTemplate.findFirst({
      where: { name: tpl.name },
    });

    if (!existing) {
      await prisma.projectTemplate.create({
        data: {
          name: tpl.name,
          type: tpl.type,
          description: tpl.description,
          isPublic: tpl.isPublic,
          config: toJSON(tpl.config),
        },
      });
      console.log('Template created:', tpl.name);
    } else {
      console.log('Template already exists:', tpl.name);
    }
  }
}

main()
  .then(() => seedTemplates())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
