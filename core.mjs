export const STORE_KEY='hieu-sau-v1';
export function initialState(){return {version:1,subject:'physics',custom:[],customExams:[],progress:{},favorites:[],examSessions:{}}}
export function normalizeNumber(value){
 let s=String(value??'').trim().replace(/−/g,'-').replace(/,/g,'.').replace(/\s+/g,'');
 if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:\/[+-]?(?:\d+(?:\.\d*)?|\.\d+))?$/.test(s))return NaN;
 if(s.includes('/')){const [a,b]=s.split('/').map(Number);return b===0?NaN:a/b;}return Number(s);
}
export function checkAnswer(step,value){if(step.kind==='choice')return value!==''&&value!==null&&Number(value)===step.answer;const n=normalizeNumber(value);return Number.isFinite(n)&&Math.abs(n-step.answer)<=Math.max(1e-8,Math.abs(step.answer)*1e-6)}
export function classify(p={}){if(p.completed)return p.viewed?'viewed':p.hintsUsed||p.hadError?'hinted':'solved';if(p.review||p.hadError||p.viewed)return 'wrong';if(p.started)return 'started';return 'new'}
export function needsReview(p={}){return !!p.review||(!p.completed&&(!!p.hadError||!!p.viewed))}
export function validateState(v){
 if(!v||v.version!==1||!['math','physics'].includes(v.subject)||!Array.isArray(v.custom)||!Array.isArray(v.customExams)||!Array.isArray(v.favorites)||!v.progress||typeof v.progress!=='object'||Array.isArray(v.progress)||!v.examSessions||typeof v.examSessions!=='object'||Array.isArray(v.examSessions))return false;
 const isText=(s,max=50000)=>typeof s==='string'&&s.length<=max;
 if(!v.custom.every(e=>e&&isText(e.id,100)&&e.id.startsWith('u-')&&['physics','math'].includes(e.subject)&&isText(e.title,200)&&isText(e.text)&&isText(e.topic,100)&&isText(e.grade,10)&&Number.isInteger(e.level)&&e.level>=0&&e.level<=2&&Array.isArray(e.steps)&&e.steps.length<=1&&e.steps.every(s=>s.kind==='number'&&typeof s.answer==='number'&&Number.isFinite(s.answer)&&isText(s.prompt)&&Array.isArray(s.hints)&&s.hints.every(h=>isText(h)))&&(!e.attachment||(isText(e.attachment.data,3000000)&&/^data:(image\/(png|jpeg|webp)|application\/pdf);base64,[A-Za-z0-9+/=]+$/.test(e.attachment.data)&&isText(e.attachment.name,300)))))return false;
 if(!v.customExams.every(e=>e&&isText(e.id,100)&&e.id.startsWith('ue-')&&isText(e.title,200)&&['physics','math'].includes(e.subject)&&Array.isArray(e.ids)&&e.ids.every(id=>isText(id,100))&&Number.isInteger(e.duration)&&e.duration>0&&e.duration<=300))return false;
 if(!v.favorites.every(id=>isText(id,100)))return false;
 const safeKeys=o=>Object.keys(o).every(k=>!['__proto__','constructor','prototype'].includes(k));
 const record=o=>o&&typeof o==='object'&&!Array.isArray(o)&&safeKeys(o);
 const answer=a=>a===null||typeof a==='string'||typeof a==='number';
 const safeImage=s=>isText(s,3000000)&&/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(s);
 return safeKeys(v.progress)&&safeKeys(v.examSessions)&&Object.values(v.progress).every(p=>record(p)&&(!p.answers||(Array.isArray(p.answers)&&p.answers.every(answer)))&&(!p.passed||(Array.isArray(p.passed)&&p.passed.every(a=>a===null||typeof a==='boolean')))&&(!p.hintLevel||(Array.isArray(p.hintLevel)&&p.hintLevel.every(a=>a===null||Number.isInteger(a)&&a>=0)))&&(!p.notes||isText(p.notes))&&(!p.workImage||safeImage(p.workImage)))&&Object.values(v.examSessions).every(s=>record(s)&&['test','practice'].includes(s.mode)&&record(s.answers)&&Object.values(s.answers).every(answer)&&(!s.deadline||typeof s.deadline==='number'&&Number.isFinite(s.deadline)))&&(!v.lessonDrafts||record(v.lessonDrafts)&&Object.values(v.lessonDrafts).every(s=>isText(s)));
}
