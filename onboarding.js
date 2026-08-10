(()=>{
  const KEY='pravilo_onboarding_seen_v1';

  function hasEstablishedState(){
    try{
      const raw=localStorage.getItem('pravilo_v1');
      if(!raw)return false;
      const s=JSON.parse(raw);
      if(Array.isArray(s.history)&&s.history.length)return true;
      if(!Array.isArray(s.items))return false;
      if(s.items.some(i=>!['prayers','pages','meditation'].includes(i.id)))return true;
      const expected={prayers:200,pages:15,meditation:1};
      return s.items.some(i=>Object.prototype.hasOwnProperty.call(expected,i.id)&&Number(i.debt)!==expected[i.id]);
    }catch(e){return false;}
  }

  function show(preview=false){
    document.getElementById('praviloWelcome')?.remove();
    const root=document.createElement('div');
    root.id='praviloWelcome';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','Добро пожаловать в Правило');
    root.innerHTML=`
      <div class="praviloWelcomeCard">
        <div class="praviloWelcomeArt"></div>
        <div class="praviloWelcomeBody">
          <div class="praviloWelcomeKicker">Личный ритм</div>
          <div class="praviloWelcomeTitle">Правило</div>
          <div class="praviloWelcomeLead">Молитва, чтение и труд — без ощущения, что пропущенный день просто исчез.</div>
          <div class="praviloWelcomeSteps">
            <div class="praviloWelcomeStep"><span class="praviloWelcomeNum">一</span><span><b>Задай ритм.</b> Норма начисляется каждый день, неделю, месяц или через выбранный интервал.</span></div>
            <div class="praviloWelcomeStep"><span class="praviloWelcomeNum">二</span><span><b>Списывай сделанное.</b> Остаток спокойно переносится дальше — ничего не теряется.</span></div>
            <div class="praviloWelcomeStep"><span class="praviloWelcomeNum">三</span><span><b>Сохраняй путь.</b> У чтения есть режим книги, а после чтения и медитации можно оставлять заметки в истории.</span></div>
          </div>
          <div class="praviloWelcomePrivacy">Данные остаются на этом устройстве. Резервная копия делается через экспорт в настройках.</div>
          <button class="praviloWelcomeButton" type="button">${preview?'Закрыть':'Начать'}</button>
        </div>
      </div>`;
    document.body.appendChild(root);requestAnimationFrame(()=>root.classList.add('show'));
    root.querySelector('.praviloWelcomeButton').addEventListener('click',()=>{
      if(!preview)localStorage.setItem(KEY,'1');
      root.classList.remove('show');setTimeout(()=>root.remove(),180);
    });
  }

  window.showPraviloOnboarding=show;

  function auto(){
    if(localStorage.getItem(KEY))return;
    if(hasEstablishedState()){localStorage.setItem(KEY,'1');return;}
    show(false);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',auto,{once:true});else auto();
})();
