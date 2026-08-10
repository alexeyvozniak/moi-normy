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
    root.id='praviloWelcome';
    root.setAttribute('role','dialog');
    root.setAttribute('aria-modal','true');
    root.setAttribute('aria-label','Добро пожаловать в Правило');
    root.innerHTML=`
      <div class="praviloWelcomeShell">
        <div class="praviloWelcomeHero"><div class="praviloWelcomeSeal" aria-hidden="true"></div></div>
        <div class="praviloWelcomeBody">
          <div class="praviloWelcomeIntro">
            <div class="praviloWelcomeKicker">Личный ритм</div>
            <div class="praviloWelcomeTitle">Правило</div>
            <div class="praviloWelcomeLead">Молитва, чтение и труд — в одном спокойном ритме.</div>
          </div>
          <div class="praviloWelcomeCards">
            <div class="praviloWelcomeCard">
              <img class="praviloWelcomeIcon" src="images/onboarding_prayer.webp" alt="">
              <div><div class="praviloWelcomeNum">первое</div><div class="praviloWelcomeCardTitle">Задай ритм</div><div class="praviloWelcomeCardText">Норма начисляется сама. Сделанное списывается, а остаток не исчезает.</div></div>
            </div>
            <div class="praviloWelcomeCard">
              <img class="praviloWelcomeIcon" src="images/onboarding_reading.webp" alt="">
              <div><div class="praviloWelcomeNum">второе</div><div class="praviloWelcomeCardTitle">Читай с ориентиром</div><div class="praviloWelcomeCardText">Оставь обычную норму страниц — или включи книгу, срок и автоматический дневной темп.</div></div>
            </div>
            <div class="praviloWelcomeCard">
              <img class="praviloWelcomeIcon" src="images/onboarding_meditation.webp" alt="">
              <div><div class="praviloWelcomeNum">третье</div><div class="praviloWelcomeCardTitle">Сохраняй путь</div><div class="praviloWelcomeCardText">После чтения и медитации можно оставить заметку. Она останется рядом с событием в истории.</div></div>
            </div>
          </div>
          <div class="praviloWelcomeNote">Данные и заметки остаются на этом устройстве. Резервную копию можно сделать в настройках.</div>
          <button class="praviloWelcomeButton" type="button">${preview?'Вернуться':'Начать'}</button>
        </div>
      </div>`;
    document.body.appendChild(root);
    requestAnimationFrame(()=>root.classList.add('show'));
    root.querySelector('.praviloWelcomeButton').addEventListener('click',()=>{
      if(!preview)localStorage.setItem(KEY,'1');
      root.classList.remove('show');
      setTimeout(()=>root.remove(),180);
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
