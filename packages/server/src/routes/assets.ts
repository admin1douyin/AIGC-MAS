import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';
import crypto from 'crypto';
import multer from 'multer';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

const createAssetSchema = z.object({
  projectId: z.string(),
  type: z.enum(['clip', 'image', 'audio', 'music', 'voiceover', 'subtitle']),
  name: z.string(),
  url: z.string().optional(),
  duration: z.number().optional(),
  metadata: z.any().optional(),
});

const uploadAssetSchema = z.object({
  projectId: z.string(),
  type: z.enum(['clip', 'image', 'audio', 'music', 'voiceover', 'subtitle']),
  name: z.string(),
  duration: z.number().optional(),
  metadata: z.any().optional(),
});

// Get storage bucket name based on asset type
function getBucketName(type: string): string {
  const buckets: Record<string, string> = {
    clip: 'video-clips',
    image: 'images',
    audio: 'audio',
    music: 'music',
    voiceover: 'voiceovers',
    subtitle: 'subtitles',
  };
  return buckets[type] || 'assets';
}

// Generate unique filename
function generateFileName(originalName: string): string {
  const ext = originalName.split('.').pop() || '';
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  return `${timestamp}-${random}.${ext}`;
}

// List assets for a project
router.get('/', async (req: Request, res: Response) => {
  const projectId = req.query.projectId as string;
  const type = req.query.type as string;

  const where: any = {};
  if (projectId) where.projectId = projectId;
  if (type) where.type = type;

  const assets = await prisma.videoAsset.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: assets });
});

// Get single asset
router.get('/:id', async (req: Request, res: Response) => {
  const asset = await prisma.videoAsset.findUnique({
    where: { id: req.params.id },
    include: { project: { select: { id: true, name: true } } },
  });

  if (!asset) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Asset not found' } });
  }

  res.json({ success: true, data: asset });
});

// Upload file to Supabase Storage
router.post('/upload', requireAuth, upload.single('file'), validate(uploadAssetSchema), async (req: Request, res: Response) => {
  try {
    const { projectId, type, name, duration, metadata } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'No file uploaded' }
      });
    }

    const bucketName = getBucketName(type);
    const fileName = generateFileName(file.originalname);
    const filePath = `${projectId}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return res.status(500).json({
        success: false,
        error: { code: 'UPLOAD_ERROR', message: error.message }
      });
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(data.Key);

    // Create asset record
    const asset = await prisma.videoAsset.create({
      data: {
        projectId,
        type: type as any,
        name,
        url: publicUrl,
        duration,
        metadata: metadata || {},
        createdBy: req.profile?.id,
      },
    });

    res.status(201).json({ success: true, data: asset });
  } catch (error: any) {
    console.error('Upload asset error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

// Create asset with external URL (for assets hosted elsewhere)
router.post('/', requireAuth, validate(createAssetSchema), async (req: Request, res: Response) => {
  try {
    const { projectId, type, name, url, duration, metadata } = req.body;

    const asset = await prisma.videoAsset.create({
      data: {
        projectId,
        type: type as any,
        name,
        url: url || '',
        duration,
        metadata: metadata || {},
        createdBy: req.profile?.id,
      },
    });

    res.status(201).json({ success: true, data: asset });
  } catch (error: any) {
    console.error('Create asset error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

// Delete asset
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const asset = await prisma.videoAsset.findUnique({
      where: { id: req.params.id },
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Asset not found' }
      });
    }

    // Delete from Supabase Storage if URL is from our storage
    if (asset.url && asset.url.includes('supabase.co/storage')) {
      try {
        const urlPath = asset.url.split('/storage/v1/object/')[1];
        if (urlPath) {
          await supabaseAdmin.storage.removeAssets([urlPath]);
        }
      } catch (storageError) {
        console.error('Storage delete error:', storageError);
      }
    }

    await prisma.videoAsset.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete asset error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

// Get signed URL for private assets
router.get('/:id/signed-url', requireAuth, async (req: Request, res: Response) => {
  try {
    const asset = await prisma.videoAsset.findUnique({
      where: { id: req.params.id },
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Asset not found' }
      });
    }

    if (!asset.url || !asset.url.includes('supabase.co/storage')) {
      return res.json({
        success: true,
        data: { url: asset.url, signed: false }
      });
    }

    // Generate signed URL valid for 1 hour
    const { data, error } = await supabaseAdmin.storage
      .from(getBucketName(asset.type))
      .createSignedUrl(asset.url.split('/').pop()!, 3600);

    if (error) {
      return res.json({
        success: true,
        data: { url: asset.url, signed: false }
      });
    }

    res.json({
      success: true,
      data: { url: data.signedUrl, signed: true }
    });
  } catch (error: any) {
    console.error('Get signed URL error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

export default router;
