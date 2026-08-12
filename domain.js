(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.PraviloDomain=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const DAY_MS=86400000;

  function parseLocalDate(value){
    const [year,month,day]=String(value||'').split('-').map(Number);
    return year&&month&&day?new Date(year,month-1,day,12):null;
  }

  function dateKey(date){
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  }

  function daysBetween(fromKey,toKey){
    const from=parseLocalDate(fromKey),to=parseLocalDate(toKey);
    if(!from||!to)return 0;
    return Math.max(0,Math.floor((to-from)/DAY_MS));
  }

  function daysLeft(deadlineKey,todayKey=dateKey(new Date())){
    const deadline=parseLocalDate(deadlineKey),today=parseLocalDate(todayKey);
    if(!deadline||!today)return 0;
    return Math.floor((deadline-today)/DAY_MS)+1;
  }

  function readingTarget(remainingPages,deadlineKey,todayKey=dateKey(new Date())){
    const remaining=Math.max(0,Math.round(Number(remainingPages)||0));
    if(!remaining)return 0;
    const days=Math.max(1,daysLeft(deadlineKey,todayKey));
    return Math.ceil(remaining/days);
  }

  function accrualCount({lastKey,todayKey,period='daily',intervalDays=1}){
    const days=daysBetween(lastKey,todayKey);
    if(days<1)return 0;
    if(period==='daily')return days;
    if(period==='weekly')return Math.floor(days/7);
    if(period==='interval')return Math.floor(days/Math.max(1,Number(intervalDays)||1));
    if(period==='monthly'){
      const last=parseLocalDate(lastKey),today=parseLocalDate(todayKey);
      if(!last||!today)return 0;
      let count=(today.getFullYear()-last.getFullYear())*12+(today.getMonth()-last.getMonth());
      if(count<=0)return 0;
      const candidate=new Date(last);
      candidate.setMonth(candidate.getMonth()+count);
      if(candidate>today)count-=1;
      return Math.max(0,count);
    }
    return 0;
  }

  return {DAY_MS,parseLocalDate,dateKey,daysBetween,daysLeft,readingTarget,accrualCount};
});
