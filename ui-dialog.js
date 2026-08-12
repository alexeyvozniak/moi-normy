(()=>{
  'use strict';
  let resolver=null;

  function ensureDialog(){
    let root=document.getElementById('praviloDialog');
    if(root)return root;
    root=document.createElement('div');root.id='praviloDialog';root.className='praviloDialog';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.innerHTML=`<div class="praviloDialogCard"><div class="praviloDialogKicker" id="praviloDialogKicker">Подтверждение</div><div class="praviloDialogTitle" id="praviloDialogTitle"></div><div class="praviloDialogText" id="praviloDialogText"></div><div class="praviloDialogActions"><button type="button" class="praviloDialogButton" id="praviloDialogCancel">Отмена</button><button type="button" class="praviloDialogButton primary" id="praviloDialogConfirm">Продолжить</button></div></div>`;
    document.body.appendChild(root);
    root.addEventListener('click',event=>{if(event.target===root)settle(false);});
    document.getElementById('praviloDialogCancel').addEventListener('click',()=>settle(false));
    document.getElementById('praviloDialogConfirm').addEventListener('click',()=>settle(true));
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&root.classList.contains('show'))settle(false);});
    return root;
  }

  function settle(value){
    const root=document.getElementById('praviloDialog');if(root)root.classList.remove('show');
    const done=resolver;resolver=null;if(done)done(value);
  }

  window.praviloConfirm=function(options={}){
    const root=ensureDialog();
    if(resolver)settle(false);
    const title=options.title||'Подтвердить действие?';
    const message=options.message||'';
    const confirmText=options.confirmText||'Продолжить';
    const cancelText=options.cancelText||'Отмена';
    const danger=!!options.danger;
    document.getElementById('praviloDialogKicker').textContent=options.kicker||'Подтверждение';
    document.getElementById('praviloDialogTitle').textContent=title;
    document.getElementById('praviloDialogText').textContent=message;
    document.getElementById('praviloDialogCancel').textContent=cancelText;
    const confirm=document.getElementById('praviloDialogConfirm');confirm.textContent=confirmText;confirm.classList.toggle('danger',danger);confirm.classList.toggle('primary',!danger);
    root.classList.add('show');
    requestAnimationFrame(()=>confirm.focus({preventScroll:true}));
    return new Promise(resolve=>{resolver=resolve;});
  };
})();
