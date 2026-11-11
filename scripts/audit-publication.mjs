import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {digest} from './snapshot.mjs';
const files=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
if(!files.length)throw new Error('Stage the explicit public source before auditing');
const allowedRoots=['.github/','docs/','licenses/','public/','scripts/','src/','tests/'];
const allowedFiles=new Set(['.gitignore','.gitattributes','README.md','index.html','package.json','package-lock.json','tsconfig.json','vite.config.ts']);
const secret=/(?:gh[pousr]_[A-Za-z0-9]{24,}|github_pat_[A-Za-z0-9_]{24,}|Bearer\s+[A-Za-z0-9_.-]{24,})/;
for(const file of files){
  if(!allowedFiles.has(file)&&!allowedRoots.some(root=>file.startsWith(root)))throw new Error(`Unapproved publication path: ${file}`);
  if(/(?:^|\/)(?:node_modules|outputs|\.cache|\.wrangler|runs|\.env[^/]*)\//.test(file)||/\.(?:onnx|pt|pth|pem|key|zip|gz)$/.test(file))throw new Error(`Private artifact staged: ${file}`);
  const bytes=execFileSync('git',['show',':'+file],{maxBuffer:16*1024*1024});
  if(!file.endsWith('.wav')){
    const text=bytes.toString('utf8');
    if(secret.test(text)||/(?<![A-Za-z0-9])[A-Za-z]:[\\/]/.test(text))throw new Error(`Credential or absolute machine path staged: ${file}`);
  }
}
const manifest=JSON.parse(await readFile('public/snapshot-manifest.json','utf8'));
for(const file of manifest.files){
  const bytes=execFileSync('git',['show',':public/'+file.path],{maxBuffer:16*1024*1024});
  if(digest(bytes)!==file.sha256||bytes.length!==file.bytes)throw new Error(`Git line conversion changed frozen bytes: ${file.path}`);
}
console.log(JSON.stringify({status:'passed',stagedPublicFiles:files.length,frozenAssetGitIdentities:manifest.files.length,privateArtifacts:0},null,2));
