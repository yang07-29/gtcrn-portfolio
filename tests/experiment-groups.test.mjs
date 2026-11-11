import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {selectExperiments} from '../src/experiment-groups.ts';
test('all 13 historical batches remain discoverable, including both DNSMOS failure/recovery records',async()=>{
 const data=JSON.parse(await readFile('public/data/evidence.json','utf8'));
 assert.equal(selectExperiments(data.batches,'all').length,13);
 const groups=['research','engineering','scenarios','failures'];
 const ids=groups.flatMap(group=>selectExperiments(data.batches,group).map(batch=>batch.id));
 assert.equal(new Set(ids).size,13);assert.equal(ids.length,13);
 assert.deepEqual(selectExperiments(data.batches,'failures').map(batch=>batch.id),['dnsmos-v1','dnsmos-v2']);
 assert.deepEqual(selectExperiments(data.batches,'featured').map(batch=>batch.id),['three-seed-replication','file-streaming','external-noise-12','noise-strength-42']);
});
