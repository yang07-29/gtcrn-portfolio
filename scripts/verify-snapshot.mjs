import {resolve} from 'node:path';
import {verifySnapshot} from './snapshot.mjs';
console.log(JSON.stringify({status:'passed',...await verifySnapshot(resolve(process.argv[2]||'public'),{build:process.argv.includes('--build')})},null,2));
