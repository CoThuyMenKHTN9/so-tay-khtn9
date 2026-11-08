/* Sổ tay KHTN 9 v2.8: khóa tiện ích ở phía trình duyệt, KHÔNG phải phân quyền bảo mật phía máy chủ. */
(()=>{'use strict';
const STORE='sotay_teacher_password_v28';
const UNLOCKED='sotay_teacher_unlocked_v28';
const INITIAL_SALT='ead440d6e20caaf242cdaf8535ffad2e';
const INITIAL_DIGEST='b25d64b178de4281efabd4eb1505a95da0b01455eaf1782686e671c4012723f3';
const ROUNDS=160000;
const hex=bytes=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
const unhex=value=>new Uint8Array(value.match(/../g).map(v=>parseInt(v,16)));
async function derive(password,salt){
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:unhex(salt),iterations:ROUNDS,hash:'SHA-256'},key,256);
 return hex(new Uint8Array(bits));
}
function getState(){try{let d=JSON.parse(localStorage.getItem(STORE));if(d&&/^[a-f0-9]{32}$/.test(d.salt)&&/^[a-f0-9]{64}$/.test(d.digest))return d}catch(e){}return {salt:INITIAL_SALT,digest:INITIAL_DIGEST}}
function same(a,b){if(a.length!==b.length)return false;let n=0;for(let i=0;i<a.length;i++)n|=a.charCodeAt(i)^b.charCodeAt(i);return n===0}
function isUnlocked(){try{return sessionStorage.getItem(UNLOCKED)==='1'}catch(e){return false}}
async function verify(password){if(!password||!crypto?.subtle)return false;const target=getState();const value=await derive(password,target.salt);if(!same(value,target.digest))return false;try{sessionStorage.setItem(UNLOCKED,'1')}catch(e){}return true}
async function change(oldPassword,newPassword){if(!await verify(oldPassword))return false;const salt=hex(crypto.getRandomValues(new Uint8Array(16)));const digest=await derive(newPassword,salt);localStorage.setItem(STORE,JSON.stringify({salt,digest}));return true}
function lock(){try{sessionStorage.removeItem(UNLOCKED)}catch(e){}}
window.TEACHER_AUTH={verify,change,lock,isUnlocked};
})();
