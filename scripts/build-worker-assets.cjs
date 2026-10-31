const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const out=path.join(root,"dist");
fs.rmSync(out,{recursive:true,force:true});
fs.mkdirSync(out,{recursive:true});
for(const name of ["index.html","css","js","images","assets","public-login"]){
 const src=path.join(root,name);
 if(fs.existsSync(src))fs.cpSync(src,path.join(out,name),{recursive:true});
}
// Deliberately omit sw.js: the legacy offline cache can bypass the auth gate.
// Existing registration in index.html will fail safely until replaced.
// Login resources must be available at their public URLs while unauthenticated.
fs.copyFileSync(path.join(out,"public-login","login.html"),path.join(out,"login.html"));
fs.copyFileSync(path.join(out,"public-login","login.js"),path.join(out,"login.js"));
console.log("Built curated Worker assets in dist/");
