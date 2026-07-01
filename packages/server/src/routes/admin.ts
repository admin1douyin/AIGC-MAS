import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { seedanceService } from '../services/seedanceService';
import { alipayService } from '../services/alipayService';

const router = Router();

const ADMIN_ROLES = ['super_admin', 'admin'];

function requireAdmin(req: Request, res: Response, next: any) {
  if (!req.profile || !ADMIN_ROLES.includes(req.profile.role)) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: '需要管理员权限' },
    });
  }
  next();
}

router.get('/config/:category', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { category } = req.params;

    const configs = await prisma.systemConfig.findMany({
      where: { category: category as any },
      select: {
        id: true,
        key: true,
        value: true,
        description: true,
        encrypted: true,
        updatedAt: true,
      },
      orderBy: { key: 'asc' },
    });

    const result = configs.map((c) => ({
      ...c,
      value: c.encrypted && c.value ? '********' : c.value,
    }));

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Get config error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

router.put('/config/:category', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const configData = req.body;

    if (typeof configData !== 'object' || configData === null) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: '配置数据格式错误' },
      });
    }

    const updates = [];

    for (const [key, value] of Object.entries(configData)) {
      if (value === '********') continue;

      const existing = await prisma.systemConfig.findUnique({
        where: {
          category_key: {
            category: category as any,
            key,
          },
        },
      });

      if (existing) {
        updates.push(
          prisma.systemConfig.update({
            where: { id: existing.id },
            data: {
              value: value as string,
              updatedBy: req.profile?.id,
            },
          })
        );
      } else {
        updates.push(
          prisma.systemConfig.create({
            data: {
              category: category as any,
              key,
              value: value as string,
              updatedBy: req.profile?.id,
            },
          })
        );
      }
    }

    await Promise.all(updates);

    seedanceService.clearCache();
    alipayService.clearCache();

    const updatedConfigs = await prisma.systemConfig.findMany({
      where: { category: category as any },
      select: {
        id: true,
        key: true,
        value: true,
        description: true,
        encrypted: true,
        updatedAt: true,
      },
      orderBy: { key: 'asc' },
    });

    const result = updatedConfigs.map((c) => ({
      ...c,
      value: c.encrypted && c.value ? '********' : c.value,
    }));

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Update config error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

router.get('/status/seedance', requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const isConfigured = await seedanceService.isConfigured();

    let connectionStatus = 'unconfigured';
    let errorMsg = '';

    if (isConfigured) {
      try {
        const result = await seedanceService.generateVideo({
          prompt: 'test',
          duration: 1,
        });
        connectionStatus = result.status === 'failed' && result.error?.includes('未配置')
          ? 'unconfigured'
          : result.status === 'failed'
            ? 'error'
            : 'connected';
        if (result.status === 'failed') {
          errorMsg = result.error || '';
        }
      } catch (e: any) {
        connectionStatus = 'error';
        errorMsg = e.message;
      }
    }

    res.json({
      success: true,
      data: {
        configured: isConfigured,
        status: connectionStatus,
        error: errorMsg || undefined,
      },
    });
  } catch (error: any) {
    console.error('Seedance status error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

router.get('/status/payment', requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const isConfigured = await alipayService.isConfigured();

    res.json({
      success: true,
      data: {
        configured: isConfigured,
        status: isConfigured ? 'configured' : 'unconfigured',
      },
    });
  } catch (error: any) {
    console.error('Payment status error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

router.post('/init-configs', requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const defaultConfigs = [
      { category: 'seedance', key: 'API_KEY', description: 'Seedance API 密钥', encrypted: true },
      { category: 'seedance', key: 'BASE_URL', description: 'Seedance API 基础地址', encrypted: false },
      { category: 'payment', key: 'ALIPAY_APP_ID', description: '支付宝应用ID', encrypted: false },
      { category: 'payment', key: 'ALIPAY_PRIVATE_KEY', description: '支付宝应用私钥', encrypted: true },
      { category: 'payment', key: 'ALIPAY_PUBLIC_KEY', description: '支付宝公钥', encrypted: true },
      { category: 'payment', key: 'ALIPAY_GATEWAY', description: '支付宝网关地址', encrypted: false },
      { category: 'payment', key: 'ALIPAY_NOTIFY_URL', description: '支付宝回调通知地址', encrypted: false },
    ];

    const created = [];
    for (const config of defaultConfigs) {
      const existing = await prisma.systemConfig.findUnique({
        where: {
          category_key: {
            category: config.category as any,
            key: config.key,
          },
        },
      });

      if (!existing) {
        const newConfig = await prisma.systemConfig.create({
          data: {
            category: config.category as any,
            key: config.key,
            value: '',
            description: config.description,
            encrypted: config.encrypted,
          },
        });
        created.push(newConfig);
      }
    }

    res.json({ success: true, data: { created: created.length } });
  } catch (error: any) {
    console.error('Init configs error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

export default router;