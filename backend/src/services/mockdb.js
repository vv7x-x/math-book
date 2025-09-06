function createCollection() {
  const store = new Map();

  function doc(id) {
    return {
      async set(data) { store.set(id, { ...data }); },
      async get() { return { exists: store.has(id), data: () => store.get(id) }; },
      async delete() { store.delete(id); },
      async update(partial) { const prev = store.get(id) || {}; store.set(id, { ...prev, ...partial }); }
    };
  }

  async function getAll() {
    const docs = Array.from(store.values()).map(v => ({ data: () => v }));
    return { docs, empty: docs.length === 0 };
  }

  function where(field, op, value) {
    const filtered = Array.from(store.values()).filter(v => v[field] === value);
    const chain = {
      _list: filtered,
      where() { return chain; },
      orderBy() { return chain; },
      limit(n) { chain._list = chain._list.slice(0, n); return chain; },
      async get() { const docs = chain._list.map(v => ({ data: () => v })); return { docs, empty: docs.length === 0 }; }
    };
    return chain;
  }

  function orderBy(field, dir) {
    const arr = Array.from(store.values()).sort((a, b) => (a[field] || 0) - (b[field] || 0));
    const chain = {
      _list: dir === 'desc' ? arr.reverse() : arr,
      where() { return chain; },
      orderBy() { return chain; },
      limit(n) { chain._list = chain._list.slice(0, n); return chain; },
      async get() { const docs = chain._list.map(v => ({ data: () => v })); return { docs, empty: docs.length === 0 }; }
    };
    return chain;
  }

  return { doc, async get() { return getAll(); }, where, orderBy };
}

export function createMockDb() {
  const collections = new Map();
  function collection(name) {
    if (!collections.has(name)) collections.set(name, createCollection());
    return collections.get(name);
  }
  return { collection };
}

