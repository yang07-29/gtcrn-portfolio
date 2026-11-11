import test from 'node:test';
import assert from 'node:assert/strict';
import {measurementText} from '../src/metric-format.ts';

test('small nonzero numerical errors remain visible instead of rounding to zero',()=>{
  assert.equal(measurementText(5.133450031280518e-6,3),'5.13e-6');
  assert.equal(measurementText(2.0023435354232788e-7,3),'2.00e-7');
  assert.equal(measurementText(-0.0000004,6),'-4.00e-7');
});

test('true zero, ordinary values and missing measurements stay distinct',()=>{
  assert.equal(measurementText(0,3),'0.000');
  assert.equal(measurementText(1.1946000158786774,3),'1.195');
  assert.equal(measurementText(0.055706898,6),'0.055707');
  for(const value of [undefined,null,NaN,Infinity,'0'])assert.equal(measurementText(value),'无法确认');
});
