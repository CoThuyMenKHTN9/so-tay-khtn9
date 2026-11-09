/* NGAN HANG CAU HOI KHTN9 - V2.0.5; KHONG CHUA API KEY */

(function(){
  window.addEventListener('error',function(ev){
    var message=String((ev.error&&ev.error.message)||ev.message||'JavaScript gặp lỗi');
    var node=document.getElementById('khtnDiagnostic');
    if(node){node.hidden=false;node.textContent='Lỗi giao diện: '+message.slice(0,180)+' . Cô chụp phần thông báo này để kiểm tra.';}
  });
})();

;
'use strict';
const LESSONS = [
'Nhận biết một số dụng cụ, hóa chất; thuyết trình một vấn đề khoa học',
'Động năng – Thế năng','Cơ năng','Công và công suất','Khúc xạ ánh sáng',
'Phản xạ toàn phần','Lăng kính','Thấu kính',
'Thực hành đo tiêu cự của thấu kính hội tụ','Kính lúp – Bài tập thấu kính',
'Điện trở – Định luật Ohm','Đoạn mạch nối tiếp, song song',
'Năng lượng của dòng điện và công suất điện',
'Cảm ứng điện từ – Nguyên tắc tạo ra dòng điện xoay chiều',
'Tác dụng của dòng điện xoay chiều',
'Vòng năng lượng trên Trái Đất – Năng lượng hóa thạch','Một số dạng năng lượng tái tạo'
];
const HEADERS=['STT','Câu hỏi','Đáp án A','Đáp án B','Đáp án C','Đáp án D','Đáp án đúng','Giải thích'];
const LETTERS=['A','B','C','D'];
const STORE_KEY='cothuymen_nganhang_v1'; // giữ nguyên khóa để bảo toàn dữ liệu V1.0/V1.1 trên cùng origin
const el=id=>document.getElementById(id);
const now=()=>Date.now();
const makeId=()=>Math.random().toString(36).slice(2)+now().toString(36);
let state={version:1,banks:[]};let currentLesson=1,currentBankId='',editQuestionId=null;
function toast(s){const t=el('toast');t.textContent=s;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),3400)}
function load(){try{const raw=localStorage.getItem(STORE_KEY);if(raw){const parsed=JSON.parse(raw);if(parsed&&Array.isArray(parsed.banks))state={version:1,banks:parsed.banks.filter(validBank)};}}catch(e){toast('Không đọc được dữ liệu đã lưu. Hãy kiểm tra bộ nhớ trình duyệt.')}}
function persist(){try{localStorage.setItem(STORE_KEY,JSON.stringify(state));return true}catch(e){alert('Không lưu được dữ liệu trên thiết bị này. Hãy thử sao lưu JSON hoặc kiểm tra bộ nhớ trình duyệt.');return false}}
function validBank(b){return !!(b&&typeof b.id==='string'&&Number.isInteger(+b.lesson)&&+b.lesson>=1&&+b.lesson<=17&&Array.isArray(b.questions));}
function selected(){return state.banks.find(x=>x.id===currentBankId&&+x.lesson===currentLesson)||null}
function lessonBanks(){return state.banks.filter(x=>+x.lesson===currentLesson)}
function elem(tag,cls,text){const o=document.createElement(tag);if(cls)o.className=cls;if(text!==undefined)o.textContent=String(text);return o}
function btn(text,cls,callback){const b=elem('button',cls,text);b.type='button';b.addEventListener('click',callback);return b}
function setCurrentLesson(n){currentLesson=n;currentBankId=lessonBanks()[0]?.id||'';render()}
function updateStats(){el('statBanks').textContent=state.banks.length;el('statQuestions').textContent=state.banks.reduce((n,b)=>n+b.questions.length,0);el('statCurrent').textContent=selected()?.questions.length||0;}
function renderLessonList(){const box=el('lessonList');box.replaceChildren();const term=el('lessonSearch').value.trim().toLowerCase();LESSONS.forEach((title,i)=>{if(term&&!(`bài ${i+1} ${title}`.toLowerCase().includes(term)))return;const b=elem('button','lesson-button'+(currentLesson===i+1?' selected':''));b.type='button';b.append(elem('span','lesson-num',String(i+1).padStart(2,'0')),elem('span','',title));b.onclick=()=>setCurrentLesson(i+1);box.append(b)});if(!box.children.length)box.append(elem('p','muted small','Không có bài phù hợp.'))}
function renderBankSelect(){el('currentLessonTag').textContent=`BÀI ${currentLesson} / 17`;el('currentLessonTitle').textContent=LESSONS[currentLesson-1];const banks=lessonBanks(),sel=el('bankSelect');if(!banks.some(b=>b.id===currentBankId))currentBankId=banks[0]?.id||'';sel.replaceChildren();if(!banks.length){const o=elem('option','','Chưa có bộ câu hỏi — hãy tạo bộ mới');o.value='';sel.append(o)}else banks.forEach(b=>{const o=elem('option','',`${b.name} · ${b.questions.length} câu`);o.value=b.id;sel.append(o)});sel.value=currentBankId;sel.disabled=!banks.length;el('bankCountText').textContent=`${banks.length} bộ`;el('bankInfo').textContent=banks.length?'Mỗi bộ có thể xuất thành một file Excel độc lập, thuận tiện cho nhiều lớp và nhiều trò chơi.':'Chưa có bộ nào trong bài này. Chọn “Tạo bộ câu hỏi” để bắt đầu.';['btnRename','btnDuplicate','btnDelete','btnAdd','btnShuffle','btnExport'].forEach(id=>el(id).disabled=!selected());}
function renderQuestions(){const area=el('questionList');area.replaceChildren();const bank=selected();if(!bank){area.append(elem('div','empty','📄 Chọn hoặc tạo bộ câu hỏi để bắt đầu.'));return;}const query=el('questionSearch').value.trim().toLowerCase(),level=el('levelFilter').value;
const filtered=bank.questions.map((q,i)=>({q,i})).filter(({q})=>(!level||q.level===level)&&(!query||[q.question,...q.options,q.explanation].join(' ').toLowerCase().includes(query)));
if(!filtered.length){area.append(elem('div','empty',bank.questions.length?'Không tìm thấy câu hỏi theo bộ lọc.':'Bộ này chưa có câu hỏi. Nhấn “Thêm câu hỏi” hoặc “Nhập Excel / CSV”.'));return}
filtered.forEach(({q,i})=>{const item=elem('article','question-item'),top=elem('div','question-top'),n=elem('span','question-index',String(i+1).padStart(2,'0')),content=elem('div','question-content');content.append(elem('div','question-title',q.question),elem('span','level-tag',q.level||'Nhận biết'));top.append(n,content);item.append(top);const choices=elem('div','choices');LETTERS.forEach((letter,j)=>{let c=elem('div','choice'+(q.correct===letter?' correct':''));c.append(elem('b','',letter+'. '),document.createTextNode(String(q.options[j]||'')));choices.append(c)});item.append(choices);if(q.explanation)item.append(elem('div','explain','💡 '+q.explanation));const act=elem('div','row-actions');act.append(btn('✏ Sửa','outline',()=>openEdit(q.id)),btn('⧉ Nhân bản','outline',()=>duplicateQuestion(q.id)),btn('🗑 Xóa','danger-outline',()=>removeQuestion(q.id)));item.append(act);area.append(item)})}
function render(){renderLessonList();renderBankSelect();renderQuestions();updateStats();}
function createBank(){const name=prompt(`Tên bộ câu hỏi cho Bài ${currentLesson}:`,`Bài ${currentLesson} – Bộ câu hỏi 1`);if(name===null)return;const s=name.trim();if(!s){toast('Tên bộ không được để trống.');return}const bank={id:makeId(),lesson:currentLesson,name:s,questions:[],created:now(),updated:now()};state.banks.push(bank);currentBankId=bank.id;persist();render();toast('Đã tạo bộ câu hỏi mới.')}
function renameBank(){const b=selected();if(!b)return;const name=prompt('Tên bộ câu hỏi:',b.name);if(name===null)return;if(!name.trim())return toast('Tên bộ không được trống.');b.name=name.trim();b.updated=now();persist();render()}
function duplicateBank(){const b=selected();if(!b)return;const n={...b,id:makeId(),name:b.name+' (bản sao)',questions:b.questions.map(q=>({...q,id:makeId(),options:[...q.options]})),created:now(),updated:now()};state.banks.push(n);currentBankId=n.id;persist();render();toast('Đã nhân bản bộ câu hỏi.')}
function deleteBank(){const b=selected();if(!b||!confirm(`Xóa bộ “${b.name}” và ${b.questions.length} câu hỏi? Hành động này không thể hoàn tác.`))return;state.banks=state.banks.filter(x=>x.id!==b.id);currentBankId=lessonBanks()[0]?.id||'';persist();render();toast('Đã xóa bộ câu hỏi.')}
function openEdit(id=null){const b=selected();if(!b)return;editQuestionId=id;const q=id?b.questions.find(x=>x.id===id):null;el('modalTitle').textContent=q?'Sửa câu hỏi':'Thêm câu hỏi mới';el('qText').value=q?.question||'';LETTERS.forEach((v,i)=>el('q'+v).value=q?.options[i]||'');el('qCorrect').value=q?.correct||'A';el('qLevel').value=q?.level||'Nhận biết';el('qExplanation').value=q?.explanation||'';el('formError').textContent='';el('questionDialog').showModal();el('qText').focus()}
function normalizeQuestion(o){return{id:o.id||makeId(),question:String(o.question||'').trim(),options:Array.isArray(o.options)?o.options.map(x=>String(x??'').trim()).slice(0,4):[],correct:String(o.correct||'').trim().toUpperCase(),explanation:String(o.explanation||'').trim(),level:['Nhận biết','Thông hiểu','Vận dụng'].includes(o.level)?o.level:'Nhận biết'}}
function checkQuestion(q){if(!q.question)return 'Chưa nhập nội dung câu hỏi.';if(q.options.length!==4||q.options.some(x=>!x))return 'Cần nhập đủ bốn phương án A, B, C, D.';if(!LETTERS.includes(q.correct))return 'Đáp án đúng chỉ được là A, B, C hoặc D.';if(new Set(q.options.map(x=>x.toLocaleLowerCase('vi'))).size!==4)return 'Bốn phương án cần khác nhau.';return ''}
function saveQuestion(ev){ev.preventDefault();const b=selected();if(!b)return;const q=normalizeQuestion({id:editQuestionId||makeId(),question:el('qText').value,options:LETTERS.map(l=>el('q'+l).value),correct:el('qCorrect').value,level:el('qLevel').value,explanation:el('qExplanation').value});const err=checkQuestion(q);if(err){el('formError').textContent=err;return}if(editQuestionId){const idx=b.questions.findIndex(x=>x.id===editQuestionId);if(idx<0)return;b.questions[idx]=q}else b.questions.push(q);b.updated=now();persist();el('questionDialog').close();render();toast(editQuestionId?'Đã cập nhật câu hỏi.':'Đã thêm câu hỏi.')}
function duplicateQuestion(id){const b=selected(),q=b?.questions.find(x=>x.id===id);if(!q)return;b.questions.push({...q,id:makeId(),options:[...q.options]});b.updated=now();persist();render();toast('Đã nhân bản câu hỏi.')}
function removeQuestion(id){const b=selected();if(!b||!confirm('Xóa câu hỏi này khỏi bộ?'))return;b.questions=b.questions.filter(q=>q.id!==id);persist();render();toast('Đã xóa câu hỏi.')}
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function shuffleCurrent(){const b=selected();if(!b||!b.questions.length)return toast('Bộ câu hỏi chưa có câu nào.');if(!confirm('Trộn thứ tự câu hỏi và các phương án A–D? Đáp án đúng sẽ được tính lại. Hãy sao lưu trước nếu muốn giữ thứ tự cũ.'))return;b.questions=shuffle(b.questions).map(q=>{const all=q.options.map((opt,i)=>({opt,isCorrect:LETTERS[i]===q.correct}));const mixed=shuffle(all);return{...q,options:mixed.map(x=>x.opt),correct:LETTERS[mixed.findIndex(x=>x.isCorrect)]}});b.updated=now();persist();render();toast('Đã trộn và cập nhật đáp án đúng.')}
function safeFileName(name){return String(name).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[^a-z0-9_-]+/gi,'_').replace(/^_+|_+$/g,'').slice(0,58)||'Bo_cau_hoi'}
function validXLSX(){if(typeof XLSX==='undefined')throw Error('Không tải được thư viện Excel. Kiểm tra thư mục assets/xlsx.full.min.js.');}
function normalizedQuestionKey(q){return String(q||'').normalize('NFKC').toLocaleLowerCase('vi').replace(/[\p{P}\p{S}\s]+/gu,' ').trim();}
// Cân đối chữ đáp án mà không thay đổi nội dung hoặc dữ liệu gốc đã lưu.
function balancedAnswerPositions(questions){
 const target=Array(4).fill(0), order=shuffle(questions.map((q,i)=>i));
 const output=questions.map(q=>({...q,options:[...q.options]}));
 for(const idx of order){
   const q=output[idx], oldIndex=LETTERS.indexOf(q.correct);
   if(oldIndex<0)continue;
   const min=Math.min(...target), choices=shuffle([0,1,2,3].filter(i=>target[i]===min));
   const goal=choices[0];target[goal]++;
   if(goal!==oldIndex){[q.options[oldIndex],q.options[goal]]=[q.options[goal],q.options[oldIndex]];}
   q.correct=LETTERS[goal];
 }
 return output;
}
function selectForExport(){const b=selected();if(!b)return [];
 let qs=b.questions.filter(q=>!el('exportLevel').value||q.level===el('exportLevel').value);
 if(el('exportOrder').value==='random')qs=shuffle(qs);else qs=[...qs];
 const want=el('exportCount').value;
 if(want!=='all'){
   const n=Number(want);if(qs.length<n)throw Error(`Bộ hiện có ${qs.length} câu phù hợp. Không đủ ${n} câu để xuất. Hãy chọn số lượng nhỏ hơn hoặc tạo thêm câu.`);
   qs=qs.slice(0,n);
 }
 return el('exportAnswerMode').value==='balanced'?balancedAnswerPositions(qs):qs.map(q=>({...q,options:[...q.options]}));
}
function exportXLSX(){
 const b=selected();if(!b)return;
 if(!b.questions.length)return toast('Hãy nhập ít nhất một câu hỏi trước khi xuất.');
 try{
   const qs=selectForExport();if(!qs.length)throw Error('Không có câu hỏi phù hợp với mức độ đang chọn.');
   for(let i=0;i<qs.length;i++){const err=checkQuestion(qs[i]);if(err)throw Error(`Câu ${i+1}: ${err}`)}
   validXLSX();const wb=XLSX.utils.book_new();
   const rows=[HEADERS,...qs.map((q,i)=>[i+1,q.question,...q.options,q.correct,q.explanation])];
   const ws=XLSX.utils.aoa_to_sheet(rows);ws['!cols']=[{wch:7},{wch:65},{wch:38},{wch:38},{wch:38},{wch:38},{wch:15},{wch:68}];
   XLSX.utils.book_append_sheet(wb,ws,'Cau_hoi');
   XLSX.writeFile(wb,`KHTN9_Bai${String(currentLesson).padStart(2,'0')}_${safeFileName(b.name)}_${qs.length}_cau.xlsx`);
   toast(`Đã xuất ${qs.length} câu, Excel chuẩn 8 cột. Ngân hàng gốc giữ nguyên.`)
 }catch(e){alert('Không xuất được Excel: '+e.message)}
}
function exportTemplate(){try{validXLSX();const wb=XLSX.utils.book_new(),ws=XLSX.utils.aoa_to_sheet([HEADERS]);ws['!cols']=[{wch:7},{wch:65},{wch:38},{wch:38},{wch:38},{wch:38},{wch:15},{wch:68}];XLSX.utils.book_append_sheet(wb,ws,'Cau_hoi');XLSX.writeFile(wb,'Mau_Excel_Cau_hoi_8_cot.xlsx');toast('Đã tải file mẫu trống.')}catch(e){alert('Không tải được file mẫu: '+e.message)}}
function importRows(rows){const b=selected();if(!b)return;const first=rows.findIndex(r=>r.some(x=>String(x??'').trim()));if(first===-1)throw Error('File không có dữ liệu.');const header=rows[first].map(x=>String(x??'').trim().toLocaleLowerCase('vi'));
const expected=HEADERS.map(x=>x.toLocaleLowerCase('vi'));
const headerPresent=expected.every((x,i)=>header[i]===x);
if(!headerPresent)throw Error('Tên hoặc thứ tự 8 cột chưa đúng mẫu: STT, Câu hỏi, Đáp án A, Đáp án B, Đáp án C, Đáp án D, Đáp án đúng, Giải thích.');
const incoming=[],errors=[];
for(let i=first+1;i<rows.length;i++){const row=rows[i]||[];if(row.every(c=>!String(c??'').trim()))continue;const q=normalizeQuestion({question:row[1],options:[row[2],row[3],row[4],row[5]],correct:row[6],explanation:row[7],level:'Nhận biết'});const err=checkQuestion(q);if(err)errors.push(`Dòng ${i+1}: ${err}`);else incoming.push(q)}
if(errors.length)throw Error(errors.slice(0,7).join('\n')+(errors.length>7?`\n... còn ${errors.length-7} lỗi`:''));if(!incoming.length)throw Error('Không tìm thấy câu hỏi hợp lệ trong file.');
const answer=confirm(`Đã đọc ${incoming.length} câu hỏi hợp lệ.\n\nOK: THÊM vào bộ hiện tại (${b.questions.length} câu).\nCancel: Không nhập.\n\nMuốn thay thế toàn bộ, hãy tạo bộ mới hoặc xóa bộ cũ trước.`);if(!answer)return;
b.questions.push(...incoming);b.updated=now();persist();render();toast(`Đã nhập thêm ${incoming.length} câu vào bộ.`)}
async function importExcel(file){if(!file)return;try{validXLSX();if(file.size>10*1024*1024)throw Error('Tệp quá lớn (tối đa 10 MB).');const buf=await file.arrayBuffer();const wb=XLSX.read(buf,{type:'array'});const sheet=wb.Sheets['Cau_hoi']||wb.Sheets[wb.SheetNames[0]];if(!sheet)throw Error('Không tìm thấy trang tính.');const rows=XLSX.utils.sheet_to_json(sheet,{header:1,defval:'',raw:false});importRows(rows)}catch(e){alert('Không thể nhập Excel:\n'+e.message)}finally{el('excelFile').value=''}}
function downloadBlob(name,mime,body){const blob=new Blob([body],{type:mime}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)}
function backup(){const payload={format:'KHTN9_QUESTION_BANK_V1',version:1,exportedAt:new Date().toISOString(),banks:state.banks};downloadBlob('Ngan_hang_cau_hoi_KHTN9_sao_luu.json','application/json;charset=utf-8',JSON.stringify(payload,null,2));toast('Đã tải bản sao lưu JSON.')}
async function restore(file){if(!file)return;try{if(file.size>10*1024*1024)throw Error('File sao lưu quá lớn.');const payload=JSON.parse(await file.text());if(payload.format!=='KHTN9_QUESTION_BANK_V1'||!Array.isArray(payload.banks))throw Error('Không phải file sao lưu ứng dụng ngân hàng câu hỏi 1.0.');if(payload.banks.length>2000)throw Error('Quá nhiều bộ câu hỏi trong file.');const checked=payload.banks.map(b=>{if(!validBank(b)||typeof b.name!=='string')throw Error('Bộ câu hỏi có cấu trúc không hợp lệ.');if(b.questions.length>10000)throw Error('Một bộ có quá nhiều câu hỏi.');return{...b,id:String(b.id),name:String(b.name).slice(0,150),questions:b.questions.map(q=>{const x=normalizeQuestion(q);const err=checkQuestion(x);if(err)throw Error(`Bộ ${b.name}: ${err}`);return x})}});if(!confirm(`Thay toàn bộ dữ liệu hiện tại bằng ${checked.length} bộ câu hỏi trong file sao lưu? Nên sao lưu dữ liệu hiện tại trước.`))return;state={version:1,banks:checked};currentLesson=1;currentBankId='';persist();render();toast('Đã khôi phục dữ liệu thành công.')}catch(e){alert('Không khôi phục được: '+e.message)}finally{el('restoreFile').value=''}}
function init(){load();el('lessonSearch').oninput=renderLessonList;el('bankSelect').onchange=e=>{currentBankId=e.target.value;render()};el('levelFilter').onchange=renderQuestions;el('questionSearch').oninput=renderQuestions;el('btnCreate').onclick=createBank;el('btnRename').onclick=renameBank;el('btnDuplicate').onclick=duplicateBank;el('btnDelete').onclick=deleteBank;el('btnAdd').onclick=()=>openEdit();el('btnShuffle').onclick=shuffleCurrent;el('btnExport').onclick=exportXLSX;el('btnTemplate').onclick=exportTemplate;el('btnBackup').onclick=backup;el('restoreFile').onchange=e=>restore(e.target.files[0]);el('excelFile').onchange=e=>importExcel(e.target.files[0]);el('questionForm').onsubmit=saveQuestion;el('closeModal').onclick=()=>el('questionDialog').close();el('cancelModal').onclick=()=>el('questionDialog').close();render()}
init();


// ==== PHẦN MỞ RỘNG 1.2: TẠO CÂU HỎI AI, CHỈ SỬ DỤNG API KEY NHẬP TẠM THỜI ====
let aiBusy=false;
function aiStatus(message,kind=''){const x=el('aiStatus');x.textContent=message;x.className='ai-status'+(kind?' '+kind:'');}
function aiSelectMode(){el('geminiArea').hidden=el('aiMode').value==='copy';el('btnAIGenerate').hidden=el('aiMode').value==='copy';}
function aiPrompt(){
 const n=Number(el('aiCount').value),level=el('aiLevel').value;
 const previous=(selected()?.questions||[]).slice(-80).map(q=>q.question).filter(Boolean);
 return `Bạn là giáo viên chuyên môn Khoa học tự nhiên lớp 9 (phân môn Vật lí), bộ sách Kết nối tri thức. Hãy tạo CHÍNH XÁC ${n} câu trắc nghiệm CHỈ thuộc Bài ${currentLesson}: "${LESSONS[currentLesson-1]}". Mức độ: ${level==='mixed'?'Phân bố hợp lí cả Nhận biết, Thông hiểu, Vận dụng':level}. Diễn đạt dễ hiểu cho học sinh lớp 9, đúng kiến thức, công thức và đơn vị; mỗi câu có đúng 4 phương án phân biệt rõ, duy nhất 1 đáp án đúng. Không lặp câu hay phương án. Những câu đã có trong bộ, cần TRÁNH tạo lại: ${previous.length?previous.map((x,i)=>`${i+1}. ${x}`).join(' | ').slice(0,8500):'Chưa có'}. Không tự suy diễn nội dung SGK ngoài tên bài. Nếu không có toàn văn SGK để đối chiếu, tự hạn chế vào kiến thức nền chắc chắn và nhắc giáo viên kiểm chứng; không bịa số trang, trích dẫn. Công thức viết kiểu văn bản thuần, ví dụ U = I.R, không dùng markdown hay LaTeX. TRẢ VỀ DUY NHẤT JSON hợp lệ (không dùng dấu ba nháy, không có giải thích bên ngoài): {"questions":[{"question":"nội dung câu hỏi","options":["đáp án A","đáp án B","đáp án C","đáp án D"],"correct":"A","explanation":"giải thích đáp án","level":"Nhận biết"}]}. Mỗi correct là một trong A, B, C, D; level phải là Nhận biết/Thông hiểu/Vận dụng. Bắt buộc đủ ${n} câu. Đa dạng vị trí đáp án đúng.`;
}
async function aiCopy(){try{await navigator.clipboard.writeText(aiPrompt());aiStatus('Đã sao chép yêu cầu. Cô dán vào ChatGPT, sau đó sao chép phần JSON và nhấn “Dán câu hỏi AI vào ứng dụng”.');toast('Đã sao chép câu lệnh.')}catch(e){const t=prompt('Trình duyệt không cho sao chép tự động. Cô nhấn Ctrl+C để sao chép đoạn này:',aiPrompt());aiStatus('Cô có thể sao chép câu lệnh trong hộp thoại và gửi vào ChatGPT.')}}
function extractAI(text){let s=String(text||'').trim();s=s.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();let parsed;try{parsed=JSON.parse(s)}catch(e){const start=s.indexOf('{'),end=s.lastIndexOf('}');if(start<0||end<=start)throw Error('Không thấy JSON hợp lệ. Hãy yêu cầu AI chỉ trả về JSON và dán lại.');parsed=JSON.parse(s.slice(start,end+1));}const arr=Array.isArray(parsed)?parsed:parsed.questions;if(!Array.isArray(arr))throw Error('JSON phải có trường questions là danh sách câu hỏi.');if(!arr.length||arr.length>60)throw Error('Số câu từ AI phải từ 1 đến 60.');const errors=[],out=[];arr.forEach((r,i)=>{const rawOptions=Array.isArray(r.options)?r.options:[r.A,r.B,r.C,r.D];const q=normalizeQuestion({question:r.question||r.q||'',options:rawOptions,correct:r.correct||r.answer,explanation:r.explanation||r.explain||'',level:r.level||'Nhận biết'});const err=checkQuestion(q);if(err)errors.push('Câu '+(i+1)+': '+err);else out.push(q)});if(errors.length)throw Error(errors.slice(0,6).join('\n')+(errors.length>6?'\n…và '+(errors.length-6)+' lỗi khác':''));return out;}
function aiEnsureBank(){let b=selected();if(b)return b;const n=el('aiCount').value;const bank={id:makeId(),lesson:currentLesson,name:`Bài ${currentLesson} – Bộ AI ${n} câu (${new Date().toLocaleDateString('vi-VN')})`,questions:[],created:now(),updated:now()};state.banks.push(bank);currentBankId=bank.id;return bank;}
function aiStore(questions,source){
 const existed=selected();const keys=new Set((existed?.questions||[]).map(q=>normalizedQuestionKey(q.question)));
 const add=[];let skipped=0;
 for(const q of questions){const k=normalizedQuestionKey(q.question);if(keys.has(k)){skipped++;continue;}keys.add(k);add.push(q);}
 if(!add.length)throw Error('Các câu hỏi đã có trong bộ đang chọn hoặc bị trùng nhau.');
 if(existed&&existed.questions.length&&!confirm(`Thêm ${add.length} câu hỏi AI vào bộ “${existed.name}”?\n\nĐã bỏ qua ${skipped} câu trùng nội dung.`))return 0;
 const b=aiEnsureBank();b.questions.push(...add);b.updated=now();persist();render();aiStatus(`Đã nhập thêm ${add.length} câu hỏi vào “${b.name}”. Bỏ qua ${skipped} câu trùng. Cô hãy duyệt kỹ trước khi xuất Excel.`);return add.length;
}
function aiImportDialog(){el('aiImportError').textContent='';el('aiImportDialog').showModal();}
function aiPasteImport(){try{const qs=extractAI(el('aiPaste').value),n=aiStore(qs,'ChatGPT');if(n){el('aiImportDialog').close();el('aiPaste').value='';toast(`Đã thêm ${n} câu hỏi AI`);}}catch(e){el('aiImportError').textContent=e.message;}}
async function aiGenerate(){
 if(aiBusy)return;
 if(!window.google || !google.script || !google.script.run){
   aiStatus('Bản 1.3 cần mở từ đường dẫn Google Apps Script /exec. Nếu mở file HTML bằng cách nhấp đúp trên máy, cô hãy dùng phiên bản 1.2 để quản lý và xuất Excel, hoặc truy cập ứng dụng Apps Script đã triển khai.','error-state');return;
 }
 const password=el('aiAccessPassword').value;
 if(!password){aiStatus('Cô nhập mật khẩu quản trị đã tạo trong Script Properties. Đây KHÔNG phải Gemini API key.','error-state');el('aiAccessPassword').focus();return;}
 const count=Number(el('aiCount').value),lesson=currentLesson;
 const previous=(selected()?.questions||[]).slice(-80).map(q=>String(q.question||'')).filter(Boolean);
 const level=el('aiLevel').value;
 aiBusy=true;el('btnAIGenerate').disabled=true;
 aiStatus('Đang gửi yêu cầu bảo mật tới Apps Script để tạo '+count+' câu cho Bài '+lesson+'…','busy');
 try{
  const data=await new Promise((resolve,reject)=>{
   google.script.run.withSuccessHandler(resolve).withFailureHandler(e=>reject(new Error(e?.message||String(e))))
   .generateQuestions({password,lesson,count,level,previous});
  });
  const raw=data && data.text;
  if(!raw)throw Error('AI không trả về câu hỏi.');
  const questions=extractAI(raw);
  if(questions.length!==count){el('aiPaste').value=raw;aiStatus('AI trả '+questions.length+'/'+count+' câu; chưa tự động lưu để tránh thiếu. Cô có thể kiểm tra kết quả và nhập thủ công hoặc tạo lại.','error-state');aiImportDialog();return;}
  if(currentLesson!==lesson){aiStatus('Cô đã chuyển bài trong lúc tạo câu hỏi. Hãy quay về Bài '+lesson+' để tránh lưu sai nội dung.','error-state');return;}
  const n=aiStore(questions,'Gemini qua Apps Script');if(n)toast('Đã tạo '+n+' câu bằng Apps Script. Cô duyệt trước khi xuất Excel.');
 }catch(e){aiStatus('Không tạo được câu hỏi: '+(e?.message||String(e)),'error-state');}
 finally{aiBusy=false;el('btnAIGenerate').disabled=false;}
}
el('aiMode').addEventListener('change',aiSelectMode);el('btnAICopy').onclick=aiCopy;el('btnAIImport').onclick=aiImportDialog;el('closeAiImport').onclick=()=>el('aiImportDialog').close();el('btnAcceptAI').onclick=aiPasteImport;el('btnAIGenerate').onclick=aiGenerate;el('btnAIHelp').onclick=()=>alert('CÁCH 1 – GEMINI QUA APPS SCRIPT: Mở ứng dụng bằng URL Apps Script /exec, nhập mật khẩu quản trị riêng (không phải API key), chọn số câu rồi nhấn Tạo câu hỏi tự động. API key đã cấu hình an toàn trong Script Properties. Có thể bị giới hạn hoặc tính phí theo tài khoản.\n\nCÁCH 2 – CHATGPT: Nhấn Sao chép yêu cầu → gửi vào ChatGPT → sao chép JSON → nhấn Dán câu hỏi AI vào ứng dụng.\n\nSau khi có câu hỏi, cô sửa/duyệt, rồi nhấn Xuất Excel (.xlsx). Ở mục xuất, chọn số câu/mức độ/cân đối A–B–C–D; ngân hàng câu hỏi gốc không bị sửa. Dữ liệu quản lý lưu cục bộ, cần sao lưu JSON định kỳ.');aiSelectMode();

// KHTN9 2.0 - chuyển trực tiếp bộ câu hỏi đã duyệt vào trò Robot
const KHTN9_ROBOT_URL='https://cothuymenkhtn9.github.io/so-tay-khtn9/games/robot-thu-nghiem-ai.html';
function khtn9EncodeShare(obj){
 const bytes=new TextEncoder().encode(JSON.stringify(obj));
 if(bytes.length>120000)throw Error('Bộ câu hỏi quá lớn để chuyển qua liên kết. Cô hãy giảm số câu xuất (ví dụ 5–20 câu).');
 let binary=''; for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
 return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function khtn9LaunchRobot(){
 try{
  const bank=selected();if(!bank||!bank.questions.length)throw Error('Cô cần tạo và duyệt ít nhất một câu hỏi trong bộ đang chọn.');
  // Lấy câu hỏi theo bộ và bộ lọc, giữ nguyên thứ tự của giáo viên.
  const questionLevel=el('exportLevel').value;
  let questions=bank.questions.filter(q=>!questionLevel||q.level===questionLevel).map(q=>({...q,options:[...q.options]}));
  const desired=el('exportCount').value;
  if(desired!=='all'){
   const n=Number(desired);
   if(questions.length<n)throw Error('Bộ câu hỏi chỉ có '+questions.length+' câu phù hợp; hãy giảm số câu.');
   questions=questions.slice(0,n);
  }
  if(!questions.length)throw Error('Không có câu hỏi phù hợp với bộ lọc xuất.');
  if(questions.length>40)throw Error('Bản thử nghiệm hỗ trợ tối đa 40 câu/lần. Cô chọn số câu xuất nhỏ hơn.');
  questions.forEach((q,i)=>{const e=checkQuestion(q);if(e)throw Error('Câu '+(i+1)+': '+e);});
  const body={version:1,game:'robot',lesson:currentLesson,lessonName:LESSONS[currentLesson-1],questionOrder:el('robotQuestionOrder').value,bankName:bank.name,questions:questions.map(q=>({q:q.question,a:q.options,correct:q.correct,why:q.explanation||''}))};
  const url=KHTN9_ROBOT_URL+'#khtn9='+khtn9EncodeShare(body);
  const popup=window.open(url,'_blank');
  if(!popup){
   navigator.clipboard?.writeText(url).then(()=>toast('Trình duyệt đã chặn cửa sổ mới. Đã sao chép liên kết trò chơi; cô dán vào thanh địa chỉ.')).catch(()=>prompt('Sao chép đường link để mở trò Robot:',url));
  } else toast('Đã mở trò Robot với '+questions.length+' câu của '+bank.name);
 }catch(err){alert('Chưa thể mở trò Robot: '+(err.message||String(err)));}
}
if(document.getElementById('btnLaunchRobot'))document.getElementById('btnLaunchRobot').addEventListener('click',khtn9LaunchRobot);

;

(function(){
 function recoverLessons(){
   var box=document.getElementById('lessonList');
   if(!box || box.querySelector('button'))return;
   try{
     if(typeof renderLessonList==='function'){
       renderLessonList();
     }
     if(!box.querySelector('button') && typeof init==='function')init();
   }catch(e){
     var node=document.getElementById('khtnDiagnostic');
     if(node){node.hidden=false;node.textContent='Lỗi khi nạp 17 bài: '+String(e&&e.message||e).slice(0,180);}
   }
   if(box.querySelector('button'))return;
   var diagnostic=document.getElementById('khtnDiagnostic');
   if(diagnostic){diagnostic.hidden=false;diagnostic.textContent='Ứng dụng chưa khởi tạo được thư viện 17 bài. Cô gửi ảnh thông báo này để kiểm tra lỗi JavaScript.';}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',recoverLessons);
 else recoverLessons();
})();

