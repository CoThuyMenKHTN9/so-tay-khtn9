/* Sổ tay KHTN9 v2.8: bộ nhớ đệm bền vững, không tải trước trò chơi nặng. */
const CACHE='sotay-khtn9-v2-8-4-header-assistant';
const PREFIX='sotay-khtn9-';
const CORE=['./','./index.html','./style.css','./app.js','./teacher-auth.js','./onboarding.js','./data.js','./media.js','./simulations.js','./games.js','./game-catalog.js','./practice-data.js','./question-config.js','./question-sync.js','./analytics-config.js','./analytics.js','./manifest.webmanifest','./assets/logo-co-thuy-men.webp','./assets/hero-kham-pha-vat-ly.webp','./assets/student-3d.webp','./assets/teacher-3d.webp','./assets/book-3d.webp','./assets/game-tools-3d.webp','./assets/assistant-3d.webp'];
const LESSONS=Array.from({length:17},(_,i)=>'./assets/lesson'+String(i+1).padStart(2,'0')+'.webp');
const putOne=async (cache,path)=>{try{const r=await fetch(path,{cache:'reload'});if(r.ok)await cache.put(path,r.clone())}catch(e){/* Tệp riêng hỏng không làm gián đoạn toàn bộ */}};
self.addEventListener('install',e=>e.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 await Promise.allSettled(CORE.map(path=>putOne(cache,path)));
 // Hình của 17 bài tải sau phần thiết yếu nhưng trước khi hoàn tất cài ngoại tuyến.
 await Promise.allSettled(LESSONS.map(path=>putOne(cache,path)));
 await self.skipWaiting();
})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{
 const names=await caches.keys();await Promise.all(names.filter(n=>n.startsWith(PREFIX)&&n!==CACHE).map(n=>caches.delete(n)));await self.clients.claim();
})()));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const url=new URL(e.request.url);
 if(url.origin!==self.location.origin)return;
 // Không lưu HTML của trò chơi vào bộ nhớ đệm ban đầu; tải khi giáo viên mở.
 const isGame=url.pathname.includes('/games/');
 const shell=/\.(js|css|html|webmanifest)$/.test(url.pathname)||url.pathname.endsWith('/');
 if(shell&&!isGame){
  e.respondWith(fetch(e.request).then(res=>{
    if(res.ok){const copy=res.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{}));}
    return res;
  }).catch(async()=>await caches.match(e.request)||Response.error()));
  return;
 }
 e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
   if(res.ok){const copy=res.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{}));}
   return res;
 }).catch(()=>Response.error())));
});
