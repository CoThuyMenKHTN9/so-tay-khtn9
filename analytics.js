/* V2.7 – Chỉ đếm lượt mở ứng dụng và bài học; không lưu người dùng.
   Yêu cầu HTTPS và Google Apps Script web app thống kê đã cấu hình. */
(()=>{
'use strict';
const endpoint=String(window.SOTAY_ANALYTICS_ENDPOINT||'').trim();
const valid=/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec\/?$/.test(endpoint);
const enabled=valid && location.protocol==='https:';
let lastLesson=null;
function transmit(event,lesson){
  if(!enabled)return;
  if(event!=='app'&&event!=='lesson')return;
  if(event==='lesson' && (!Number.isInteger(lesson)||lesson<1||lesson>17))return;
  const payload=new URLSearchParams({event,lesson:event==='lesson'?String(lesson):'0'});
  // Text/plain form-urlencoded POST is a simple request; fire-and-forget.
  try {
    if(navigator.sendBeacon && navigator.sendBeacon(endpoint,payload))return;
    fetch(endpoint,{method:'POST',mode:'no-cors',keepalive:true,body:payload,redirect:'follow'}).catch(()=>{});
  } catch(e) {}
}
function trackRoute(){
  const m=(location.hash||'').match(/^#lesson\/(\d+)(?:$|[?&])/);
  const lesson=m?Number(m[1]):null;
  if(lesson!==null && lesson!==lastLesson)transmit('lesson',lesson);
  lastLesson=lesson;
}
window.SOTAY_ANALYTICS_ENABLED=enabled;
if(enabled){
  transmit('app',0);
  trackRoute();
  addEventListener('hashchange',trackRoute);
}
})();
