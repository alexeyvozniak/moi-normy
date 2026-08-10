(()=>{
  'use strict';
  const preferredTexts=[
    'Три средства делают ум постоянным: бдение, размышление и молитва.',
    'Освободи ум от земного бремени, чтобы молитва восходила к Богу.',
    'Молитва отделяет ум от помыслов и представляет его Богу.',
    'При бесчувствии души полезно частое чтение Писания.',
    'Знание должно вести к очищению сердца, а не к тщеславию.',
    'Через заповеди Господь делает бесстрастными исполняющих их.',
    'Кто любит собеседование со Христом, тот любит уединение.',
    'Внутреннее божественное собеседование влечёт ум к безмолвию.',
    'Память смерти рождает непрестанную молитву и хранение ума.',
    'Безмолвие требует смирения и бдительности над собой.',
    'Нелегко приобрести чистое сердце: нужны борение и труд.',
    'Любовь, воздержание и молитва объемлют добродетельную жизнь.',
    'Чрезмерным воздержанием не ослабляй тело для важнейших занятий.',
    'Сердце наше не знает покоя, пока не успокоится в Боге.'
  ];

  function thoughtfulPool(){
    try{
      const selected=quotes.filter(q=>preferredTexts.includes(q.text));
      if(selected.length)return selected;
      return quotes.filter(q=>String(q.text||'').length>=56);
    }catch(e){return [];}
  }

  function quietRenderDayQuote(){
    const pool=thoughtfulPool();
    if(!pool.length)return;
    const offset=typeof state!=='undefined'?Number(state.dayQuoteOffset)||0:0;
    const d=new Date(),start=new Date(d.getFullYear(),0,0);
    const day=Math.floor((d-start)/86400000);
    const q=pool[(day+offset)%pool.length];
    const text=document.getElementById('dayQuoteText'),author=document.getElementById('dayQuoteAuthor');
    if(text)text.textContent=q.text;
    if(author)author.textContent='— '+q.author;
  }

  try{renderDayQuote=quietRenderDayQuote;}catch(e){window.renderDayQuote=quietRenderDayQuote;}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',quietRenderDayQuote,{once:true});else quietRenderDayQuote();
})();
