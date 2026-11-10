import {loadCatalog,publicCatalog,sendJson} from './catalog.mjs';
export default async function handler(req,res){if(req.method!=='GET')return sendJson(res,{error:'Method not allowed'},405);try{return sendJson(res,publicCatalog(await loadCatalog()));}catch(error){console.error('Shelf catalog unavailable:',error.name);return sendJson(res,{error:'Asset catalog unavailable'},503);}}
