import { directusHttpClient, DirectusHttpClient } from './DirectusHttpClient';
import type { Repository } from '@/domain/shared/Repository';

export interface DirectusEntity {
  id: string;
}

export type DirectusFilterOperator =
  | '_eq'
  | '_neq'
  | '_lt'
  | '_lte'
  | '_gt'
  | '_gte'
  | '_contains'
  | '_in';

export type DirectusFilter = Record<string, Partial<Record<DirectusFilterOperator, unknown>>>;

function encodeFilter(filters: Record<string, unknown>): string {
  const params = new URLSearchParams();

  for (const [field, value] of Object.entries(filters)) {
    params.set(`filter[${field}][_eq]`, String(value));
  }

  return params.toString();
}

function encodeAdvancedFilter(filters: DirectusFilter): string {
  const params = new URLSearchParams();

  for (const [field, operators] of Object.entries(filters)) {
    for (const [operator, value] of Object.entries(operators)) {
      if (value === undefined) continue;
      params.set(`filter[${field}][${operator}]`, Array.isArray(value) ? value.join(',') : String(value));
    }
  }

  return params.toString();
}

export class DirectusRepository<T extends DirectusEntity> implements Repository<T> {
  constructor(
    protected readonly collection: string,
    protected readonly client: DirectusHttpClient = directusHttpClient,
  ) {}

  async create(data: Omit<T, 'id'>): Promise<T> {
    const payload = {
      id: crypto.randomUUID(),
      ...data,
      created_at: 'created_at' in data ? (data as { created_at?: string }).created_at : new Date().toISOString(),
    };

    return this.client.request<T>(`/items/${this.collection}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async get(id: string): Promise<T | null> {
    try {
      return await this.client.request<T>(`/items/${this.collection}/${id}`);
    } catch (error) {
      if (error instanceof Error && /not found/i.test(error.message)) return null;
      throw error;
    }
  }

  async list(orderByField?: string, direction: 'asc' | 'desc' = 'asc'): Promise<T[]> {
    const params = new URLSearchParams({ limit: '-1' });
    if (orderByField) params.set('sort', direction === 'desc' ? `-${orderByField}` : orderByField);

    return this.client.request<T[]>(`/items/${this.collection}?${params}`);
  }

  async update(id: string, data: Partial<Omit<T, 'id'>>): Promise<T | null> {
    return this.client.request<T>(`/items/${this.collection}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...data,
        updated_at: new Date().toISOString(),
      }),
    });
  }

  async delete(id: string): Promise<void> {
    await this.client.request<void>(`/items/${this.collection}/${id}`, {
      method: 'DELETE',
    });
  }

  protected async findOneBy(filters: Record<string, unknown>): Promise<T | null> {
    const query = encodeFilter(filters);
    const items = await this.client.request<T[]>(`/items/${this.collection}?limit=1&${query}`);
    return items[0] ?? null;
  }

  protected async findManyBy(filters: Record<string, unknown>, sort?: string): Promise<T[]> {
    const query = encodeFilter(filters);
    const sortParam = sort ? `&sort=${encodeURIComponent(sort)}` : '';
    return this.client.request<T[]>(`/items/${this.collection}?limit=-1&${query}${sortParam}`);
  }

  protected async findManyWhere(
    filters: DirectusFilter,
    options: { sort?: string; limit?: number } = {},
  ): Promise<T[]> {
    const query = encodeAdvancedFilter(filters);
    const params = new URLSearchParams();
    params.set('limit', String(options.limit ?? -1));
    if (options.sort) params.set('sort', options.sort);

    const separator = query ? '&' : '';
    return this.client.request<T[]>(`/items/${this.collection}?${params}${separator}${query}`);
  }
}
