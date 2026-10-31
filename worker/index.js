const ADDRESS = "lawrencelove@yahoo.com";
const COOKIE = "recipes_session";
const encoder = new TextEncoder();
const json = (value, status=200, headers={}) => Response.json(value,{status,headers:{"Cache-Control":"no-store",...headers}});
const bytesToHex = (bytes) => [...bytes].map(b=>b.toString(16).padStart(2,"0")).join("");
const randomToken = (n=32) => {const b=new Uint8Array(n);crypto.getRandomValues(b);return bytesToHex(b);};
async function digest(secret, value) {
  const key=await crypto.subtle.importKey("raw",encoder.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  return bytesToHex(new Uint8Array(await crypto.subtle.sign("HMAC",key,encoder.encode(value))));
}
function cookieValue(request) {
  const raw=request.headers.get("Cookie")||"";
  const match=raw.match(/(?:^|;\s*)recipes_session=([a-f0-9]{64})(?:;|$)/);
  return match?.[1]||"";
}
const cookie = (token,age) => `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=${age}`;
async function authorized(request,env,now) {
  const token=cookieValue(request);
  if(!token)return false;
  const hash=await digest(env.AUTH_SECRET,"session:"+token);
  const row=await env.DB.prepare("SELECT expires_at FROM sessions WHERE token_hash=?").bind(hash).first();
  return !!row && row.expires_at>now;
}
async function sendCode(env,code) {
  if(!env.RESEND_API_KEY || !env.EMAIL_FROM) throw new Error("Email provider not configured");
  const result=await fetch("https://api.resend.com/emails",{
    method:"POST",
    headers:{"Authorization":"Bearer "+env.RESEND_API_KEY,"Content-Type":"application/json"},
    body:JSON.stringify({from:env.EMAIL_FROM,to:[ADDRESS],subject:"Your Recipes access code",
      text:`Your Recipes sign-in code is ${code}. It expires in 10 minutes. If you did not request it, ignore this message.`})
  });
  if(!result.ok) throw new Error("Email delivery failed");
}
async function readBody(request) {
  if(Number(request.headers.get("content-length")||0)>2048)throw new Error("Invalid request");
  return request.json().catch(()=>({}));
}
export default {
 async fetch(request,env) {
  const url=new URL(request.url),path=url.pathname,now=Date.now();
  if(!env.DB || !env.AUTH_SECRET) return json({error:"Authentication service not configured"},503);
  try {
   if(path==="/api/health" && request.method==="GET"){
     const row=await env.DB.prepare("SELECT 1 AS ok").first();
     return json({status:row?.ok===1?"ok":"error"});
   }
   if(path==="/api/auth/request" && request.method==="POST"){
     // Requests never accept an email address: codes always go to the fixed mailbox.
     const ip=request.headers.get("CF-Connecting-IP")||"unknown";
     const ipHash=await digest(env.AUTH_SECRET,"ip:"+ip);
     const recent=await env.DB.prepare("SELECT COUNT(*) AS n FROM login_requests WHERE ip_hash=? AND created_at>?")
       .bind(ipHash,now-3600000).first();
     if((recent?.n||0)>=5)return json({error:"Too many requests. Try again later."},429);
     await env.DB.prepare("INSERT INTO login_requests (ip_hash,created_at) VALUES (?,?)").bind(ipHash,now).run();
     const raw=new Uint32Array(1);crypto.getRandomValues(raw);
     const code=String(raw[0]%1000000).padStart(6,"0");
     const hash=await digest(env.AUTH_SECRET,"code:"+code);
     const id="fixed";
     // Keep only the newest code valid.
     await env.DB.prepare("INSERT INTO login_codes (id,code_hash,expires_at,attempts,consumed_at) VALUES (?,?,?,?,NULL) ON CONFLICT(id) DO UPDATE SET code_hash=excluded.code_hash,expires_at=excluded.expires_at,attempts=0,consumed_at=NULL")
       .bind(id,hash,now+600000,0).run();
     try{await sendCode(env,code);}catch(error){return json({error:"Email delivery is not configured or failed"},503);}
     return json({ok:true});
   }
   if(path==="/api/auth/verify" && request.method==="POST"){
     const body=await readBody(request),code=String(body.code||"");
     if(!/^\d{6}$/.test(code))return json({error:"Invalid or expired code"},400);
     const row=await env.DB.prepare("SELECT code_hash,expires_at,attempts,consumed_at FROM login_codes WHERE id='fixed'").first();
     if(!row || row.expires_at<=now || row.consumed_at || row.attempts>=5)return json({error:"Invalid or expired code"},401);
     // Conditional increment prevents racing multiple requests past the attempt limit.
     const increment=await env.DB.prepare("UPDATE login_codes SET attempts=attempts+1 WHERE id='fixed' AND attempts<5 AND consumed_at IS NULL AND expires_at>?").bind(now).run();
     if(!increment.meta?.changes)return json({error:"Invalid or expired code"},401);
     const hash=await digest(env.AUTH_SECRET,"code:"+code);
     if(hash!==row.code_hash)return json({error:"Invalid or expired code"},401);
     const consumed=await env.DB.prepare("UPDATE login_codes SET consumed_at=? WHERE id='fixed' AND code_hash=? AND consumed_at IS NULL AND expires_at>?").bind(now,hash,now).run();
     if(!consumed.meta?.changes)return json({error:"Invalid or expired code"},401);
     const token=randomToken(),tokenHash=await digest(env.AUTH_SECRET,"session:"+token);
     const duration=30*24*60*60*1000;
     await env.DB.prepare("INSERT INTO sessions(token_hash,expires_at,created_at) VALUES (?,?,?)").bind(tokenHash,now+duration,now).run();
     return json({ok:true},200,{"Set-Cookie":cookie(token,Math.floor(duration/1000))});
   }
   if(path==="/api/auth/logout" && request.method==="POST"){
     const token=cookieValue(request);
     if(token)await env.DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(await digest(env.AUTH_SECRET,"session:"+token)).run();
     return json({ok:true},200,{"Set-Cookie":cookie("",0)});
   }
   const loggedIn=await authorized(request,env,now);
   if(path==="/api/auth/me" && request.method==="GET")return json({authenticated:loggedIn});
   if(path==="/api/recipes" && request.method==="GET" && loggedIn){
     const rows=await env.DB.prepare("SELECT * FROM recipes ORDER BY title COLLATE NOCASE").all();
     return json({recipes:rows.results||[]});
   }
   if(/^\\/api\\/recipes\\/\\d+$/.test(path) && request.method==="GET" && loggedIn){
     const id=Number(path.split("/").pop());
     const recipe=await env.DB.prepare("SELECT * FROM recipes WHERE id=?").bind(id).first();
     if(!recipe)return json({error:"Recipe not found"},404);
     const [ingredients,instructions]=await Promise.all([
       env.DB.prepare("SELECT g.id AS group_id,g.heading,g.sort_order AS group_order,i.* FROM ingredient_groups g LEFT JOIN ingredients i ON i.group_id=g.id WHERE g.recipe_id=? ORDER BY g.sort_order,i.sort_order").bind(id).all(),
       env.DB.prepare("SELECT g.id AS group_id,g.heading,g.sort_order AS group_order,s.* FROM instruction_groups g LEFT JOIN instruction_steps s ON s.group_id=g.id WHERE g.recipe_id=? ORDER BY g.sort_order,s.sort_order").bind(id).all()
     ]);
     return json({recipe,ingredients:ingredients.results||[],instructions:instructions.results||[]});
   }
   if(path.startsWith("/api/"))return json({error:loggedIn?"Not implemented":"Unauthorized"},loggedIn?404:401);
   if(!loggedIn){
     if(path==="/login.js" || path==="/login.html"){
       return env.ASSETS.fetch(request);
     }
     if(path==="/" || path==="/index.html" || request.headers.get("Accept")?.includes("text/html"))
       return Response.redirect(new URL("/login.html",url),302);
     return json({error:"Unauthorized"},401);
   }
   // Never expose source/configuration files via the broad static-assets directory.
   if(path.startsWith("/worker/")||path.startsWith("/migrations/")||path.startsWith("/scripts/")||
      path.startsWith("/.github/")||path.startsWith("/public-login/")||
      ["/wrangler.jsonc","/package.json","/CLOUDFLARE_MIGRATION.md"].includes(path))
     return json({error:"Not found"},404);
   if(path==="/sw.js") return json({error:"Not found"},404);
   return env.ASSETS.fetch(request);
  }catch(error){return json({error:"Request could not be completed"},500);}
 }
};
