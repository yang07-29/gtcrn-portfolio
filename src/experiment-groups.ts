type Batch={id?:string;[key:string]:any};
export const experimentGroups=[{id:'featured',label:'关键实验'},{id:'research',label:'算法复验'},{id:'engineering',label:'流式工程'},{id:'scenarios',label:'场景迁移'},{id:'failures',label:'失败与恢复'},{id:'all',label:'全部档案'}];
const ids:Record<string,Set<string>>={
 featured:new Set(['three-seed-replication','file-streaming','external-noise-12','noise-strength-42']),
 research:new Set(['seed17-controlled_target','seed17-official_full','seed17-clean_only','seed17-supplemental','three-seed-replication']),
 engineering:new Set(['repeatability','file-streaming','studio-delivery']),
 scenarios:new Set(['external-keyboard','external-noise-12','noise-strength-42']),
 failures:new Set(['dnsmos-v1','dnsmos-v2'])
};
export function selectExperiments<T extends Batch>(batches:T[],group:string):T[]{return group==='all'?batches:batches.filter(batch=>typeof batch.id==='string'&&ids[group]?.has(batch.id));}
