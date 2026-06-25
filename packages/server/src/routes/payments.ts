import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import crypto from 'crypto';

const router = Router();

const createOrderSchema = z.object({
  plan: z.enum(['pro', 'enterprise']),
  amount: z.number().positive(),
});

// Generate order number
function generateOrderNo(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `AIGC${timestamp}${random}`.toUpperCase();
}

// Create payment order
router.post('/create-order', validate(createOrderSchema), async (req: Request, res: Response) => {
  try {
    const { plan, amount } = req.body;
    
    // Get or create profile
    let profile = await prisma.profile.findFirst();
    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId: 'demo-user-id',
          email: 'demo@example.com',
          name: '演示用户',
          role: 'creator',
        },
      });
    }

    // Generate order
    const orderNo = generateOrderNo();
    const order = await prisma.order.create({
      data: {
        profileId: profile.id,
        orderNo,
        type: 'subscription',
        amount: amount / 100, // Convert from cents to yuan
        plan,
        credits: plan === 'pro' ? 999 : 0,
        status: 'pending',
      },
    });

    // In production, integrate with Alipay SDK
    // For now, return mock payment URL
    const paymentUrl = `https://openapi.alipay.com/gateway.do?out_trade_no=${orderNo}&total_amount=${amount / 100}&subject=AIGC-MAS${plan}订阅`;

    res.json({
      success: true,
      data: {
        orderId: order.id,
        orderNo: order.orderNo,
        paymentUrl,
        qrCodeUrl: `/api/payments/qrcode/${order.orderNo}`, // Mock QR code endpoint
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

// Alipay callback (notify_url)
router.post('/alipay-notify', async (req: Request, res: Response) => {
  try {
    const { out_trade_no, trade_status, trade_no } = req.body;

    // Verify signature (in production)
    // const signType = req.body.sign_type;
    // const signature = req.body.sign;

    if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
      // Update order status
      const order = await prisma.order.update({
        where: { orderNo: out_trade_no },
        data: {
          status: 'paid',
          paidAt: new Date(),
          paymentMethod: 'alipay',
        },
        include: { profile: true },
      });

      // Update subscription
      await prisma.subscription.upsert({
        where: { profileId: order.profileId },
        update: {
          plan: order.plan as any,
          status: 'active',
          credits: order.credits || 999,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
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

      res.send('success');
    } else {
      res.send('fail');
    }
  } catch (error: any) {
    console.error('Alipay notify error:', error);
    res.status(500).send('fail');
  }
});

// Get order status
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

// Mock QR code endpoint (in production, generate real QR code)
router.get('/qrcode/:orderNo', async (req: Request, res: Response) => {
  try {
    const { orderNo } = req.params;
    
    // Return mock QR code as base64
    // In production, use `qrcode` library to generate real QR code
    const mockQrDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    res.json({
      success: true,
      data: {
        orderNo,
        qrCode: mockQrDataUrl,
        paymentUrl: `https://openapi.alipay.com/gateway.do?out_trade_no=${orderNo}`,
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

// Get user's orders
router.get('/orders', async (req: Request, res: Response) => {
  try {
    let profile = await prisma.profile.findFirst();
    if (!profile) {
      return res.json({ success: true, data: [] });
    }

    const orders = await prisma.order.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: orders });
  } catch (error: any) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

export default router;
