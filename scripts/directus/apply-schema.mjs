import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();
const DIRECTUS_URL = process.env.DIRECTUS_URL?.replace(/\/$/, '');
const DIRECTUS_ADMIN_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;
const DRY_RUN = process.argv.includes('--dry-run') || process.argv.includes('--dry');
const VALIDATE_ONLY = process.argv.includes('--validate');

if (!VALIDATE_ONLY && (!DIRECTUS_URL || !DIRECTUS_ADMIN_TOKEN)) {
  throw new Error('DIRECTUS_URL e DIRECTUS_ADMIN_TOKEN sao obrigatorios.');
}

function readJson(path) {
  return JSON.parse(readFileSync(resolve(ROOT, path), 'utf8'));
}

async function directus(path, options = {}) {
  const response = await fetch(`${DIRECTUS_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${DIRECTUS_ADMIN_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 404) return null;
  if (response.status === 204) return null;

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`${options.method ?? 'GET'} ${path} failed: ${response.status} ${text}`);
  }

  return body?.data ?? body;
}

function toDirectusField(field) {
  const { primary, interface: fieldInterface, ...rest } = field;
  return {
    field: field.field,
    type: field.type,
    meta: {
      interface: fieldInterface,
      special: field.type === 'json' ? ['cast-json'] : undefined,
      readonly: primary ? true : undefined,
      hidden: primary ? true : undefined,
    },
    schema: {
      name: field.field,
      is_primary_key: primary || undefined,
      is_nullable: primary ? false : true,
    },
    ...rest.directus,
  };
}

function validateManifest(schema, roles, permissions, seed) {
  const collections = new Set();

  for (const collection of schema.collections ?? []) {
    if (!collection.collection) {
      throw new Error('Collection sem nome em infra/directus/schema/collections.json');
    }
    if (collections.has(collection.collection)) {
      throw new Error(`Collection duplicada: ${collection.collection}`);
    }
    collections.add(collection.collection);

    const fields = new Set();
    for (const field of collection.fields ?? []) {
      if (!field.field || !field.type) {
        throw new Error(`Field invalido em ${collection.collection}`);
      }
      if (fields.has(field.field)) {
        throw new Error(`Field duplicado: ${collection.collection}.${field.field}`);
      }
      fields.add(field.field);
    }
  }

  const roleKeys = new Set((roles.roles ?? []).map(role => role.key));
  for (const permission of permissions.permissions ?? []) {
    if (permission.collection !== '*' && !collections.has(permission.collection)) {
      throw new Error(`Permission referencia collection inexistente: ${permission.collection}`);
    }
    if (permission.role !== 'public' && !roleKeys.has(permission.role)) {
      throw new Error(`Permission referencia role inexistente: ${permission.role}`);
    }
  }

  for (const item of seed.items ?? []) {
    if (!collections.has(item.collection)) {
      throw new Error(`Seed referencia collection inexistente: ${item.collection}`);
    }
    if (!item.id || !item.data) {
      throw new Error(`Seed invalido em ${item.collection}`);
    }
  }
}

async function ensureCollection(collection) {
  const existing = await directus(`/collections/${collection.collection}`);

  if (existing) {
    console.log(`= collection ${collection.collection}`);
    if (!DRY_RUN) {
      await directus(`/collections/${collection.collection}`, {
        method: 'PATCH',
        body: JSON.stringify({ meta: collection.meta ?? {} }),
      });
    }
    return;
  }

  console.log(`+ collection ${collection.collection}`);
  if (DRY_RUN) return;

  await directus('/collections', {
    method: 'POST',
    body: JSON.stringify({
      collection: collection.collection,
      meta: collection.meta ?? {},
      schema: {},
    }),
  });
}

async function ensureField(collectionName, field) {
  const existing = await directus(`/fields/${collectionName}/${field.field}`);
  const payload = toDirectusField(field);

  if (existing) {
    console.log(`= field ${collectionName}.${field.field}`);
    if (!DRY_RUN) {
      await directus(`/fields/${collectionName}/${field.field}`, {
        method: 'PATCH',
        body: JSON.stringify({
          meta: payload.meta,
          schema: payload.schema,
        }),
      });
    }
    return;
  }

  console.log(`+ field ${collectionName}.${field.field}`);
  if (DRY_RUN) return;

  await directus(`/fields/${collectionName}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function getRolesByName() {
  const roles = await directus('/roles?limit=-1');
  return new Map((roles ?? []).map(role => [role.name, role]));
}

async function ensureRoles(roleManifest) {
  const rolesByName = await getRolesByName();
  const result = new Map();

  for (const role of roleManifest.roles) {
    const existing = rolesByName.get(role.name);
    if (existing) {
      console.log(`= role ${role.name}`);
      result.set(role.key, existing.id);
      continue;
    }

    console.log(`+ role ${role.name}`);
    if (DRY_RUN) continue;

    const created = await directus('/roles', {
      method: 'POST',
      body: JSON.stringify({
        name: role.name,
        description: role.description,
      }),
    });
    result.set(role.key, created.id);
  }

  return result;
}

async function ensurePermissions(permissionManifest, roleIds) {
  const existing = await directus('/permissions?limit=-1');
  const existingKeys = new Set(
    (existing ?? []).map(permission => (
      `${permission.role}:${permission.collection}:${permission.action}`
    )),
  );

  for (const permission of permissionManifest.permissions) {
    const roleId = roleIds.get(permission.role);
    if (!roleId && permission.role !== 'public') {
      console.warn(`! role nao encontrada para permission: ${permission.role}`);
      continue;
    }

    for (const action of permission.actions) {
      const key = `${roleId ?? null}:${permission.collection}:${action}`;
      if (existingKeys.has(key)) {
        console.log(`= permission ${permission.role}.${permission.collection}.${action}`);
        continue;
      }

      console.log(`+ permission ${permission.role}.${permission.collection}.${action}`);
      if (DRY_RUN) continue;

      await directus('/permissions', {
        method: 'POST',
        body: JSON.stringify({
          role: roleId ?? null,
          collection: permission.collection,
          action,
          permissions: permission.permissions ?? {},
          validation: permission.validation ?? {},
          presets: permission.presets ?? {},
          fields: permission.fields ?? ['*'],
        }),
      });
    }
  }
}

async function ensureSeedItems(seedManifest) {
  for (const item of seedManifest.items) {
    const existing = await directus(`/items/${item.collection}/${item.id}`);
    if (existing) {
      console.log(`= seed ${item.collection}/${item.id}`);
      continue;
    }

    console.log(`+ seed ${item.collection}/${item.id}`);
    if (DRY_RUN) continue;

    await directus(`/items/${item.collection}`, {
      method: 'POST',
      body: JSON.stringify(item.data),
    });
  }
}

const schema = readJson('infra/directus/schema/collections.json');
const roles = readJson('infra/directus/access/roles.json');
const permissions = readJson('infra/directus/access/permissions.json');
const seed = readJson('infra/directus/seed/items.json');

validateManifest(schema, roles, permissions, seed);

if (VALIDATE_ONLY) {
  console.log('Directus IaC valido.');
  process.exit(0);
}

for (const collection of schema.collections) {
  await ensureCollection(collection);
}

for (const collection of schema.collections) {
  for (const field of collection.fields) {
    await ensureField(collection.collection, field);
  }
}

const roleIds = await ensureRoles(roles);
await ensurePermissions(permissions, roleIds);
await ensureSeedItems(seed);

console.log(DRY_RUN ? 'Directus dry-run concluido.' : 'Directus schema aplicado.');
