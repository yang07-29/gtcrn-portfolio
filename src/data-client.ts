/** Read-only adapter for the versioned public snapshot. No cloud API calls. */
export const BASE_URL = import.meta.env?.BASE_URL ?? '/gtcrn-portfolio/';

export function assetUrl(path: string, base = BASE_URL): string {
  if (!/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(base)) throw new Error('Invalid public base path');
  if (/^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith('//')) throw new Error('Expected a local public asset');
  const relative = path.replace(/^\/+/, '');
  if (relative.split('/').some(part => part === '..' || part === '.')) throw new Error('Invalid public asset path');
  return base + relative;
}

export function mapAssetUrls(value: unknown, base = BASE_URL): any {
  if (typeof value === 'string') return /^\/(?:audio|data)\//.test(value) ? assetUrl(value, base) : value;
  if (Array.isArray(value)) return value.map(item => mapAssetUrls(item, base));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, mapAssetUrls(item, base)]));
  return value;
}

const cases = new Set(['keyboard-strong', 'fan-strong', 'clean-control']);
export function staticPath(route: string): string {
  if (route === '/api/public') return 'data/evidence.json';
  const match = /^\/api\/public\/cases\/([a-z-]+)$/.exec(route);
  if (match && cases.has(match[1])) return `data/cases/${match[1]}.json`;
  throw new Error('公开快照不提供此操作，请使用本机工作台。');
}

export function createStaticApi(fetcher: typeof fetch = fetch, base = BASE_URL) {
  const pending = new Map<string, Promise<any>>();
  return async function readSnapshot(route: string) {
    const path = staticPath(route);
    let request = pending.get(path);
    if (!request) {
      request = (async () => {
        const response = await fetcher(assetUrl(path, base), {method: 'GET', cache: 'no-cache', credentials: 'omit', redirect: 'error'});
        if (!response.ok) throw new Error('公开实验快照暂时无法读取，请稍后重试。');
        if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('快照格式异常，请刷新页面重试。');
        const data = await response.json();
        if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('实验快照缺少有效记录。');
        return mapAssetUrls(data, base);
      })();
      pending.set(path, request);
      request.catch(() => pending.delete(path));
    }
    return request;
  };
}

export const api = createStaticApi();
