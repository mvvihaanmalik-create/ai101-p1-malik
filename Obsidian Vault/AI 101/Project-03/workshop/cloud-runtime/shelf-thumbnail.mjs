import {streamThumbnail,sendJson} from './catalog.mjs';
export default async function handler(req,res){if(req.method!=='GET')return sendJson(res,{error:'Method not allowed'},405);try{return await streamThumbnail(req,res);}catch(error){console.error('Shelf thumbnail unavailable:',error.name);return sendJson(res,{error:'Thumbnail unavailable'},503);}}
