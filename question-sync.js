/* Tải dữ liệu câu hỏi công khai, CHỈ ĐỌC, từ Apps Script bằng JSONP.
 * Không gửi bất kỳ bài làm hay thông tin học sinh nào đến Apps Script. */
(function(){'use strict';
  const endpoint=window.SOTAY_QUESTIONS_ENDPOINT||'';
  window.SOTAY_QUESTIONS_REMOTE=null;
  window.SOTAY_QUESTIONS_STATUS=endpoint?'Đang kết nối Google Sheets':'Đang dùng bộ 51 câu mẫu (chưa kết nối Google Sheets)';
  const validEndpoint=/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec(?:\?.*)?$/;
  window.SOTAY_QUESTIONS_GET=function(id){
    const remote=window.SOTAY_QUESTIONS_REMOTE;
    return remote ? (remote[Number(id)]||[]) : ((window.SOTAY_PRACTICE||{})[Number(id)]||[]);
  };
  if(!endpoint)return;
  if(!validEndpoint.test(endpoint)){window.SOTAY_QUESTIONS_STATUS='Đường dẫn Apps Script chưa đúng';return;}
  const callback='sotayCb_'+Date.now()+'_'+Math.floor(Math.random()*100000);
  let settled=false;
  const script=document.createElement('script');
  function complete(status){if(settled)return;settled=true;window.SOTAY_QUESTIONS_STATUS=status;
    delete window[callback];script.remove();window.dispatchEvent(new CustomEvent('sotay-questions-updated'));
  }
  const timeout=setTimeout(()=>complete('Không tải được Sheets — đang dùng câu mẫu trên thiết bị'),12000);
  window[callback]=function(payload){clearTimeout(timeout);
    if(!payload||payload.ok!==true||!Array.isArray(payload.questions)){complete('Dữ liệu Google Sheets không hợp lệ — dùng câu mẫu');return;}
    const data={};for(let n=1;n<=17;n++)data[n]=[];
    for(const q of payload.questions){
      const id=Number(q.lesson),level=String(q.level||''),question=String(q.question||''),hint=String(q.hint||''),answer=String(q.answer||'');
      if(id>=1&&id<=17&&question&&question.length<=2000&&hint.length<=4000&&answer.length<=8000&&q.active!==false){
        data[id].push({id:String(q.id),level,question,hint,answer});
      }
    }
    window.SOTAY_QUESTIONS_REMOTE=data;
    complete('Đã đồng bộ câu hỏi từ Google Sheets');
  };
  script.onerror=function(){clearTimeout(timeout);complete('Không thể kết nối Sheets — đang dùng câu mẫu');};
  const url=new URL(endpoint);url.searchParams.set('mode','public');url.searchParams.set('callback',callback);url.searchParams.set('_',String(Date.now()));
  script.src=url.href;document.head.appendChild(script);
})();
