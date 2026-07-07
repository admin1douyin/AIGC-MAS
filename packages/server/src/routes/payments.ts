import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { alipayService } from '../services/alipayService';

const router = Router();

const createOrderSchema = z.object({
  plan: z.enum(['pro', 'enterprise']),
  amount: z.number().positive(),
});

function generateOrderNo(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `AIGC${timestamp}${random}`.toUpperCase();
}

async function updateSubscriptionOnPayment(order: any) {
  await prisma.subscription.upsert({
    where: { profileId: order.profileId },
    update: {
      plan: order.plan as any,
      status: 'active',
      credits: order.credits || 999,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    create: {
      profileId: order.profileId,
      plan: order.plan as any,
      status: 'active',
      credits: order.credits || 999,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
}

router.post('/create-order', requireAuth, validate(createOrderSchema), async (req: Request, res: Response) => {
  try {
    const { plan, amount } = req.body;
    const isConfigured = await alipayService.isConfigured();

    const orderNo = generateOrderNo();
    const order = await prisma.order.create({
      data: {
        profileId: req.profile!.id,
        orderNo,
        type: 'subscription',
        amount: amount / 100,
        plan,
        credits: plan === 'pro' ? 999 : 0,
        status: 'pending',
      },
    });

    let paymentUrl = '';
    let mode = 'mock';

    if (isConfigured) {
      const result = await alipayService.createOrder({
        orderId: orderNo,
        amount,
        subject: `AIGC-MAS ${plan === 'pro' ? '专业版' : '企业版'} 订阅`,
        description: `AIGC-MAS ${plan} subscription`,
      });
      if (result.success && result.payUrl) {
        paymentUrl = result.payUrl;
        mode = 'production';
      }
    }

    if (!paymentUrl) {
      paymentUrl = `https://openapi-sandbox.dl.alipaydev.com/gateway.do?out_trade_no=${orderNo}&total_amount=${(amount / 100).toFixed(2)}&subject=AIGC-MAS${plan}订阅&qr_code_method=alipay.qrcode.manage.generate&qr_code=mock`;
    }

    res.json({
      success: true,
      data: {
        orderId: order.id,
        orderNo: order.orderNo,
        paymentUrl,
        qrCodeUrl: `/api/payments/qrcode/${order.orderNo}`,
        mode,
      },
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

router.post('/alipay-notify', async (req: Request, res: Response) => {
  try {
    const isConfigured = await alipayService.isConfigured();

    if (isConfigured) {
      const verified = alipayService.verifyNotify(req.body);
      if (!verified) {
        console.error('Alipay signature verification failed');
        return res.send('fail');
      }
    }

    const { out_trade_no, trade_status } = req.body;

    if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
      const order = await prisma.order.update({
        where: { orderNo: out_trade_no },
        data: {
          status: 'paid',
          paidAt: new Date(),
          paymentMethod: 'alipay',
        },
        include: { profile: true },
      });

      await updateSubscriptionOnPayment(order);

      res.send('success');
    } else {
      res.send('fail');
    }
  } catch (error: any) {
    console.error('Alipay notify error:', error);
    res.status(500).send('fail');
  }
});

router.get('/order/:orderNo', async (req: Request, res: Response) => {
  try {
    const { orderNo } = req.params;

    const order = await prisma.order.findUnique({
      where: { orderNo },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Order not found' }
      });
    }

    res.json({ success: true, data: order });
  } catch (error: any) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

router.get('/qrcode/:orderNo', async (req: Request, res: Response) => {
  try {
    const { orderNo } = req.params;
    const order = await prisma.order.findUnique({
      where: { orderNo },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Order not found' }
      });
    }

    const mockQrDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    res.json({
      success: true,
      data: {
        orderNo,
        qrCode: mockQrDataUrl,
        paymentUrl: `https://openapi-sandbox.dl.alipaydev.com/gateway.do?out_trade_no=${orderNo}`,
        amount: order.amount,
        status: order.status,
      },
    });
  } catch (error: any) {
    console.error('Get QR code error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

router.get('/orders', requireAuth, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const status = req.query.status as string;

    const where: any = { profileId: req.profile!.id };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        items: orders,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error: any) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

router.get('/subscription', requireAuth, async (req: Request, res: Response) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { profileId: req.profile!.id },
    });

    if (!subscription) {
      return res.json({
        success: true,
        data: {
          plan: 'free',
          status: 'inactive',
          credits: 0,
          currentPeriodStart: null,
          currentPeriodEnd: null,
        },
      });
    }

    res.json({ success: true, data: subscription });
  } catch (error: any) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

router.post('/subscription/renew', requireAuth, async (req: Request, res: Response) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { profileId: req.profile!.id },
    });

    if (!subscription || subscription.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'No active subscription to renew' }
      });
    }

    const orderNo = generateOrderNo();
    const order = await prisma.order.create({
      data: {
        profileId: req.profile!.id,
        orderNo,
        type: 'subscription',
        amount: subscription.plan === 'pro' ? 299 : 2999,
        plan: subscription.plan,
        credits: subscription.plan === 'pro' ? 999 : 9999,
        status: 'pending',
      },
    });

    res.json({
      success: true,
      data: {
        orderId: order.id,
        orderNo: order.orderNo,
        amount: order.amount,
        plan: order.plan,
      },
    });
  } catch (error: any) {
    console.error('Renew subscription error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

router.post('/subscription/cancel', requireAuth, async (req: Request, res: Response) => {
  try {
    await prisma.subscription.update({
      where: { profileId: req.profile!.id },
      data: { status: 'cancelled' },
    });

    res.json({ success: true });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

router.post('/check-subscription', requireAuth, async (req: Request, res: Response) => {
  try {
    const profileId = req.profile!.id;

    const subscription = await prisma.subscription.findUnique({
      where: { profileId },
    });

    if (!subscription) {
      return res.json({
        success: true,
        data: { valid: false, message: 'No subscription found' }
      });
    }

    const now = new Date();
    const isValid = subscription.status === 'active' && 
      subscription.currentPeriodEnd && 
      subscription.currentPeriodEnd > now;

    res.json({
      success: true,
      data: {
        valid: isValid,
        plan: subscription.plan,
        status: subscription.status,
        expiresAt: subscription.currentPeriodEnd?.toISOString(),
        message: isValid ? 'Subscription is valid' : 'Subscription expired or inactive',
      },
    });
  } catch (error: any) {
    console.error('Check subscription error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

router.get('/config', async (_req: Request, res: Response) => {
  const isConfigured = await alipayService.isConfigured();
  res.json({
    success: true,
    data: {
      mode: isConfigured ? 'production' : 'mock',
      alipayPublicKey: null,
      plans: [
        { id: 'free', name: '免费版', price: 0, credits: 100, features: ['基础脚本生成', '最多3个项目'] },
        { id: 'pro', name: '专业版', price: 99, credits: 999, features: ['高级脚本生成', '无限项目', 'AI配音', '优先队列'] },
        { id: 'enterprise', name: '企业版', price: 299, credits: 9999, features: ['全部功能', '无限项目', 'API访问', '专属客服'] },
      ],
    },
  });
});

export default router;
