(()=>{
  'use strict';

  async function confirmMeditationFinish(event){
    const button=event.target.closest?.('#meditationFinish');
    if(!button)return;
    event.preventDefault();
    event.stopImmediatePropagation();

    if(typeof window.praviloConfirm!=='function')return;
    const ok=await window.praviloConfirm({
      kicker:'Медитация',
      title:'Закончить сейчас?',
      message:'Текущая медитация завершится без списания нормы и без записи как выполненной.',
      confirmText:'Закончить',
      danger:false
    });
    if(ok)document.getElementById('meditationExit')?.click();
  }

  function validateReminderSave(event){
    const button=event.target.closest?.('#reminderSave');
    if(!button)return;
    const selected=document.querySelectorAll('#reminderDays .reminderDay.on');
    if(selected.length)return;

    event.preventDefault();
    event.stopImmediatePropagation();
    if(typeof window.praviloNotice==='function'){
      window.praviloNotice({
        kicker:'Напоминание',
        title:'Выбери дни',
        message:'Укажи хотя бы один день недели, когда должно приходить напоминание.'
      });
    }
  }

  document.addEventListener('click',event=>{
    confirmMeditationFinish(event);
    validateReminderSave(event);
  },true);
})();
