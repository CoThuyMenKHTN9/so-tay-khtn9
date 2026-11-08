/* Sổ tay KHTN9 · Hướng dẫn lần đầu + cài PWA theo thiết bị · bản 2.8.3 */
(()=>{'use strict';
const KEY='sotay_khtn9_guide_seen_v26';
const APP_URL='https://cothuymenkhtn9.github.io/so-tay-vat-li-9/';
const pages=[
 {icon:'👋',title:'Chào mừng đến với Sổ tay KHTN 9!',body:'Khám phá Vật lí bằng hình ảnh, mô phỏng, bài hát và bài tập tự luận.'},
 {icon:'📚',title:'17 bài học dễ tra cứu',body:'Chạm “17 bài học” để mở một bài, xem sơ đồ kiến thức và công thức trọng tâm.'},
 {icon:'✍️',title:'Luyện tập theo từng bước',body:'Tự viết lời giải, mở gợi ý khi cần và đối chiếu đáp án tham khảo.'},
 {icon:'🧑‍🏫',title:'Kho công cụ cho giáo viên',body:'Vòng quay, đồng hồ, 16 trò chơi 4 đội; câu hỏi tự luận được quản lý qua Google Sheets.'},
 {icon:'📱',title:'Cài sổ tay để mở nhanh',body:'Chọn “Cài ứng dụng” để xem hướng dẫn riêng cho thiết bị đang sử dụng. Các nội dung trực tuyến vẫn cần Internet.'}
];
let step=0,mode='guide',deferredInstall=null,installed=false,installDeviceOverride='';
const dialog=document.createElement('dialog');
dialog.className='welcome-dialog';dialog.id='sotayWelcomeDialog';
dialog.setAttribute('aria-label','Hướng dẫn Sổ tay KHTN 9');
dialog.innerHTML='<div class="welcome-shell"><div class="welcome-top"><span class="welcome-kicker"></span><button type="button" class="welcome-close" aria-label="Đóng hướng dẫn">✕</button></div><div id="welcomeContent" class="welcome-content"></div><div id="welcomeControls" class="welcome-bottom"></div></div>';
document.body.appendChild(dialog);
const content=dialog.querySelector('#welcomeContent'), controls=dialog.querySelector('#welcomeControls');
function seen(){try{localStorage.setItem(KEY,'yes')}catch(e){}}
function close(){if(dialog.open)dialog.close();seen()}
dialog.querySelector('.welcome-close').addEventListener('click',close);
dialog.addEventListener('cancel',seen);
function renderGreeting(){const el=document.getElementById('homeGreeting');if(!el)return;const h=new Date().getHours();el.textContent=(h<11?'Chào buổi sáng':h<13?'Chào buổi trưa':h<18?'Chào buổi chiều':'Chào buổi tối')+', các em! 👋'}
function renderGuide(){const p=pages[step];dialog.querySelector('.welcome-kicker').textContent='KHÁM PHÁ SỔ TAY · '+(step+1)+'/'+pages.length;
content.innerHTML='<div class="welcome-art" aria-hidden="true">'+p.icon+'</div><h2>'+p.title+'</h2><p>'+p.body+'</p><div class="welcome-dots">'+pages.map((_,i)=>'<span class="'+(i===step?'selected':'')+'"></span>').join('')+'</div>';
controls.innerHTML='<button type="button" class="welcome-skip" data-welcome="skip">Bỏ qua</button><div class="welcome-controls-right"><button type="button" class="welcome-back" data-welcome="back" '+(step===0?'disabled':'')+'>Quay lại</button><button type="button" class="welcome-next" data-welcome="next">'+(step===pages.length-1?'Bắt đầu học':'Tiếp tục →')+'</button></div>';
}
function getDevice(){const ua=navigator.userAgent||'';const ios=/iPad|iPhone|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);const android=/Android/i.test(ua);const inZalo=/Zalo/i.test(ua);const inFacebook=/FBAN|FBAV|FB_IAB|Instagram|Messenger/i.test(ua);const otherEmbedded=/Line\/|MicroMessenger|TikTok/i.test(ua);const inApp=inZalo||inFacebook||otherEmbedded;const safari=/Safari/i.test(ua)&&!/CriOS|FxiOS|EdgiOS|OPiOS|Chrome|Chromium|Edg/i.test(ua);const chrome=/Chrome|CriOS/i.test(ua)&&!/Edg|OPR|SamsungBrowser|FBAN|FBAV/i.test(ua);const standalone=window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true;
return {ios,android,inApp,safari,chrome,standalone,device:ios?'iPhone / iPad':android?'Android':'laptop / máy tính',name:inZalo?'Zalo':inFacebook?'Messenger / Facebook':otherEmbedded?'trình duyệt trong ứng dụng':'trình duyệt'};
}
function stepHTML(n,label){return '<div class="install-step"><span class="install-num">'+n+'</span><div>'+label+'</div></div>'}
function renderInstall(message=''){
const d=getDevice(),online=location.protocol==='https:'||location.hostname==='localhost';
const device=installDeviceOverride|| (d.ios?'ios':d.android?'android':'desktop');
const useEmbedded=d.inApp&&!installDeviceOverride;
const typeName=device==='ios'?'iPhone / iPad':device==='android'?'Android':'laptop / máy tính';
dialog.querySelector('.welcome-kicker').textContent='HƯỚNG DẪN CÀI ĐẶT · '+typeName.toUpperCase();
let title='',intro='',steps='',button='',notice='',details='';
if(d.standalone&&!installDeviceOverride){
 title='Sổ tay đã được cài đặt';intro='Thiết bị đang mở Sổ tay từ biểu tượng ứng dụng.';
 steps=stepHTML('✓','Có thể sử dụng ngay. Bài hát, chatbot, mô phỏng và đồng bộ bài tập cần kết nối Internet.');
}else if(useEmbedded){
 title='Mở bằng trình duyệt để cài ứng dụng';
 intro='Cô và các em đang mở liên kết trong '+d.name+'. Trình duyệt này thường không hiện mục cài ứng dụng.';
 steps=stepHTML(1,'Chạm nút <b>⋯</b>, <b>Chia sẻ</b> hoặc <b>Mở bằng trình duyệt</b> trên thanh công cụ của '+d.name+'.')+
 stepHTML(2,device==='ios'?'Chọn <b>Mở trong Safari</b>. Nếu không có, chọn <b>Sao chép liên kết</b>, mở Safari và dán vào thanh địa chỉ.':device==='android'?'Chọn <b>Mở trong Chrome</b>. Nếu không có, sao chép liên kết, mở Chrome rồi dán vào thanh địa chỉ.':'Sao chép liên kết bên dưới rồi mở bằng <b>Chrome</b> hoặc <b>Microsoft Edge</b>.')+
 stepHTML(3,device==='ios'?'Trong Safari, chọn <b>Chia sẻ → Thêm vào Màn hình chính → Thêm</b>.':device==='android'?'Trong Chrome, chọn <b>⋮ → Cài đặt ứng dụng</b> hoặc <b>Thêm vào màn hình chính</b>.':'Tìm mục <b>Cài đặt ứng dụng</b> trên thanh địa chỉ hoặc trong menu trình duyệt.');
 details='<p class="install-tip">💡 Nếu Zalo hoặc Messenger / Facebook không có nút mở trình duyệt, hãy dùng <b>Sao chép liên kết</b> bên dưới. Không cần cài một tệp APK riêng.</p>';
 button='<button type="button" class="welcome-back" data-welcome="copy">📋 Sao chép liên kết</button>';
}else if(device==='ios'){
 title='Cài Sổ tay trên iPhone / iPad';
 intro='Chỉ cần mở Sổ tay bằng <b>Safari</b> và thêm biểu tượng ra Màn hình chính.';
 steps=stepHTML(1,'Mở ứng dụng <b>Safari</b> trên iPhone/iPad và truy cập địa chỉ Sổ tay ở cuối hướng dẫn.' )+
 stepHTML(2,'Chạm nút <b>Chia sẻ</b> (hình vuông có mũi tên ↑). Với một số phiên bản Safari, chọn <b>menu trang</b> rồi chọn <b>Chia sẻ</b>.')+
 stepHTML(3,'Cuộn xuống và chọn <b>Thêm vào Màn hình chính</b>. Nếu chưa thấy, cuộn xuống cuối danh sách, chọn <b>Sửa tác vụ</b> để thêm mục này (nếu được hỗ trợ).')+
 stepHTML(4,'Nếu có công tắc <b>Mở như ứng dụng web</b>, hãy bật. Sau đó chạm <b>Thêm</b>.')+
 stepHTML(5,'Quay về Màn hình chính, tìm biểu tượng <b>Sổ tay KHTN 9</b> và chạm mở thử.');
 details='<p class="install-tip">🍎 <b>Lưu ý:</b> Không cần vào App Store. Cô và các em chỉ thêm website vào màn hình chính; không cần đăng nhập Apple ID để làm bước này.</p>';
 button='<button type="button" class="welcome-back" data-welcome="copy">📋 Sao chép liên kết</button>';
}else if(device==='android'){
 title='Cài Sổ tay trên điện thoại Android';
 intro='Mở ứng dụng trong <b>Google Chrome</b> để cài hoặc tạo biểu tượng ngoài màn hình.';
 steps=stepHTML(1,'Mở <b>Chrome</b> trên điện thoại và nhập địa chỉ Sổ tay ở cuối hướng dẫn.')+
 stepHTML(2,'Chạm nút <b>⋮</b> ở góc trên bên phải Chrome.')+
 stepHTML(3,'Chọn <b>Cài đặt ứng dụng</b> hoặc <b>Thêm vào màn hình chính</b>. Tên mục có thể khác nhau giữa các điện thoại.')+
 stepHTML(4,'Nhấn <b>Cài đặt</b> hoặc <b>Thêm</b> để xác nhận. Nếu được hỏi vị trí đặt biểu tượng, cô chọn màn hình chính.')+
 stepHTML(5,'Quay lại Màn hình chính hoặc danh sách ứng dụng và mở thử biểu tượng <b>Sổ tay KHTN 9</b>.');
 details='<p class="install-tip">📱 <b>Nếu không thấy mục cài đặt:</b> Hãy chắc chắn đang dùng Chrome, không phải cửa sổ Zalo hoặc Messenger; kiểm tra kết nối mạng và thử tải lại trang.</p>';
 button=deferredInstall&&!installDeviceOverride?'<button type="button" class="welcome-next" data-welcome="native">⬇ Cài ngay</button>':'<button type="button" class="welcome-back" data-welcome="copy">📋 Sao chép liên kết</button>';
}else{
 title='Cài Sổ tay trên laptop / máy tính';
 intro='Sử dụng <b>Chrome</b> hoặc <b>Microsoft Edge</b> để mở Sổ tay như một ứng dụng riêng.';
 steps=stepHTML(1,'Mở <b>Chrome</b> hoặc <b>Microsoft Edge</b>, sau đó truy cập địa chỉ Sổ tay ở cuối hướng dẫn.')+
 stepHTML(2,'Quan sát phía bên phải thanh địa chỉ: nếu có biểu tượng <b>Cài ứng dụng</b>, hãy nhấn vào. Nếu không có, mở menu <b>⋮</b> của trình duyệt.')+
 stepHTML(3,'Trong <b>Chrome</b>, tìm <b>Truyền, lưu và chia sẻ → Cài đặt trang dưới dạng ứng dụng</b> (tên mục có thể khác). Trong <b>Edge</b>, chọn <b>Ứng dụng → Cài đặt trang này dưới dạng ứng dụng</b>.')+
 stepHTML(4,'Chọn <b>Cài đặt</b> trong hộp thoại xác nhận, rồi đợi biểu tượng Sổ tay xuất hiện.')+
 stepHTML(5,'Mở thử Sổ tay từ <b>Start</b>, màn hình nền hoặc danh sách ứng dụng. Có thể ghim vào thanh tác vụ để mở nhanh.');
 details='<p class="install-tip">💻 <b>Nếu không thấy tùy chọn cài:</b> Thử cập nhật Chrome/Edge và mở đúng liên kết HTTPS. Không mở bằng tệp <code>index.html</code> từ ổ C:.</p>';
 button=deferredInstall&&!installDeviceOverride?'<button type="button" class="welcome-next" data-welcome="native">⬇ Cài ngay</button>':'<button type="button" class="welcome-back" data-welcome="copy">📋 Sao chép liên kết</button>';
}
if(!online&&!d.standalone){notice='Đây là bản mở từ tệp trong máy. Để cài thật, hãy dùng liên kết trực tuyến bên dưới trong Chrome, Edge hoặc Safari.';button='<button type="button" class="welcome-back" data-welcome="copy">📋 Sao chép liên kết</button>'}
const options=[['ios','iPhone / iPad'],['android','Android'],['desktop','Máy tính']];
const selection='<div class="install-device-select"><span>Hướng dẫn cho thiết bị:</span><div class="install-device-buttons">'+options.map(([v,label])=>'<button type="button" data-install-device="'+v+'" aria-pressed="'+(device===v?'true':'false')+'" class="'+(device===v?'selected':'')+'">'+label+'</button>').join('')+'</div></div>';
content.innerHTML='<div class="install-header-icon" aria-hidden="true">'+(device==='ios'?'📱':device==='android'?'📲':'💻')+'</div><h2>'+title+'</h2><p class="install-intro">'+intro+'</p>'+selection+'<div class="install-steps">'+steps+'</div>'+details+(notice?'<p class="welcome-caveat">'+notice+'</p>':'')+'<div class="install-link"><span>Địa chỉ ứng dụng</span><code>'+APP_URL+'</code></div>'+(message?'<p class="install-feedback" role="status">'+message+'</p>':'');
controls.innerHTML='<div class="install-buttons">'+button+'<button type="button" class="welcome-next" data-welcome="close">Đã hiểu</button></div>';
}
function open(which='guide',first=0){mode=which;step=first;if(which==='install')installDeviceOverride='';if(which==='install')renderInstall();else renderGuide();if(!dialog.open)dialog.showModal()}
async function copyLink(){try{if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(APP_URL);else{const a=document.createElement('textarea');a.value=APP_URL;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();if(!document.execCommand('copy'))throw new Error('Copy unavailable');a.remove()}renderInstall('Đã sao chép liên kết. Hãy dán vào Safari hoặc Chrome.')}catch(e){renderInstall('Không thể tự sao chép. Cô có thể chọn và sao chép đường dẫn trong ô phía trên.')}}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;if(mode==='install'&&dialog.open)renderInstall()});
window.addEventListener('appinstalled',()=>{installed=true;deferredInstall=null;if(mode==='install'&&dialog.open)renderInstall('Ứng dụng đã được cài thành công.')});
async function nativeInstall(){if(!deferredInstall)return;const p=deferredInstall;deferredInstall=null;try{await p.prompt();const result=await p.userChoice;renderInstall(result?.outcome==='accepted'?'Đã chấp nhận cài đặt. Hãy kiểm tra biểu tượng ứng dụng.':'Có thể cài lại từ menu trình duyệt khi cần.')}catch(e){renderInstall('Không mở được hộp thoại cài đặt. Hãy làm theo các bước ở trên.')}}
content.addEventListener('click',e=>{const b=e.target.closest('[data-install-device]');if(!b)return;installDeviceOverride=b.dataset.installDevice;renderInstall();});
controls.addEventListener('click',e=>{const b=e.target.closest('[data-welcome]');if(!b)return;const act=b.dataset.welcome;
if(act==='close'||act==='skip'){close();return}
if(act==='copy'){copyLink();return}
if(act==='native'){nativeInstall();return}
if(act==='guide'){open('guide');return}
if(act==='back'){step=Math.max(0,step-1);renderGuide();return}
if(act==='next'){if(step===pages.length-1){close();if(!location.hash||location.hash==='#home')location.hash='#catalog'}else{step++;renderGuide()}}
});
document.addEventListener('click',e=>{const guide=e.target.closest('#helpTopBtn,[data-open-guide]');const install=e.target.closest('[data-open-install]');if(guide){open('guide');return}if(install){open('install');return}});
window.addEventListener('hashchange',()=>setTimeout(renderGreeting,0));renderGreeting();
try{if(!localStorage.getItem(KEY))setTimeout(()=>{if(!dialog.open)open('guide')},550)}catch(e){}
})();
