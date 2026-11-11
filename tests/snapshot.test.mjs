import test from 'node:test';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {verifySnapshot} from '../scripts/snapshot.mjs';
test('approved bytes, negative controls and verification boundaries survive export',async()=>{
  const report=await verifySnapshot(resolve('public'));
  assert.equal(report.batches,13);assert.equal(report.cases,3);assert.equal(report.audioFiles,9);assert.ok(report.checkedReferences>=30);
});
