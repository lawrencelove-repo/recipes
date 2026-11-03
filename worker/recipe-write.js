// Authenticated recipe writes. All related rows are committed in one D1 batch.
const fields=["title","description","yield","active_time","total_time","categories","favorite","enabled","source","url","notes","image","instructions_raw","ingredients_raw"];
const integerId=()=>{const a=new Uint32Array(2);crypto.getRandomValues(a);return (a[0] & 0x1fffff)*0x100000000+a[1];};
const validGroups=(groups,key)=>Array.isArray(groups)&&groups.length<=100&&groups.every(g=>
  g&&typeof g.heading==="string"&&Array.isArray(g[key])&&g[key].length<=250&&
  g[key].every(x=>x&&typeof x==="object"));
export async function writeRecipe(request,env,id=null){
 const len=Number(request.headers.get("content-length")||0);
 if(len>262144)return Response.json({error:"Recipe payload too large"},{status:413});
 const body=await request.json().catch(()=>null);
 const recipe=body?.recipe;
 if(!recipe||typeof recipe!=="object"||typeof recipe.title!=="string"||
    !recipe.title.trim()||recipe.title.length>500||
    !validGroups(body.ingredientGroups,"items")||!validGroups(body.instructionGroups,"steps"))
   return Response.json({error:"Invalid recipe payload"},{status:400});
 if(id!==null){
   const found=await env.DB.prepare("SELECT id FROM recipes WHERE id=?").bind(id).first();
   if(!found)return Response.json({error:"Recipe not found"},{status:404});
 }
 const recipeId=id??integerId(),now=new Date().toISOString();
 const values=fields.map(k=>k==="favorite"?Number(!!recipe[k]):
   k==="enabled"?Number(recipe[k]===undefined||!!recipe[k]):String(recipe[k]??""));
 const statements=[];
 if(id===null){
   statements.push(env.DB.prepare("INSERT INTO recipes (id,"+fields.join(",")+",created_at,updated_at) VALUES ("+
     Array(fields.length+3).fill("?").join(",")+")").bind(recipeId,...values,now,now));
 }else{
   statements.push(env.DB.prepare("UPDATE recipes SET "+fields.map(k=>k+"=?").join(",")+
     ",updated_at=? WHERE id=?").bind(...values,now,recipeId));
   // Delete children first; D1 batch commits atomically or rolls back.
   for(const table of ["instruction_steps","ingredients","instruction_groups","ingredient_groups"])
     statements.push(env.DB.prepare("DELETE FROM "+table+" WHERE recipe_id=?").bind(recipeId));
 }
 for(const [groups,kind] of [[body.ingredientGroups,"ingredient"],[body.instructionGroups,"instruction"]]){
   groups.forEach((g,gi)=>{
     const gid=integerId();
     statements.push(env.DB.prepare("INSERT INTO "+kind+"_groups (id,recipe_id,heading,sort_order) VALUES (?,?,?,?)")
       .bind(gid,recipeId,g.heading,gi));
     (kind==="ingredient"?g.items:g.steps).forEach((item,ii)=>{
       if(kind==="instruction"){
         statements.push(env.DB.prepare("INSERT INTO instruction_steps (recipe_id,group_id,body,trailing_breaks,sort_order) VALUES (?,?,?,?,?)")
           .bind(recipeId,gid,String(item.text??""),Number(item.trailingBreaks)||0,ii));
       }else{
         const u=item.unit;
         statements.push(env.DB.prepare("INSERT INTO ingredients (recipe_id,group_id,quantity,quantity_raw,rest,unit_singular,unit_plural,unit_original,unit_index,unit_token_count,unit_is_abbrev,recognized,raw_line,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
           .bind(recipeId,gid,item.quantity??null,item.quantityRaw||"",item.rest||"",
             u?.def?.singular??null,u?.def?.plural??null,u?.original??null,
             u?.index??null,u?.tokenCount??null,u?.isAbbrev?1:0,
             item.recognized?1:0,String(item.raw??""),ii));
       }
     });
   });
 }
 if(statements.length>5000)return Response.json({error:"Recipe too large"},{status:413});
 await env.DB.batch(statements);
 return Response.json({ok:true,id:recipeId},{status:id===null?201:200,headers:{"Cache-Control":"no-store"}});
}
