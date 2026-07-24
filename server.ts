import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { paymentManager } from './src/services/payment/paymentManager';
import { esewaService } from './src/services/payment/esewaService';
import { khaltiService } from './src/services/payment/khaltiService';
import { fonepayService } from './src/services/payment/fonepayService';
import { notificationService } from './src/services/notificationService';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Helper to get Base URL
  const getAppUrl = (req: Request) => {
    return process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  };

  // ==========================================
  // PAYMENT API ENDPOINTS
  // ==========================================

  // Health Check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'Gajuri Cinemas Payment Engine 2026' });
  });

  // 1. Initiate Payment
  app.post('/api/payments/initiate', async (req: Request, res: Response) => {
    try {
      const appUrl = getAppUrl(req);
      const initiateRes = await paymentManager.initiatePayment(req.body, appUrl);
      res.json(initiateRes);
    } catch (err: any) {
      console.error('Payment initiate error:', err);
      res.status(500).json({ success: false, error: err?.message || 'Server failed to initiate payment' });
    }
  });

  // 2. Verify Payment (GET or POST callback from gateway)
  const handleVerify = async (req: Request, res: Response) => {
    try {
      const gateway = (req.query.gateway || req.body.gateway || 'esewa') as any;
      const ref = (req.query.ref || req.body.ref || req.query.pidx || req.body.pidx || '') as string;
      const data = (req.query.data || req.body.data || '') as string;
      const pidx = (req.query.pidx || req.body.pidx || '') as string;
      const PRN = (req.query.PRN || req.body.PRN || '') as string;
      const transactionId = (req.query.transaction_id || req.body.transaction_id || '') as string;

      const verifyRes = await paymentManager.verifyPayment({
        bookingReference: ref || PRN?.replace('GAJ-', '') || 'GAJ-DEMO',
        gateway,
        transactionId,
        pidx,
        data,
        PRN
      });

      if (verifyRes.success && verifyRes.booking) {
        // Trigger Email / SMS / Push notifications asynchronously
        notificationService.notifyPaymentSuccess(verifyRes.booking);
      }

      // If browser request redirect to frontend success/failed page
      const acceptsHtml = req.headers.accept?.includes('text/html');
      if (acceptsHtml) {
        if (verifyRes.success) {
          return res.redirect(`/booking/success?ref=${verifyRes.bookingReference}`);
        } else {
          return res.redirect(`/booking/failed?ref=${verifyRes.bookingReference}&error=${encodeURIComponent(verifyRes.error || '')}`);
        }
      }

      res.json(verifyRes);
    } catch (err: any) {
      console.error('Payment verify error:', err);
      res.status(500).json({ success: false, error: err?.message || 'Verification failed' });
    }
  };

  app.get('/api/payments/verify', handleVerify);
  app.post('/api/payments/verify', handleVerify);

  // ==========================================
  // WEBHOOK ENDPOINTS
  // ==========================================

  // eSewa Webhook
  app.post('/api/webhooks/esewa', async (req: Request, res: Response) => {
    try {
      const { encoded_data, data } = req.body;
      const payload = encoded_data || data;
      const verification = esewaService.verifyCallback(payload);
      
      if (verification.isValid) {
        res.status(200).json({ status: 'SUCCESS', message: 'eSewa webhook processed' });
      } else {
        res.status(400).json({ status: 'INVALID_SIGNATURE', error: verification.error });
      }
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', error: err?.message });
    }
  });

  // Khalti Webhook
  app.post('/api/webhooks/khalti', async (req: Request, res: Response) => {
    try {
      const { pidx } = req.body;
      const verification = await khaltiService.verifyPayment(pidx);
      if (verification.isValid) {
        res.status(200).json({ status: 'SUCCESS', message: 'Khalti webhook processed' });
      } else {
        res.status(400).json({ status: 'FAILED', error: verification.error });
      }
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', error: err?.message });
    }
  });

  // Fonepay Webhook
  app.post('/api/webhooks/fonepay', async (req: Request, res: Response) => {
    try {
      const { PRN, UID } = req.body;
      const verification = fonepayService.verifyCallback(PRN, UID);
      if (verification.isValid) {
        res.status(200).json({ status: 'SUCCESS', message: 'Fonepay webhook processed' });
      } else {
        res.status(400).json({ status: 'FAILED', error: verification.error });
      }
    } catch (err: any) {
      res.status(500).json({ status: 'ERROR', error: err?.message });
    }
  });

  // ==========================================
  // SEAT RESERVATION CLEANUP & ADMIN METRICS
  // ==========================================

  // Release expired seat holds (>10 minutes)
  app.get('/api/reservations/check-expiry', (_req: Request, res: Response) => {
    const released = paymentManager.releaseExpiredReservations();
    res.json({ success: true, releasedCount: released });
  });

  // Admin Payment Analytics & Summary
  app.get('/api/admin/payments/summary', (_req: Request, res: Response) => {
    res.json({
      totalRevenue: 248500,
      todayRevenue: 34200,
      pendingCount: 4,
      failedCount: 2,
      refundedCount: 1,
      gateways: {
        esewa: { count: 142, revenue: 112000 },
        khalti: { count: 98, revenue: 84500 },
        fonepay: { count: 54, revenue: 42000 },
        counter: { count: 12, revenue: 10000 }
      }
    });
  });

  // ==========================================
  // VITE DEVELOPMENT & PRODUCTION MIDDLEWARE
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎬 Gajuri Cinemas Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
