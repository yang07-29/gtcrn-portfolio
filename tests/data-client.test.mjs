import test from 'node:test';
import assert from 'node:assert/strict';
import {assetUrl, mapAssetUrls, staticPath, createStaticApi} from '../src/data-client.ts';

test('project subpath is kept for audio, evidence and the root hosting variant', () => {
  assert.equal(assetUrl('/audio/test.wav'), '/gtcrn-portfolio/audio/test.wav');
  assert.equal(assetUrl('data/evidence.json', '/'), '/data/evidence.json');
  assert.throws(() => assetUrl('../private.json'));
  assert.throws(() => assetUrl('https://example.com/private.json'));
});

test('runtime URL mapping leaves scientific data, null values and the raw object intact', () => {
  const raw = {media:{input:'/audio/a.wav'}, value:6.142953331919869, spread:.43171105017373185, missing:null, source:'reports/frozen.json', license:'https://example.com/license'};
  const mapped = mapAssetUrls(raw);
  assert.equal(mapped.media.input, '/gtcrn-portfolio/audio/a.wav');
  assert.equal(raw.media.input, '/audio/a.wav');
  for (const key of ['value','spread','missing','source','license']) assert.deepEqual(mapped[key], raw[key]);
});

test('only the public catalog and three approved cases can be read', () => {
  assert.equal(staticPath('/api/public'), 'data/evidence.json');
  assert.equal(staticPath('/api/public/cases/fan-strong'), 'data/cases/fan-strong.json');
  for (const route of ['/api/runner/claim','/api/tasks','/api/public/cases/unknown','/api/public/cases/../private','https://example.com/api/public','/api/public?token=x']) assert.throws(() => staticPath(route));
});

test('parallel readers share a single GET to the static project path', async () => {
  const calls = [];
  const api = createStaticApi(async (...args) => {calls.push(args);return new Response(JSON.stringify({cases:[]}),{headers:{'content-type':'application/json'}});});
  assert.deepEqual(await Promise.all([api('/api/public'),api('/api/public')]),[{cases:[]},{cases:[]}]);
  assert.equal(calls.length,1);
  assert.equal(calls[0][0],'/gtcrn-portfolio/data/evidence.json');
  assert.equal(calls[0][1].method,'GET');
  assert.equal(calls[0][1].credentials,'omit');
});

test('failed reads can be retried without caching an HTML denial as evidence', async () => {
  let calls=0;
  const api = createStaticApi(async () => ++calls===1 ? new Response('<html>blocked</html>',{status:403,headers:{'content-type':'text/html'}}) : new Response('{"value":null}',{headers:{'content-type':'application/json'}}));
  await assert.rejects(api('/api/public'));
  assert.deepEqual(await api('/api/public'),{value:null});
  assert.equal(calls,2);
});

test('a successful HTML fallback is rejected instead of being accepted as a snapshot', async () => {
  const api = createStaticApi(async () => new Response('<html>not JSON</html>',{headers:{'content-type':'text/html'}}));
  await assert.rejects(api('/api/public'));
});
