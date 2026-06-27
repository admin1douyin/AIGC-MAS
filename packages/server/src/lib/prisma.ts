import { PrismaClient } from '../../generated/prisma';

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

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Use Prisma client extension (the modern replacement for the removed $use middleware)
function createPrismaClient(): PrismaClient {
  const client = new PrismaClient();

  const modelExtensions: Record<string, any> = {};
  for (const model of Object.keys(jsonFields)) {
    modelExtensions[model] = {
      async create({ args, query }: any) {
        args.data = transformData(args.data, model);
        const result = await query(args);
        return transformResult(result, model);
      },
      async createMany({ args, query }: any) {
        if (Array.isArray(args.data)) {
          args.data = args.data.map((d: any) => transformData(d, model));
        } else {
          args.data = transformData(args.data, model);
        }
        return query(args);
      },
      async update({ args, query }: any) {
        args.data = transformData(args.data, model);
        const result = await query(args);
        return transformResult(result, model);
      },
      async updateMany({ args, query }: any) {
        args.data = transformData(args.data, model);
        return query(args);
      },
      async upsert({ args, query }: any) {
        args.create = transformData(args.create, model);
        args.update = transformData(args.update, model);
        const result = await query(args);
        return transformResult(result, model);
      },
      async findUnique({ args, query }: any) {
        const result = await query(args);
        return transformResult(result, model);
      },
      async findFirst({ args, query }: any) {
        const result = await query(args);
        return transformResult(result, model);
      },
      async findMany({ args, query }: any) {
        const result = await query(args);
        return transformResult(result, model);
      },
    };
  }

  return client.$extends({
    query: modelExtensions as any,
  }) as unknown as PrismaClient;
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
