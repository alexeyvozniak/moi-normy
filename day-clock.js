(()=>{
  'use strict';

  let currentDay=localDateKey();
  let midnightTimer=null;

  function nextMidnightDelay(){
    const now=new Date();
    const next=new Date(now);
    next.setHours(24,0,1,0);
    return Math.max(1000,next-now);
  }

  function emitIfChanged(source='timer'){
    const nextDay=localDateKey();
    if(nextDay===currentDay)return false;
    const previousDay=currentDay;
    currentDay=nextDay;
    window.dispatchEvent(new CustomEvent('pravilo:day-changed',{detail:{previousDay,currentDay,source}}));
    return true;
  }

  function scheduleMidnight(){
    clearTimeout(midnightTimer);
    midnightTimer=setTimeout(()=>{
      emitIfChanged('midnight');
      scheduleMidnight();
    },nextMidnightDelay());
  }

  function check(source){
    emitIfChanged(source);
    scheduleMidnight();
  }

  function init(){
    scheduleMidnight();
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)check('visibility');});
    window.addEventListener('focus',()=>check('focus'));
    window.addEventListener('pageshow',()=>check('pageshow'));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
