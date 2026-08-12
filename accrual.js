(()=>{
  'use strict';

  const DAY=86400000;
  const parse=value=>{const [y,m,d]=String(value||'').split('-').map(Number);return y&&m&&d?new Date(y,m-1,d,12):null};
  const key=date=>localDateKey(date);
  const diffDays=(a,b)=>Math.max(0,Math.floor((b-a)/DAY));

  function advanceDays(date,n){const d=new Date(date);d.setDate(d.getDate()+n);return d;}

  function apply(){
    const now=new Date();
    now.setHours(12,0,0,0);
    let changed=false;

    for(const item of state.items||[]){
      const last=parse(item.lastAccrual);
      if(!last){item.lastAccrual=key(now);changed=true;continue;}

      if(item.paused||item.readingPlan||item.resetMode==='daily'){
        if(item.lastAccrual!==key(now)){item.lastAccrual=key(now);changed=true;}
        continue;
      }

      const increment=Math.max(0,Number(item.increment)||0);
      if(!increment)continue;

      const days=diffDays(last,now);
      if(days<1)continue;

      let count=0;
      let next=last;

      if(item.period==='daily'){
        count=days;
        next=advanceDays(last,count);
      }else if(item.period==='weekly'){
        count=Math.floor(days/7);
        next=advanceDays(last,count*7);
      }else if(item.period==='interval'){
        const span=Math.max(1,Number(item.intervalDays)||1);
        count=Math.floor(days/span);
        next=advanceDays(last,count*span);
      }else if(item.period==='monthly'){
        count=(now.getFullYear()-last.getFullYear())*12+(now.getMonth()-last.getMonth());
        if(count>0){
          next=new Date(last);
          next.setMonth(next.getMonth()+count);
          if(next>now){
            count-=1;
            next=new Date(last);
            next.setMonth(next.getMonth()+Math.max(0,count));
          }
        }
      }

      if(count>0){
        item.debt=Math.max(0,Number(item.debt)||0)+increment*count;
        item.lastAccrual=key(next);
        changed=true;
      }
    }

    if(changed){save();render();}
    return changed;
  }

  function init(){
    apply();
    window.addEventListener('pravilo:day-changed',apply);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)apply();});
    window.addEventListener('pageshow',apply);
  }

  window.PraviloAccrual={apply};

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
