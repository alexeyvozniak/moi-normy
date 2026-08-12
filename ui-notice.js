(()=>{
  'use strict';

  function ensureNotice(){
    let root=document.getElementById('praviloNotice');
    if(root)return root;

    root=document.createElement('div');
    root.id='praviloNotice';
    root.className='praviloDialog';
    root.setAttribute('role','alertdialog');
    root.setAttribute('aria-modal','true');
    root.innerHTML='<div class="praviloDialogCard"><div class="praviloDialogKicker" data-notice-kicker></div><div class="praviloDialogTitle" data-notice-title></div><div class="praviloDialogText" data-notice-message></div><div class="praviloDialogActions"><button type="button" class="praviloDialogButton primary" data-notice-close>Понятно</button></div></div>';
    document.body.appendChild(root);

    root.querySelector('[data-notice-close]').addEventListener('click',()=>root.classList.remove('show'));
    root.addEventListener('click',event=>{if(event.target===root)root.classList.remove('show');});
    return root;
  }

  window.praviloNotice=function(options={}){
    const root=ensureNotice();
    root.querySelector('[data-notice-kicker]').textContent=options.kicker||'Правило';
    root.querySelector('[data-notice-title]').textContent=options.title||'Обрати внимание';
    root.querySelector('[data-notice-message]').textContent=options.message||'';
    const close=root.querySelector('[data-notice-close]');
    close.textContent=options.closeText||'Понятно';
    root.classList.add('show');
    requestAnimationFrame(()=>close.focus({preventScroll:true}));
  };
})();
