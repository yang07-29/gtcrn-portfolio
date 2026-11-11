import {readFile, readdir, lstat} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
export const MODEL_SHA='356bb3c94765b354138a40c9c09e0de7d39684c76e2b43a706c509e8ecb5ab03';
export const CHECKPOINT_SHA='c4475ed04a3678546bb88cb70434ca6c72179844521116386196c3e875b3a46b';
export const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
export async function filesIn(root,prefix=''){
  const result=[];
  for(const name of (await readdir(join(root,prefix))).sort()){
    const path=prefix?`${prefix}/${name}`:name,stat=await lstat(join(root,path));
    if(stat.isSymbolicLink())throw new Error(`Links are not publication assets: ${path}`);
    if(stat.isDirectory())result.push(...await filesIn(root,path));else if(stat.isFile())result.push(path);
  }return result;
}
export async function snapshotFiles(root){
  return Promise.all((await filesIn(root)).filter(path=>path!=='snapshot-manifest.json').map(async path=>{
    const bytes=await readFile(join(root,path));return {path,bytes:bytes.length,sha256:digest(bytes)};
  }));
}
export async function verifySnapshot(root,{build=false}={}){
  const manifest=JSON.parse(await readFile(join(root,'snapshot-manifest.json'),'utf8')),actual=await snapshotFiles(root);
  const approved=new Set(manifest.files.map(file=>file.path));
  const compared=build?actual.filter(file=>approved.has(file.path)):actual;
  if(build&&actual.some(file=>!approved.has(file.path)&&file.path!=='index.html'&&!/^assets\/[^/]+\.(?:js|css)$/.test(file.path)))throw new Error('Unexpected file in the public build');
  if(JSON.stringify(compared)!==JSON.stringify(manifest.files))throw new Error('Snapshot byte identity or file allowlist changed');
  const catalogue=JSON.parse(await readFile(join(root,'data/evidence.json'),'utf8'));
  if(catalogue.batches.length!==13||catalogue.cases.length!==3||actual.filter(x=>x.path.endsWith('.wav')).length!==9)throw new Error('Unexpected approved snapshot counts');
  if(catalogue.model.sha256!==MODEL_SHA||catalogue.model.checkpointSha256!==CHECKPOINT_SHA||catalogue.model.frozen!==true||catalogue.model.seed!==17)throw new Error('Frozen model identity changed');
  const allowed=new Set(actual.map(x=>x.path));let references=0;
  const check=value=>{
    if(typeof value==='string'&&/^\/(?:data|audio)\//.test(value)){
      if(!allowed.has(value.slice(1)))throw new Error(`Broken public evidence link: ${value}`);references++;
    }else if(Array.isArray(value))value.forEach(check);else if(value&&typeof value==='object')Object.values(value).forEach(check);
  };check(catalogue);
  for(const item of catalogue.cases){
    if(!['keyboard-strong','fan-strong','clean-control'].includes(item.id))throw new Error('Unapproved case');
    check(JSON.parse(await readFile(join(root,`data/cases/${item.id}.json`),'utf8')));
  }
  const seed=catalogue.batches.find(x=>x.id==='three-seed-replication');
  const target=seed.metrics.find(x=>x.dataset==='controlled_target'&&x.metricId==='si_sdr_db'&&x.method==='E4-E3c');
  const official=seed.metrics.find(x=>x.dataset==='official_full'&&x.metricId==='si_sdr_db'&&x.method==='E4-E3c');
  if(target.value!==6.142953331919869||target.spread!==0.43171105017373185||official.value!==-0.23858917761821957)throw new Error('Seed results, spread or negative control changed');
  for(const id of ['device_playback','live_microphone','unfamiliar_wav']){
    const capability=catalogue.capabilities.find(x=>x.id===id);
    if(!capability||!['not_tested','unconfirmed'].includes(capability.status))throw new Error('An unverified boundary was upgraded');
  }
  return {files:actual.length,batches:catalogue.batches.length,cases:catalogue.cases.length,audioFiles:9,checkedReferences:references,modelSha256:MODEL_SHA,catalogueSha256:digest(await readFile(join(root,'data/evidence.json')))};
}
