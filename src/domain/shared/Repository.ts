export interface EntityWithId {
  id: string;
}

export interface QueryFilter {
  field: string;
  operator:
    | '<'
    | '<='
    | '=='
    | '!='
    | '>='
    | '>'
    | 'array-contains'
    | 'in'
    | 'array-contains-any'
    | 'not-in';
  value: unknown;
}

export interface ListOptions {
  orderByField?: string;
  direction?: 'asc' | 'desc';
  limitCount?: number;
}

export interface Repository<T extends EntityWithId> {
  create(data: Omit<T, 'id'>): Promise<T>;
  get(id: string): Promise<T | null>;
  list(orderByField?: string, direction?: 'asc' | 'desc'): Promise<T[]>;
  update(id: string, data: Partial<Omit<T, 'id'>>): Promise<T | null>;
  delete(id: string): Promise<void>;
}
