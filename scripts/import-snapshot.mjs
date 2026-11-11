/** Explicit one-time import from the already curated Site checkout. */
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {filesIn,snapshotFiles,digest,verifySnapshot} from './snapshot.mjs';
const source=process.argv[2];if(!source)throw new Error('Pass the curated Site checkout as one path argument');
const root=resolve('public'),origin=resolve(source);
for(const relative of await filesIn(join(origin,'public'))){
  const original=await readFile(join(origin,'public',relative)),copied=await readFile(join(root,relative));
  if(digest(original)!==digest(copied))throw new Error(`Public asset differs from approved origin: ${relative}`);
}
if(digest(await readFile(join(origin,'data/evidence.json')))!==digest(await readFile(join(root,'data/evidence.json'))))throw new Error('Catalogue bytes differ from approved origin');
const manifest={schemaVersion:1,description:'Approved public snapshot copied byte-for-byte; scientific records are immutable.',exportedAt:new Date().toISOString(),sourceCommit:execFileSync('git',['-C',origin,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),files:await snapshotFiles(root)};
await writeFile(join(root,'snapshot-manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(await verifySnapshot(root),null,2));
