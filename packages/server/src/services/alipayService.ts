import { prisma } from '../lib/prisma';

export interface AlipayConfig {
  appId: string;
  privateKey: string;
  publicKey: string;
  gateway: string;
  notifyUrl: string;
}

export interface CreateOrderParams {
  orderId: string;
  amount: number;
  subject: string;
  description?: string;
  returnUrl?: string;
}

export interface OrderResult {
  success: boolean;
  payUrl?: string;
  qrCode?: string;
  orderId?: string;
  error?: string;
}

class AlipayService {
  private config: AlipayConfig | null = null;

  async getConfig(): Promise<AlipayConfig | null> {
    if (this.config) return this.config;

    try {
      const configs = await prisma.systemConfig.findMany({
        where: { category: 'payment' },
      });

      const configMap: Record<string, string> = {};
      configs.forEach((c) => {
        if (c.value) configMap[c.key] = c.value;
      });

      if (!configMap.ALIPAY_APP_ID) {
        return null;
      }

      this.config = {
        appId: configMap.ALIPAY_APP_ID,
        privateKey: configMap.ALIPAY_PRIVATE_KEY || '',
        publicKey: configMap.ALIPAY_PUBLIC_KEY || '',
        gateway: configMap.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do',
        notifyUrl: configMap.ALIPAY_NOTIFY_URL || '',
      };

      return this.config;
    } catch {
      return null;
    }
  }

  async isConfigured(): Promise<boolean> {
    const config = await this.getConfig();
    return !!config?.appId;
  }

  async createOrder(params: CreateOrderParams): Promise<OrderResult> {
    const config = await this.getConfig();
    if (!config) {
      return {
        success: false,
        error: '支付宝支付未配置，请联系管理员',
      };
    }

    try {
      const orderString = this.buildOrderString(config, params);
      const sign = this.sign(orderString, config.privateKey);

      return {
        success: true,
        payUrl: `${config.gateway}?${orderString}&sign=${encodeURIComponent(sign)}`,
        orderId: params.orderId,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || '创建订单失败',
      };
    }
  }

  private buildOrderString(config: AlipayConfig, params: CreateOrderParams): string {
    const bizContent = JSON.stringify({
      out_trade_no: params.orderId,
      total_amount: (params.amount / 100).toFixed(2),
      subject: params.subject,
      body: params.description,
      product_code: 'QUICK_MSECURITY_PAY',
    });

    const paramsObj: Record<string, string> = {
      app_id: config.appId,
      method: 'alipay.trade.page.pay',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      version: '1.0',
      notify_url: config.notifyUrl,
      return_url: params.returnUrl || '',
      biz_content: bizContent,
    };

    const sortedKeys = Object.keys(paramsObj).sort();
    return sortedKeys
      .map((k) => `${k}=${paramsObj[k]}`)
      .join('&');
  }

  private sign(content: string, privateKey: string): string {
    try {
      const crypto = require('crypto');
      const signer = crypto.createSign('RSA-SHA256');
      signer.update(content);
      return signer.sign(privateKey, 'base64');
    } catch {
      return 'simulated_signature';
    }
  }

  verifyNotify(params: Record<string, string>): boolean {
    try {
      const { sign, sign_type, ...rest } = params;
      const sortedKeys = Object.keys(rest).sort();
      const content = sortedKeys.map((k) => `${k}=${rest[k]}`).join('&');

      const config = this.config;
      if (!config) return false;

      const crypto = require('crypto');
      const verifier = crypto.createVerify('RSA-SHA256');
      verifier.update(content);
      return verifier.verify(config.publicKey, sign, 'base64');
    } catch {
      return false;
    }
  }

  clearCache() {
    this.config = null;
  }
}

export const alipayService = new AlipayService();
