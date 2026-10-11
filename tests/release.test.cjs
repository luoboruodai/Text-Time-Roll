const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),python=process.platform==='win32'?'python':'python3';
function run(args){return cp.execFileSync(python,args,{cwd:root,encoding:'utf8'});}
test('release ZIP is reproducible, allowlisted, source-identical and checksum verified',()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ttr-release-'));
 try{const a=path.join(tmp,'a'),b=path.join(tmp,'b');run(['tools/build_release.py','--output',a]);run(['tools/build_release.py','--output',b]);
 const file='Text-Time-Roll-v'+require('../package.json').version+'.zip';assert.deepEqual(fs.readFileSync(path.join(a,file)),fs.readFileSync(path.join(b,file)));assert.match(run(['tools/audit_public.py','--dist',a]),/PASS/);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('security checker rejects private files, machine paths and synthetic credentials',()=>{
 const script=`import sys\nsys.path.insert(0,'tools')\nfrom audit_public import scan_files, scan_content\ncases=[('PROJECT.md',b'local context'),('src/Text Time Roll.js',('ghp_'+'X'*40).encode()),('README.md',('/'+'Users'+'/example/private/file').encode()),('README.md',('sk-'+'Q'*32).encode())]\nfor name,data in cases:\n try: scan_files({name:data})\n except ValueError: continue\n raise AssertionError('security fixture accepted')\nprint('blocked')\n`;
 assert.match(run(['-c',script]),/blocked/);
});
test('version is consistent with package, source, README and release notes',()=>{
 const version=require('../package.json').version;assert.equal(require('../src/Text Time Roll.js').version,version);
 assert(fs.readFileSync(path.join(root,'README.md'),'utf8').includes('v'+version));assert(fs.existsSync(path.join(root,'docs/releases/v'+version+'.md')));
});
