import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {digest} from './snapshot.mjs';
const base=new URL(process.argv[2]||'');
if(!((base.protocol==='https:'&&base.hostname==='yang07-29.github.io')||(base.protocol==='http:'&&base.hostname==='127.0.0.1'))||base.pathname!=='/gtcrn-portfolio/'||base.search||base.hash)throw new Error('Expected the exact public project root or its loopback preview');
const checks=[];
async function get(path,options={}){
  const url=new URL(path,base);if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname))throw new Error('Out-of-project request rejected');
  const response=await fetch(url,{...options,redirect:'error',credentials:'omit',signal:AbortSignal.timeout(20000)});
  const bytes=new Uint8Array(await response.arrayBuffer());
  return {response,bytes};
}
async function check(id,callback){try{const detail=await callback();checks.push({...detail,id,status:'passed'});}catch(error){checks.push({id,status:'failed',reason:error.message});}}
function expect(condition,message){if(!condition)throw new Error(message);}
let html='',liveManifest;
await check('home',async()=>{const {response,bytes}=await get('');expect(response.status===200,'Homepage did not return 200');html=new TextDecoder().decode(bytes);expect(html.includes('GTCRN LAB')&&response.headers.get('content-type')?.includes('text/html'),'Unexpected homepage');return {httpStatus:response.status};});
await check('snapshot-manifest',async()=>{const {response,bytes}=await get('snapshot-manifest.json');expect(response.status===200,'Manifest unavailable');expect(response.headers.get('content-type')?.includes('application/json'),'Manifest is not JSON');const expected=await readFile('public/snapshot-manifest.json');expect(digest(bytes)===digest(expected),'Live manifest differs from approved local snapshot');liveManifest=JSON.parse(new TextDecoder().decode(bytes));return {httpStatus:response.status,sha256:digest(bytes)};});
if(liveManifest){
  const queue=liveManifest.files.filter(file=>file.path!=='.nojekyll');
  async function worker(){while(queue.length){const item=queue.shift();await check('asset:'+item.path,async()=>{const {response,bytes}=await get(item.path);expect(response.status===200,'Asset unavailable');expect(bytes.length===item.bytes&&digest(bytes)===item.sha256,'Asset bytes changed');if(item.path.endsWith('.wav'))expect(new TextDecoder().decode(bytes.slice(0,4))==='RIFF','Invalid WAV header');if(item.path.endsWith('.json'))expect(response.headers.get('content-type')?.includes('application/json'),'JSON asset has wrong content type');return {httpStatus:response.status,bytes:bytes.length,sha256:item.sha256};});}}
  await Promise.all([worker(),worker(),worker(),worker()]);
}
const bundlePaths=[...new Set([...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match=>match[1]).filter(path=>path.includes('/assets/')))];
expect(bundlePaths.length>=2,'Missing compiled application assets');
for(const path of bundlePaths)await check('bundle:'+path,async()=>{const {response,bytes}=await get(path);expect(response.status===200,'Compiled application asset unavailable');expect(bytes.length>0,'Empty application asset');return {httpStatus:response.status,bytes:bytes.length};});
const audio=liveManifest?.files.find(item=>item.path.endsWith('-input.wav'));
let range;
if(audio)await check('audio-range',async()=>{const {response,bytes}=await get(audio.path,{headers:{Range:'bytes=0-63'}});range={status:response.status,contentRange:response.headers.get('content-range'),bytes:bytes.length};expect(response.status===200||response.status===206,'Audio is not downloadable');if(response.status===206)expect(bytes.length===64&&range.contentRange?.startsWith('bytes 0-63/'),'Invalid partial audio response');return {httpStatus:response.status,rangeSupported:response.status===206,...range};});
const report={checkedAtUtc:new Date().toISOString(),base:base.href,scope:'HTTP, deployed bundle and public snapshot byte identities; does not certify browser interaction, listening, microphone or cloud inference.',passed:checks.filter(x=>x.status==='passed').length,failed:checks.filter(x=>x.status==='failed').length,checks};
await mkdir('outputs',{recursive:true});const path=resolve('outputs','live-verification-'+report.checkedAtUtc.replace(/[:.]/g,'-')+'.json');await writeFile(path,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({base:report.base,passed:report.passed,failed:report.failed,range,reportPath:path,failures:checks.filter(x=>x.status==='failed')},null,2));
if(report.failed)process.exitCode=1;
