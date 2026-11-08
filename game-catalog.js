/* Quản lý kho trò chơi — chỉ ghi localStorage trên máy đang sử dụng. */
(function(){'use strict';
const KEY='sotay-game-catalog-v20', MAX=200;
const base=(window.SOTAY_GAMES||[]).map((g,i)=>({id:'game-'+(i+1),name:g.name,url:g.url,image:g.image||'',description:g.description||'Trò chơi tương tác 4 đội, có thể dùng nhiều bài, nhiều lớp'}));
const validGameURL=s=>typeof s==='string'&&s.length<=500&&((/^https:\/\/[^\s"'<>]+$/i.test(s))||(/^games\/[a-z0-9][a-z0-9_.\/-]*\.html(?:\?[^\s"'<>]*)?$/i.test(s)&&!s.includes('..')));
const validImage=s=>!s||(typeof s==='string'&&s.length<=500&&((/^https:\/\/[^\s"'<>]+$/i.test(s))||(/^assets\/[a-z0-9][a-z0-9_.\/-]*$/i.test(s)&&!s.includes('..'))));
function normalize(list){if(!Array.isArray(list)||list.length>MAX)throw Error('Danh mục phải là mảng không quá '+MAX+' trò chơi');const ids=new Set();return list.map((g,i)=>{if(!g||typeof g!=='object')throw Error('Dữ liệu trò chơi không hợp lệ');const id=String(g.id||('game-'+(i+1))).slice(0,80),name=String(g.name||'').trim().slice(0,120),url=String(g.url||'').trim(),image=String(g.image||'').trim(),description=String(g.description||'').trim().slice(0,220);if(!id||ids.has(id)||!name||!validGameURL(url)||!validImage(image))throw Error('Tên, ID, đường dẫn hoặc hình đại diện chưa đúng ở trò '+(i+1));ids.add(id);return {id,name,url,image,description}})}
let state;try{const saved=localStorage.getItem(KEY);state=saved?normalize(JSON.parse(saved)):normalize(base)}catch(e){state=normalize(base)}
const get=()=>state.map(g=>({...g}));
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){throw Error('Bộ nhớ thiết bị đã đầy hoặc bị chặn')}}
function replace(rows){const next=normalize(rows);const old=state;state=next;try{save()}catch(e){state=old;throw e}}
function upsert(g){const rows=get();const index=rows.findIndex(x=>x.id===g.id);const item={...g,id:g.id||(crypto?.randomUUID?.()||('custom-'+Date.now()))};if(index>=0)rows[index]=item;else rows.push(item);replace(rows)}
function remove(id){replace(get().filter(x=>x.id!==id))}
function move(id,d){const a=get(),i=a.findIndex(x=>x.id===id),j=i+d;if(i<0||j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];replace(a)}
function reset(){state=normalize(base);localStorage.removeItem(KEY)}
window.GAME_CATALOG={get,replace,upsert,remove,move,reset,forExport:get,validGameURL};
})();
