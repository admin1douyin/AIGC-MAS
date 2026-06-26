import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';
import crypto from 'crypto';
const multer = require('multer');

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
  fileFilter: (req: any, file: any, cb: any) => {
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
  type: z.enum(['video', 'image', 'audio', 'document']),
  name: z.string(),
  url: z.string().optional(),
  duration: z.number().optional(),
  metadata: z.string().optional(),
  tags: z.string().optional(),
  category: z.string().optional(),
});

const uploadAssetSchema = z.object({
  projectId: z.string(),
  type: z.enum(['video', 'image', 'audio', 'document']),
  name: z.string(),
  duration: z.number().optional(),
  metadata: z.string().optional(),
  tags: z.string().optional(),
  category: z.string().optional(),
});

const updateAssetSchema = z.object({
  name: z.string().optional(),
  tags: z.string().optional(),
  category: z.string().optional(),
  metadata: z.string().optional(),
});

function getBucketName(type: string): string {
  const buckets: Record<string, string> = {
    video: 'video-clips',
    image: 'images',
    audio: 'audio',
    document: 'documents',
  };
  return buckets[type] || 'assets';
}

function generateFileName(originalName: string): string {
  const ext = originalName.split('.').pop() || '';
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  return `${timestamp}-${random}.${ext}`;
}

router.get('/', async (req: Request, res: Response) => {
  const projectId = req.query.projectId as string;
  const type = req.query.type as string;
  const category = req.query.category as string;
  const tag = req.query.tag as string;
  const search = req.query.search as string;

  const where: any = {};
  if (projectId) where.projectId = projectId;
  if (type) where.type = type;
  if (category) where.category = category;
  if (tag) where.tags = { contains: tag };
  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  const assets = await prisma.videoAsset.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: assets });
});

router.get('/categories', async (req: Request, res: Response) => {
  const projectId = req.query.projectId as string;

  const where: any = {};
  if (projectId) where.projectId = projectId;

  const categories = await prisma.videoAsset.findMany({
    where,
    distinct: ['category'],
    select: { category: true },
  });

  res.json({
    success: true,
    data: categories.map((c: any) => c.category).filter(Boolean),
  });
});

router.get('/tags', async (req: Request, res: Response) => {
  const projectId = req.query.projectId as string;

  const where: any = {};
  if (projectId) where.projectId = projectId;

  const assets = await prisma.videoAsset.findMany({ where });
  const allTags = new Set<string>();
  assets.forEach((a: any) => {
    if (a.tags) {
      const tags = JSON.parse(a.tags) as string[];
      tags.forEach((t: string) => allTags.add(t));
    }
  });

  res.json({ success: true, data: Array.from(allTags) });
});

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

router.post('/upload', requireAuth, upload.single('file'), async (req: Request & { file?: any }, res: Response) => {
  try {
    const body: any = req.body;
    const { projectId, type, name, duration, metadata, tags, category } = body;
    const file: any = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'No file uploaded' }
      });
    }

    const bucketName = getBucketName(type);
    const fileName = generateFileName(file.originalname);
    const filePath = `${projectId}/${fileName}`;

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

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(data!.path);

    const asset = await prisma.videoAsset.create({
      data: {
        projectId,
        type: type as any,
        name,
        url: publicUrl,
        duration,
        metadata: typeof metadata === 'object' ? JSON.stringify(metadata) : metadata,
        tags: typeof tags === 'object' ? JSON.stringify(tags) : tags,
        category,
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

router.post('/', requireAuth, validate(createAssetSchema), async (req: Request, res: Response) => {
  try {
    const { projectId, type, name, url, duration, metadata, tags, category } = req.body;

    const asset = await prisma.videoAsset.create({
      data: {
        projectId,
        type: type as any,
        name,
        url: url || '',
        duration,
        metadata: typeof metadata === 'object' ? JSON.stringify(metadata) : metadata,
        tags: typeof tags === 'object' ? JSON.stringify(tags) : tags,
        category,
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

router.put('/:id', requireAuth, validate(updateAssetSchema), async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (body.metadata && typeof body.metadata === 'object') {
      body.metadata = JSON.stringify(body.metadata);
    }
    if (body.tags && typeof body.tags === 'object') {
      body.tags = JSON.stringify(body.tags);
    }

    const asset = await prisma.videoAsset.update({
      where: { id: req.params.id },
      data: body,
    });

    res.json({ success: true, data: asset });
  } catch (error: any) {
    console.error('Update asset error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

router.post('/upload/batch', requireAuth, upload.array('files', 10), async (req: Request & { files?: any[] }, res: Response) => {
  try {
    const body: any = req.body;
    const { projectId, type, tags, category } = body;
    const files: any[] = req.files || [];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'No files uploaded' }
      });
    }

    const results: any[] = [];

    for (const file of files) {
      try {
        const bucketName = getBucketName(type);
        const fileName = generateFileName(file.originalname);
        const filePath = `${projectId}/${fileName}`;

        const { data, error } = await supabaseAdmin.storage
          .from(bucketName)
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (!error && data) {
          const { data: { publicUrl } } = supabaseAdmin.storage
            .from(bucketName)
            .getPublicUrl(data.path);

          const asset = await prisma.videoAsset.create({
            data: {
              projectId,
              type: type as any,
              name: file.originalname,
              url: publicUrl,
              tags: typeof tags === 'object' ? JSON.stringify(tags) : tags,
              category,
              createdBy: req.profile?.id,
            },
          });

          results.push({ success: true, data: asset });
        } else {
          results.push({ success: false, error: error?.message || 'Upload failed' });
        }
      } catch (err) {
        results.push({ success: false, error: (err as Error).message });
      }
    }

    res.status(201).json({ success: true, data: results });
  } catch (error: any) {
    console.error('Batch upload error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
});

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

    if (asset.url && asset.url.includes('supabase.co/storage')) {
      try {
        const urlParts = asset.url.split('/storage/v1/object/public/');
        if (urlParts.length > 1) {
          const path = urlParts[1];
          const bucketName = path.split('/')[0];
          const filePath = path.substring(bucketName.length + 1);
          await supabaseAdmin.storage.from(bucketName).remove([filePath]);
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

    const urlParts = asset.url.split('/storage/v1/object/public/');
    if (urlParts.length > 1) {
      const path = urlParts[1];
      const bucketName = path.split('/')[0];
      const filePath = path.substring(bucketName.length + 1);

      const { data, error } = await supabaseAdmin.storage
        .from(bucketName)
        .createSignedUrl(filePath, 3600);

      if (!error && data) {
        return res.json({
          success: true,
          data: { url: data.signedUrl, signed: true }
        });
      }
    }

    res.json({
      success: true,
      data: { url: asset.url, signed: false }
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