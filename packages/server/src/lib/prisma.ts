import { PrismaClient } from '../generated/prisma';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

const jsonFields: Record<string, string[]> = {
  Project: ['brief', 'tags'],
  Agent: ['capabilities'],
  AgentTask: ['inputData', 'outputData', 'dependsOn'],
  VideoScript: ['scenes'],
  Storyboard: ['frames'],
  VideoAsset: ['metadata'],
  ShortDramaProject: ['mainCharacters'],
  CorporateVideoProject: ['brandGuidelines', 'keySellingPoints'],
  TourismPromoProject: ['attractions', 'culturalHighlights'],
};

function parseJSON(val: string | null | undefined, isArray: boolean = false): any {
  if (val === null || val === undefined) return isArray ? [] : null;
  try {
    return JSON.parse(val);
  } catch {
    return isArray ? [] : null;
  }
}

function stringifyJSON(val: any): string | null {
  if (val === null || val === undefined) return null;
  try {
    return JSON.stringify(val);
  } catch {
    return null;
  }
}

function transformResult(result: any, model: string): any {
  if (!result) return result;
  const fields = jsonFields[model];
  if (!fields) return result;

  if (Array.isArray(result)) {
    return result.map((item) => transformResult(item, model));
  }

  const transformed = { ...result };
  for (const field of fields) {
    if (field in transformed) {
      transformed[field] = parseJSON(transformed[field]);
    }
  }
  return transformed;
}

function transformData(data: any, model: string): any {
  if (!data) return data;
  const fields = jsonFields[model];
  if (!fields) return data;

  const transformed = { ...data };
  for (const field of fields) {
    if (field in transformed) {
      transformed[field] = stringifyJSON(transformed[field]);
    }
  }
  return transformed;
}

prisma.$use(async (params, next) => {
  const model = params.model;
  if (!model || !jsonFields[model]) return next(params);

  const action = params.action;
  const dataActions = ['create', 'createMany', 'update', 'updateMany', 'upsert'];

  if (dataActions.includes(action) && params.args?.data) {
    params.args.data = transformData(params.args.data, model);
  }

  const result = await next(params);

  const readActions = ['findUnique', 'findMany', 'findFirst', 'create', 'update', 'upsert'];
  if (readActions.includes(action)) {
    return transformResult(result, model);
  }

  return result;
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
