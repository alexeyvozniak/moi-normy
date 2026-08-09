<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#f3ede3">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Правило">
<meta name="format-detection" content="telephone=no">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icon-180.png">
<title>Правило</title>
<style>
:root{
  --bg:#f3ede3;--paper:#fbf7f0;--paper2:#f7f1e8;--ink:#1b1814;--muted:#756d63;
  --hair:#d8cdbf;--soft:#ede4d8;--green:#68745f;--green2:#7b8670;--red:#bd5842;
  --shadow:0 10px 28px rgba(71,48,22,.065);
  --serif:ui-serif,"Iowan Old Style","Baskerville","Times New Roman",serif;
  --sans:-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",Arial,sans-serif;
}
*{box-sizing:border-box}
html{background:var(--bg)}
body{
  margin:0;min-height:100vh;background:var(--bg);color:var(--ink);font-family:var(--sans);
  -webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;
}
button,input,select{font:inherit}
button{cursor:pointer;-webkit-tap-highlight-color:transparent}
button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--red);outline-offset:2px}
.app{max-width:720px;margin:auto;padding:calc(env(safe-area-inset-top) + 15px) 14px calc(env(safe-area-inset-bottom) + 32px)}
.header{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:3px 3px 14px}
.title{font:500 38px/.95 var(--serif);letter-spacing:-.045em}
.date{margin-top:7px;color:var(--muted);font-size:13px}
.headActions{display:flex;gap:7px}
.roundButton{
  width:43px;height:43px;display:grid;place-items:center;border-radius:999px;border:1px solid var(--hair);
  color:var(--ink);background:rgba(251,247,240,.78);box-shadow:0 3px 12px rgba(50,30,10,.035);font-size:21px
}
.roundButton:active{transform:scale(.96);background:var(--soft)}
.hero{
  position:relative;overflow:hidden;border:1px solid var(--hair);border-radius:24px;min-height:206px;
  background:url("images/hero.webp") center/cover no-repeat;box-shadow:var(--shadow)
}
.hero::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(243,237,227,.10),transparent 70%)}
.quoteCard{
  position:absolute;z-index:1;left:15px;bottom:14px;max-width:min(82%,390px);padding:14px 15px;
  background:rgba(251,247,240,.94);backdrop-filter:blur(10px);border-radius:17px;border:1px solid rgba(216,205,191,.95);
  box-shadow:0 8px 24px rgba(45,29,11,.08)
}
.quoteLabel{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--red);font-weight:750}
.quoteText{font:500 18px/1.26 var(--serif);margin-top:8px;letter-spacing:-.012em}
.quoteAuthor{font-size:10px;color:var(--muted);margin-top:7px}
.quoteTap{font-size:9px;color:#968c81;margin-top:6px}
.tabs{display:flex;gap:7px;overflow:auto;padding:14px 0 13px;scrollbar-width:none}
.tabs::-webkit-scrollbar{display:none}
.tab{
  white-space:nowrap;border:1px solid var(--hair);background:rgba(251,247,240,.64);color:#3a352f;
  padding:10px 16px;border-radius:999px;font-size:13px
}
.tab.active{background:var(--green);border-color:var(--green);color:white}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:10px}
.stat{
  min-width:0;background:var(--paper);border:1px solid var(--hair);border-radius:18px;padding:10px;
  box-shadow:var(--shadow);display:flex;align-items:center;gap:8px
}
.stat img{width:39px;height:39px;border-radius:50%;object-fit:cover;flex:none}
.statNum{font:500 24px/.9 var(--serif)}
.statLabel{font-size:9px;line-height:1.15;color:var(--muted);margin-top:4px}
.cards{display:flex;flex-direction:column;gap:10px}
.task{
  background:var(--paper);border:1px solid var(--hair);border-radius:22px;padding:15px;box-shadow:var(--shadow)
}
.taskTop{display:grid;grid-template-columns:minmax(0,1fr) 118px;gap:12px}
.taskName{font:500 29px/.98 var(--serif);letter-spacing:-.035em}
.taskRule{color:var(--green2);font-size:12px;margin-top:4px}
.taskImage{width:118px;height:88px;border-radius:15px;object-fit:cover;border:1px solid var(--hair);background:var(--soft)}
.debtLine{display:flex;align-items:flex-end;gap:8px;margin-top:16px}
.debtNumber{font:500 52px/.78 var(--serif);letter-spacing:-.055em}
.debtUnit{font-size:12px;color:var(--muted);padding-bottom:2px}
.debtNote{margin-top:8px;color:var(--muted);font-size:10px}
.task.paused{opacity:.58}
.task.paused .taskRule::after{content:" · пауза";color:var(--red)}
.controlRow{display:grid;grid-template-columns:1.15fr .85fr .9fr;gap:7px;margin-top:14px}
.button{
  min-height:43px;border-radius:13px;border:1px solid var(--hair);background:var(--paper2);color:var(--ink);padding:9px 10px
}
.button.primary{background:var(--green);border-color:var(--green);color:white;font-weight:650}
.button:active{transform:scale(.985)}
.subRow{display:flex;gap:7px;align-items:center;margin-top:8px}
.wordButton,.editButton{
  min-height:35px;border-radius:11px;border:1px solid var(--hair);background:transparent;color:var(--muted);
  padding:7px 10px;font-size:10px
}
.wordButton{color:var(--green);font-weight:650}
.sectionTitle{font:500 22px/1 var(--serif);margin:8px 2px 12px}
.panel{background:var(--paper);border:1px solid var(--hair);border-radius:20px;padding:15px;box-shadow:var(--shadow)}
.weekItem{padding:11px 0;border-bottom:1px solid var(--hair)}
.weekItem:last-child{border-bottom:0}
.weekHead{display:flex;justify-content:space-between;gap:10px;align-items:baseline}
.weekName{font-weight:650}
.weekValue{font:500 18px var(--serif)}
.weekSub{font-size:10px;color:var(--muted);margin-top:4px}
.historyItem{padding:11px 0;border-bottom:1px solid var(--hair);display:grid;grid-template-columns:1fr auto;gap:10px}
.historyItem:last-child{border-bottom:0}
.historyMain{font-size:12px}.historyDate{font-size:9px;color:var(--muted);margin-top:3px}
.historyAmount{font:500 18px var(--serif)}
.gallery{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}
.galleryCard{overflow:hidden;background:var(--paper);border:1px solid var(--hair);border-radius:17px;box-shadow:var(--shadow)}
.galleryCard img{width:100%;aspect-ratio:4/3;object-fit:cover}
.galleryMeta{padding:9px 10px 11px}.galleryName{font-size:12px;font-weight:650}.galleryTags{font-size:9px;color:var(--muted);margin-top:3px}
.empty{text-align:center;padding:28px 16px;color:var(--muted);font-size:12px}
.hidden{display:none!important}

/* modal sheet */
.overlay{
  display:none;position:fixed;inset:0;z-index:50;background:rgba(28,20,12,.28);backdrop-filter:blur(5px);
  align-items:flex-end;justify-content:center
}
.overlay.show{display:flex}
.sheet{
  width:min(720px,100%);max-height:92vh;overflow:auto;background:var(--paper);border-radius:26px 26px 0 0;
  padding:12px 15px calc(env(safe-area-inset-bottom) + 18px);box-shadow:0 -16px 50px rgba(0,0,0,.14)
}
.grabber{width:37px;height:4px;border-radius:999px;background:#c9beb1;margin:0 auto 14px}
.sheetHeader{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:13px}
.sheetTitle{font:500 28px/1 var(--serif)}
.closeBtn{border:0;background:var(--soft);width:36px;height:36px;border-radius:50%;font-size:17px}
.field{margin:12px 0}
.field label{display:block;font-size:10px;color:var(--muted);margin:0 0 6px}
.field input,.field select{
  width:100%;border:1px solid var(--hair);background:#fffaf4;color:var(--ink);border-radius:13px;padding:12px;font-size:15px
}
.two{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.toggleRow{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 0;border-top:1px solid var(--hair)}
.switch{position:relative;width:49px;height:30px;background:#cbc2b7;border-radius:999px;transition:.15s}
.switch::after{content:"";position:absolute;width:24px;height:24px;left:3px;top:3px;border-radius:50%;background:white;box-shadow:0 2px 6px rgba(0,0,0,.12);transition:.15s}
.switch.on{background:var(--green)}.switch.on::after{left:22px}
.pickerGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;max-height:390px;overflow:auto}
.pick{border:2px solid transparent;border-radius:15px;overflow:hidden;background:var(--paper2);padding:0;text-align:left}
.pick img{width:100%;aspect-ratio:4/3;object-fit:cover}.pick span{display:block;padding:7px 8px;font-size:10px}
.pick.selected{border-color:var(--red)}
.sheetActions{display:flex;gap:8px;margin-top:16px}
.sheetActions .button{flex:1}
.danger{color:#9f4938}
.quoteBox{padding:18px;background:linear-gradient(145deg,#fcf8f2,#f0e7db);border:1px solid var(--hair);border-radius:19px}
.quoteTheme{font-size:9px;text-transform:uppercase;letter-spacing:.13em;color:var(--red);font-weight:750}
.quoteBig{font:500 24px/1.3 var(--serif);margin-top:12px;letter-spacing:-.014em}
.quoteBy{font-size:12px;font-weight:650;margin-top:14px}
.quoteSource{font-size:9px;color:var(--muted);margin-top:3px}
.smallText{font-size:9px;color:var(--muted);line-height:1.4}

@media(min-width:600px){
  .app{padding-left:20px;padding-right:20px}
  .taskTop{grid-template-columns:minmax(0,1fr) 190px}
  .taskImage{width:190px;height:132px}
  .gallery{grid-template-columns:repeat(3,1fr)}
}
</style>
</head>
<body>
<main class="app">
  <header class="header">
    <div><div class="title">Правило</div><div class="date" id="date"></div></div>
    <div class="headActions">
      <button class="roundButton" id="addBtn" aria-label="Добавить норму">＋</button>
      <button class="roundButton" id="settingsBtn" aria-label="Настройки">⚙</button>
    </div>
  </header>

  <section class="hero">
    <button class="quoteCard" id="dayQuote" aria-label="Следующая цитата">
      <div class="quoteLabel">Слово дня</div>
      <div class="quoteText" id="dayQuoteText"></div>
      <div class="quoteAuthor" id="dayQuoteAuthor"></div>
      <div class="quoteTap">нажми, чтобы перелистнуть</div>
    </button>
  </section>

  <nav class="tabs" aria-label="Разделы">
    <button class="tab active" data-tab="today">Сегодня</button>
    <button class="tab" data-tab="week">Неделя</button>
    <button class="tab" data-tab="history">История</button>
    <button class="tab" data-tab="catalog">Образы</button>
  </nav>

  <section id="todayView">
    <div class="stats" id="stats"></div>
    <div class="cards" id="cards"></div>
  </section>
  <section id="weekView" class="hidden"><div class="sectionTitle">Последние 7 дней</div><div class="panel" id="weekPanel"></div></section>
  <section id="historyView" class="hidden"><div class="sectionTitle">История</div><div class="panel" id="historyPanel"></div></section>
  <section id="catalogView" class="hidden"><div class="sectionTitle">Образы</div><div class="gallery" id="catalog"></div></section>
</main>

<!-- custom amount -->
<div class="overlay" id="amountOverlay">
  <div class="sheet">
    <div class="grabber"></div>
    <div class="sheetHeader"><div class="sheetTitle" id="amountTitle">Списать</div><button class="closeBtn" data-close="amountOverlay">✕</button></div>
    <div class="field"><label>Сколько выполнено?</label><input id="amountInput" type="number" inputmode="decimal" min="0" step="1"></div>
    <div class="smallText" id="amountHint"></div>
    <div class="sheetActions"><button class="button" data-close="amountOverlay">Отмена</button><button class="button primary" id="amountSave">Списать</button></div>
  </div>
</div>

<!-- editor -->
<div class="overlay" id="editorOverlay">
  <div class="sheet">
    <div class="grabber"></div>
    <div class="sheetHeader"><div class="sheetTitle" id="editorTitle">Новая норма</div><button class="closeBtn" data-close="editorOverlay">✕</button></div>
    <div class="field"><label>Название</label><input id="eName"></div>
    <div class="two">
      <div class="field"><label>Начислять</label><input id="eIncrement" type="number" min="0" step="1"></div>
      <div class="field"><label>Единица</label><input id="eUnit" placeholder="страниц"></div>
    </div>
    <div class="two">
      <div class="field"><label>Период</label><select id="ePeriod"><option value="daily">Каждый день</option><option value="weekly">Каждую неделю</option><option value="monthly">Каждый месяц</option><option value="interval">Каждые N дней</option></select></div>
      <div class="field"><label>Быстро списать</label><input id="eQuick" type="number" min="0" step="1"></div>
    </div>
    <div class="field hidden" id="intervalField"><label>Раз в сколько дней</label><input id="eIntervalDays" type="number" min="1" step="1" value="2"></div>
    <div class="field"><label>Текущий долг</label><input id="eDebt" type="number" min="0" step="1"></div>
    <div class="field"><label>Тема цитат</label>
      <select id="eTheme">
        <option value="auto">Автоматически</option>
        <option value="jesus">Иисусова молитва</option>
        <option value="reading">Чтение и учёба</option>
        <option value="contemplation">Созерцательная молитва</option>
        <option value="orthodox">Православное созерцание</option>
        <option value="catholic">Католическое созерцание</option>
        <option value="work">Труд и терпение</option>
        <option value="rest">Покой и восстановление</option>
        <option value="general">Общие</option>
      </select>
    </div>
    <div class="toggleRow"><div><div style="font-size:13px;font-weight:650">Пауза</div><div class="smallText">Новые нормы временно не начисляются.</div></div><button class="switch" id="pauseSwitch" aria-label="Пауза"></button></div>
    <div class="field"><label>Изображение</label><div class="pickerGrid" id="imagePicker"></div></div>
    <div class="field"><label>Свой URL изображения (необязательно)</label><input id="eImageUrl" placeholder="https://…"></div>
    <div class="sheetActions">
      <button class="button danger" id="deleteTask">Удалить</button>
      <button class="button" data-close="editorOverlay">Отмена</button>
      <button class="button primary" id="saveTask">Сохранить</button>
    </div>
  </div>
</div>

<!-- quote -->
<div class="overlay" id="quoteOverlay">
  <div class="sheet">
    <div class="grabber"></div>
    <div class="sheetHeader"><div class="sheetTitle">Слово</div><button class="closeBtn" data-close="quoteOverlay">✕</button></div>
    <div class="quoteBox">
      <div class="quoteTheme" id="qTheme"></div>
      <div class="quoteBig" id="qText"></div>
      <div class="quoteBy" id="qAuthor"></div>
      <div class="quoteSource" id="qSource"></div>
    </div>
    <div class="sheetActions"><button class="button primary" id="nextQuote">Ещё одно</button><button class="button" data-close="quoteOverlay">Готово</button></div>
  </div>
</div>

<!-- settings -->
<div class="overlay" id="settingsOverlay">
  <div class="sheet">
    <div class="grabber"></div>
    <div class="sheetHeader"><div class="sheetTitle">Настройки</div><button class="closeBtn" data-close="settingsOverlay">✕</button></div>
    <div class="panel">
      <div style="font-size:13px;font-weight:650">Данные хранятся на iPhone</div>
      <div class="smallText" style="margin-top:5px">Резервная копия нужна на случай очистки данных Safari или переустановки приложения.</div>
    </div>
    <div class="sheetActions"><button class="button" id="exportBtn">Экспорт</button><button class="button" id="importBtn">Импорт</button></div>
    <input id="importFile" type="file" accept=".json,application/json" class="hidden">
    <div class="sheetActions"><button class="button danger" id="clearHistory">Очистить историю</button><button class="button danger" id="resetAll">Сбросить всё</button></div>
  </div>
</div>

<script>
const STORAGE_KEY="pravilo_v1";
const LEGACY_KEYS=[
  "moi_normy_final_v1","moi_normy_themed_quotes_v1","moi_normy_catalog_quotes_v1","moi_normy_catalog_v1",
  "moi_normy_visual_v1","moi_normy_pro_v3","moi_normy_dynamic_v2","moi_normy_v1"
];

const assets=[
  {id:"prayer",name:"Молитва",src:"images/prayer_person_beads.webp",tags:"молитва · внимание"},
  {id:"reading",name:"Чтение в горах",src:"images/reading_person_book.webp",tags:"чтение · учёба"},
  {id:"contemplation",name:"Созерцание",src:"images/contemplation_looking_up.webp",tags:"тишина · молитва"},
  {id:"sport",name:"Тренировка",src:"images/samurai_training.webp",tags:"спорт · дисциплина"},
  {id:"onsen",name:"Горячая ванна",src:"images/selfcare_onsen.webp",tags:"забота о себе · отдых"},
  {id:"calligraphy",name:"Тушь и каллиграфия",src:"images/calligraphy_ink.webp",tags:"письмо · творчество"},
  {id:"wanderer",name:"Путь",src:"images/walking_path.webp",tags:"прогулка · рефлексия"},
  {id:"book",name:"Книга и горы",src:"images/open_book.webp",tags:"чтение · исследование"},
  {id:"desk",name:"Рабочий стол",src:"images/books_notes.webp",tags:"работа · проект"},
  {id:"enso",name:"Энсо",src:"images/enso.webp",tags:"универсальный образ"}
];

const themes={
  jesus:"Иисусова молитва",reading:"Чтение и учёба",contemplation:"Созерцательная молитва",
  orthodox:"Православное созерцание",catholic:"Католическое созерцание",
  work:"Труд и терпение",rest:"Покой и восстановление",general:"Слово дня"
};

/* Короткие формулировки, сверенные по указанным источникам.
   Для католических источников русский текст — наш перевод по Vatican.va. */
const quotes=[{"t":["jesus","orthodox"],"text":"Молитву совершай с усердием и со вниманием.","author":"прп. Антоний Великий","source":"Духовные наставления"},{"t":["jesus","orthodox"],"text":"Всегда имей Бога перед своими очами.","author":"прп. Антоний Великий","source":"Изречения"},{"t":["jesus"],"text":"Взывайте к Нему непрестанно день и ночь.","author":"прп. Антоний Великий","source":"Письма к монахам"},{"t":["jesus","work"],"text":"Прилежная молитва есть погибель унынию.","author":"прп. Иоанн Лествичник","source":"Лествица, слово 26"},{"t":["jesus","contemplation"],"text":"Молитва есть пребывание и соединение человека с Богом.","author":"прп. Иоанн Лествичник","source":"Лествица, слово 28"},{"t":["jesus","contemplation"],"text":"Кто предстоит Богу в сердце, тот в молитве неподвижен.","author":"прп. Иоанн Лествичник","source":"Лествица, слово 19"},{"t":["jesus","orthodox"],"text":"Три средства делают ум постоянным: бдение, размышление и молитва.","author":"прп. Иоанн Кассиан Римлянин","source":"Собеседование 10"},{"t":["jesus","orthodox"],"text":"Освободи ум от земного бремени, чтобы молитва восходила к Богу.","author":"прп. Иоанн Кассиан Римлянин","source":"Собеседование 9"},{"t":["jesus","orthodox"],"text":"Без непрестанной молитвы не можешь приблизиться к Богу.","author":"прп. Исаак Сирин","source":"Слово 69"},{"t":["jesus","contemplation"],"text":"Движение языка и сердца к молитве суть ключи.","author":"прп. Исаак Сирин","source":"Слово 15"},{"t":["jesus","orthodox"],"text":"Чем больше молитв, тем более смиряется сердце.","author":"прп. Исаак Сирин","source":"Слово 61"},{"t":["jesus","work"],"text":"Если хочешь победить уныние, читай или часто молись.","author":"прп. Ефрем Сирин","source":"О восьми помыслах"},{"t":["jesus","work"],"text":"Молитвы оставлять не должно, и работой заниматься необходимо.","author":"свт. Василий Великий","source":"Правила, вопрос 38"},{"t":["jesus"],"text":"Большую силу имеет молитва.","author":"свт. Иоанн Златоуст","source":"Собеседование на псалом 113"},{"t":["jesus","contemplation"],"text":"Молитва отделяет ум от помыслов и представляет его Богу.","author":"прп. Максим Исповедник","source":"Слово о подвижнической жизни"},{"t":["reading"],"text":"Прилежно читай Писание: в нём научишься мудрости.","author":"прп. Ефрем Сирин","source":"На слова: Сыне, моей премудрости внимай"},{"t":["reading","work"],"text":"Трудись и читай немного, с рассуждением.","author":"прп. Ефрем Сирин","source":"Творения, труд 128"},{"t":["reading"],"text":"Не утруждай себя чтением, за которым не следует дело.","author":"прп. Ефрем Сирин","source":"Творения, труд 128"},{"t":["reading","contemplation"],"text":"Чтение — источник чистой молитвы.","author":"прп. Исаак Сирин","source":"Слово 40"},{"t":["reading"],"text":"Когда ум рассеян, занимайся чтением.","author":"прп. Исаак Сирин","source":"Слово 40"},{"t":["reading"],"text":"Чтение Божественных Писаний есть учение.","author":"свт. Иоанн Златоуст","source":"Собеседование на псалом 96"},{"t":["reading"],"text":"При бесчувствии души полезно частое чтение Писания.","author":"прп. авва Дорофей","source":"Душеполезные поучения"},{"t":["reading"],"text":"Из всего старайся извлекать себе назидание.","author":"прп. авва Дорофей","source":"Наставления на каждый день"},{"t":["reading","work"],"text":"Если потеряешь время в праздности, другого взамен не найдёшь.","author":"прп. авва Дорофей","source":"Наставления на каждый день"},{"t":["reading","contemplation"],"text":"Псалом — тишина души; он вознаграждает миром.","author":"прп. Ефрем Сирин","source":"Творения, труд 60"},{"t":["reading","rest"],"text":"Псалом — упокоение от дневных трудов.","author":"свт. Василий Великий","source":"Беседы на псалмы"},{"t":["reading"],"text":"Что бы ты ни делал, имей свидетельство в Писании.","author":"прп. Антоний Великий","source":"Изречения"},{"t":["reading","work"],"text":"Знание должно вести к очищению сердца, а не к тщеславию.","author":"прп. Иоанн Кассиан Римлянин","source":"Собеседование 14"},{"t":["reading","contemplation"],"text":"Молитва очищает ум, подготавливая его к созерцанию.","author":"прп. Максим Исповедник","source":"Главы о любви"},{"t":["reading","work"],"text":"Через заповеди Господь делает бесстрастными исполняющих их.","author":"прп. Максим Исповедник","source":"Главы о любви"},{"t":["orthodox","contemplation"],"text":"Возлюби безмолвие гораздо более дел.","author":"прп. Исаак Сирин","source":"Слово 40"},{"t":["orthodox","contemplation"],"text":"Кто любит собеседование со Христом, тот любит уединение.","author":"прп. Исаак Сирин","source":"Слово 41"},{"t":["orthodox","contemplation","rest"],"text":"Не умножай попечений — и не найдёшь парения в уме.","author":"прп. Исаак Сирин","source":"Слово 69"},{"t":["orthodox","contemplation"],"text":"Внутреннее божественное собеседование влечёт ум к безмолвию.","author":"прп. Исаак Сирин","source":"Слово 76"},{"t":["orthodox","contemplation"],"text":"Молитва очищает ум и готовит его к созерцанию.","author":"прп. Максим Исповедник","source":"Главы о любви"},{"t":["orthodox","contemplation"],"text":"Молитва представляет ум нагим Самому Богу.","author":"прп. Максим Исповедник","source":"Слово о подвижнической жизни"},{"t":["orthodox","contemplation"],"text":"Много нужно труда, чтобы приобрести чистое сердце.","author":"прп. Макарий Великий","source":"Духовные беседы"},{"t":["orthodox","contemplation","work"],"text":"Труды молитвы переноси с доброю надеждою.","author":"прп. Макарий Великий","source":"Послание"},{"t":["orthodox","contemplation"],"text":"Размышляй о делах Божиих.","author":"прп. Антоний Великий","source":"Духовные наставления"},{"t":["orthodox","contemplation"],"text":"Молчание и безмолвие — враги тщеславия.","author":"прп. Иоанн Лествичник","source":"Лествица, слово 26"},{"t":["orthodox","contemplation"],"text":"Память смерти рождает непрестанную молитву и хранение ума.","author":"прп. Иоанн Лествичник","source":"Лествица, слово 6"},{"t":["orthodox","contemplation"],"text":"Безмолвие требует смирения и бдительности над собой.","author":"прп. авва Дорофей","source":"Наставления на каждый день"},{"t":["orthodox","contemplation"],"text":"Чистота сердца требует освобождения от страстей.","author":"прп. Иоанн Кассиан Римлянин","source":"Собеседование 9"},{"t":["work"],"text":"Бог сотворил человека деятельным, а не праздным.","author":"свт. Василий Великий","source":"Подвижнические уставы"},{"t":["work"],"text":"И в работе помни о молитве.","author":"свт. Василий Великий","source":"Правила, вопрос 38"},{"t":["work"],"text":"Мужественная душа воскрешает и умерший ум.","author":"прп. Иоанн Лествичник","source":"Лествица, слово 13"},{"t":["work"],"text":"Уныние и леность расточают всё богатство.","author":"прп. Иоанн Лествичник","source":"Лествица, слово 13"},{"t":["work"],"text":"Труды молитвы и поста переноси с благою надеждою.","author":"прп. Макарий Великий","source":"Послание"},{"t":["work"],"text":"Нелегко приобрести чистое сердце: нужны борение и труд.","author":"прп. Макарий Великий","source":"Духовные беседы"},{"t":["work"],"text":"Никого не учи прежде, нежели сам исполнишь это.","author":"прп. Антоний Великий","source":"Духовные наставления"},{"t":["work"],"text":"Что бы ты ни делал, имей Бога перед глазами.","author":"прп. Антоний Великий","source":"Изречения"},{"t":["work"],"text":"Займись рукоделием, читай или молись — и уныние отступит.","author":"прп. Ефрем Сирин","source":"О восьми помыслах"},{"t":["work","reading"],"text":"Учение без доброй жизни не приносит своего плода.","author":"прп. Ефрем Сирин","source":"Творения, труд 128"},{"t":["work"],"text":"Долготерпение — мужественная твёрдость в скорбях.","author":"прп. Максим Исповедник","source":"Слово о подвижнической жизни"},{"t":["work"],"text":"Любовь, воздержание и молитва объемлют добродетельную жизнь.","author":"прп. Максим Исповедник","source":"Слово о подвижнической жизни"},{"t":["work"],"text":"Всякое доброе дело испытывается искушением.","author":"прп. авва Дорофей","source":"Душеполезные поучения"},{"t":["work"],"text":"Путь Божий проходи разумно и внимательно.","author":"прп. авва Дорофей","source":"Душеполезные поучения"},{"t":["work"],"text":"Во всём спрашивай прежде свою совесть.","author":"прп. Иоанн Кассиан Римлянин","source":"Собеседование 21"},{"t":["rest"],"text":"Если человек не узнает скорби, не узнает и покоя.","author":"прп. авва Дорофей","source":"Душеполезные поучения"},{"t":["rest"],"text":"Не смущайся тем, что приходит по необходимости.","author":"прп. авва Дорофей","source":"Наставления на каждый день"},{"t":["rest","contemplation"],"text":"Без освобождения от забот не ищи тишины в душе.","author":"прп. Исаак Сирин","source":"Слово 69"},{"t":["rest","contemplation"],"text":"Безмолвие хранит сердце от рассеяния.","author":"прп. Исаак Сирин","source":"Слова подвижнические"},{"t":["rest"],"text":"Живи так, как бы тебя не было в мире, и обретёшь покой.","author":"прп. Антоний Великий","source":"Изречения"},{"t":["rest"],"text":"Избегай и излишества, и чрезмерной строгости.","author":"прп. Иоанн Кассиан Римлянин","source":"Собеседование 21"},{"t":["rest"],"text":"Чрезмерным воздержанием не ослабляй тело для важнейших занятий.","author":"свт. Василий Великий","source":"Подвижнические уставы"},{"t":["rest","reading"],"text":"Псалом приносит душе тишину и мир.","author":"свт. Василий Великий","source":"Беседы на псалмы"},{"t":["catholic","contemplation","rest"],"text":"Сердце наше не знает покоя, пока не успокоится в Боге.","author":"блж. Августин","source":"Исповедь I, 1"},{"t":["catholic","contemplation","rest"],"text":"Пусть ничто тебя не тревожит: Бог не изменяется.","author":"св. Тереза Авильская","source":"Nada te turbe"},{"t":["catholic","contemplation","rest"],"text":"Одного Бога достаточно.","author":"св. Тереза Авильская","source":"Nada te turbe"},{"t":["catholic","contemplation"],"text":"Молитва — простой взгляд, обращённый к небу.","author":"св. Тереза Младенца Иисуса","source":"История одной души"},{"t":["catholic","work"],"text":"Благочестие возможно в любом состоянии и призвании.","author":"св. Франциск Сальский","source":"Введение в благочестивую жизнь"}];

function localDateKey(d=new Date()){
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function parseLocalKey(k){
  const [y,m,d]=k.split("-").map(Number); return new Date(y,m-1,d,12,0,0);
}
function dayDiff(a,b){ return Math.max(0,Math.round((parseLocalKey(b)-parseLocalKey(a))/86400000)); }
function monthDiff(a,b){
  const A=parseLocalKey(a),B=parseLocalKey(b); return Math.max(0,(B.getFullYear()-A.getFullYear())*12+B.getMonth()-A.getMonth());
}
function uid(){ return "n_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,7); }
function clone(x){ return JSON.parse(JSON.stringify(x)); }
function safeNumber(v,d=0){ const n=Number(v); return Number.isFinite(n)?n:d; }
function escapeHtml(s=""){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}

function freshState(){
  const today=localDateKey();
  return {
    items:[
      {id:"prayers",name:"Молитвы",unit:"молитв",increment:200,period:"daily",quick:50,debt:200,image:"images/prayer_person_beads.webp",theme:"jesus",paused:false,lastAccrual:today},
      {id:"pages",name:"Чтение",unit:"страниц",increment:15,period:"daily",quick:5,debt:15,image:"images/reading_person_book.webp",theme:"reading",paused:false,lastAccrual:today},
      {id:"meditation",name:"Медитация",unit:"медитаций",increment:1,period:"weekly",quick:1,debt:1,image:"images/contemplation_looking_up.webp",theme:"contemplation",paused:false,lastAccrual:today}
    ],
    history:[],
    dayQuoteOffset:0
  };
}
function migrateLegacy(raw){
  if(!raw || !Array.isArray(raw.items)) return null;
  const today=localDateKey();
  const mapImage=(i)=>{
    const s=(i.image||"");
    if(i.id==="prayers"||/prayer|молит/i.test(i.name||"")) return "images/prayer_person_beads.webp";
    if(i.id==="pages"||/чтен|book|read/i.test(i.name||"")) return "images/reading_person_book.webp";
    if(i.id==="meditation"||/медит|созер/i.test(i.name||"")) return "images/contemplation_looking_up.webp";
    return s && !s.startsWith("images/") ? s : "images/enso.webp";
  };
  return {
    items:raw.items.map(i=>({
      id:i.id||uid(),name:i.name||"Норма",unit:i.unit||"ед.",
      increment:safeNumber(i.increment ?? i.amount,1),
      period:i.period||i.frequency||"daily", intervalDays:Math.max(1,safeNumber(i.intervalDays,2)),
      quick:safeNumber(i.quick ?? i.step,1),
      debt:safeNumber(i.debt ?? i.balance,0),
      image:mapImage(i),
      theme:i.theme||i.quoteTheme||"auto",
      paused:!!i.paused,
      lastAccrual:i.lastAccrual||today
    })),
    history:Array.isArray(raw.history)?raw.history.map(h=>({
      id:h.id||uid(),ts:h.ts||h.date||new Date().toISOString(),day:h.day||String(h.date||"").slice(0,10)||today,
      itemId:h.itemId||"",item:h.item||h.name||"",amount:safeNumber(h.amount,0),type:h.type||h.action||"complete"
    })):[],
    dayQuoteOffset:0
  };
}
function load(){
  try{
    const own=localStorage.getItem(STORAGE_KEY);
    if(own) return JSON.parse(own);
    for(const k of LEGACY_KEYS){
      const s=localStorage.getItem(k);
      if(s){
        const m=migrateLegacy(JSON.parse(s));
        if(m){localStorage.setItem(STORAGE_KEY,JSON.stringify(m));return m;}
      }
    }
  }catch(e){}
  const f=freshState();localStorage.setItem(STORAGE_KEY,JSON.stringify(f));return f;
}
let state=load();
let currentTab="today";
let editId=null,selectedImage="images/enso.webp",amountId=null,quoteTheme="general",quoteIndex=0;

function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
function normalize(){
  if(!Array.isArray(state.items))state.items=[];
  if(!Array.isArray(state.history))state.history=[];
  const today=localDateKey();
  state.items.forEach(i=>{
    i.increment=Math.max(0,safeNumber(i.increment,1));i.quick=Math.max(0.01,safeNumber(i.quick,1));
    i.debt=Math.max(0,safeNumber(i.debt,0));i.period=["daily","weekly","monthly","interval"].includes(i.period)?i.period:"daily";i.intervalDays=Math.max(1,safeNumber(i.intervalDays,2));
    i.lastAccrual=i.lastAccrual||today;i.theme=i.theme||"auto";i.paused=!!i.paused;
  });
}
function accrue(){
  normalize();
  const today=localDateKey();
  for(const i of state.items){
    if(i.paused){i.lastAccrual=today;continue;}
    let periods=0;
    if(i.period==="daily") periods=dayDiff(i.lastAccrual,today);
    else if(i.period==="weekly") periods=Math.floor(dayDiff(i.lastAccrual,today)/7);
    else if(i.period==="interval") periods=Math.floor(dayDiff(i.lastAccrual,today)/i.intervalDays);
    else periods=monthDiff(i.lastAccrual,today);
    if(periods>0){
      i.debt += periods*i.increment;
      if(i.period==="daily") i.lastAccrual=today;
      else if(i.period==="weekly"){
        const d=parseLocalKey(i.lastAccrual);d.setDate(d.getDate()+periods*7);i.lastAccrual=localDateKey(d);
      }else if(i.period==="interval"){
        const d=parseLocalKey(i.lastAccrual);d.setDate(d.getDate()+periods*i.intervalDays);i.lastAccrual=localDateKey(d);
      }else{
        const d=parseLocalKey(i.lastAccrual);d.setMonth(d.getMonth()+periods);i.lastAccrual=localDateKey(d);
      }
    }
  }
  save();
}
function ruleText(i){
  return `+${i.increment} ${i.period==="daily"?"каждый день":i.period==="weekly"?"каждую неделю":i.period==="interval"?`каждые ${i.intervalDays} дн.`:"каждый месяц"}`;
}
function dueNorms(i){return i.increment>0?i.debt/i.increment:0;}
function inferTheme(i){
  if(i.theme&&i.theme!=="auto")return i.theme;
  const s=(i.name+" "+i.unit).toLowerCase();
  if(/молит|иисус|четк|чётк/.test(s))return"jesus";
  if(/чтен|книг|страниц|учеб|стать|англ|язык/.test(s))return"reading";
  if(/медит|созерц|тишин|молчан/.test(s))return"contemplation";
  if(/сон|отдых|ванн|бан|забот|восстан/.test(s))return"rest";
  if(/спорт|трен|работ|диссер|проект|задач|писа/.test(s))return"work";
  return"general";
}
function themePool(theme){
  if(theme==="contemplation") return quotes.filter(q=>q.t.includes("orthodox")||q.t.includes("catholic")||q.t.includes("contemplation"));
  const p=quotes.filter(q=>q.t.includes(theme)); return p.length?p:quotes;
}
function dateNumber(){
  const d=new Date(),start=new Date(d.getFullYear(),0,0);return Math.floor((d-start)/86400000);
}
function renderDayQuote(){
  const q=quotes[(dateNumber()+safeNumber(state.dayQuoteOffset,0))%quotes.length];
  document.getElementById("dayQuoteText").textContent=q.text;
  document.getElementById("dayQuoteAuthor").textContent="— "+q.author;
}
function nextDayQuote(){state.dayQuoteOffset=(safeNumber(state.dayQuoteOffset,0)+1)%quotes.length;save();renderDayQuote();}

function statsData(){
  const active=state.items.filter(i=>!i.paused).length;
  const withDebt=state.items.filter(i=>i.debt>0&&!i.paused).length;
  const today=localDateKey();
  const closed=new Set(state.history.filter(h=>h.day===today&&h.type==="close").map(h=>h.itemId)).size;
  return[
    ["images/stat_active.webp",active,"активных норм"],
    ["images/stat_debt.webp",withDebt,"с долгом"],
    ["images/stat_done.webp",closed,"закрыто сегодня"]
  ];
}
function renderStats(){
  document.getElementById("stats").innerHTML=statsData().map(([img,n,l])=>`
    <div class="stat"><img src="${img}" alt=""><div><div class="statNum">${n}</div><div class="statLabel">${l}</div></div></div>`).join("");
}
function renderCards(){
  const el=document.getElementById("cards");
  if(!state.items.length){el.innerHTML='<div class="empty">Нажми «＋», чтобы создать первую норму.</div>';return;}
  el.innerHTML=state.items.map(i=>{
    const n=dueNorms(i);
    const note=i.debt===0?"Долг закрыт":n>=1?`≈ ${Math.round(n*10)/10} нормы в остатке`:"меньше одной нормы";
    return `<article class="task ${i.paused?"paused":""}">
      <div class="taskTop">
        <div><div class="taskName">${escapeHtml(i.name)}</div><div class="taskRule">${escapeHtml(ruleText(i))}</div></div>
        <img class="taskImage" src="${escapeHtml(i.image)}" alt="">
      </div>
      <div class="debtLine"><div class="debtNumber">${i.debt}</div><div class="debtUnit">${escapeHtml(i.unit)} осталось</div></div>
      <div class="debtNote">${note}</div>
      <div class="controlRow">
        <button class="button primary" onclick="openAmount('${i.id}')">Списать</button>
        <button class="button" onclick="quickSubtract('${i.id}')">−${i.quick}</button>
        <button class="button" onclick="closeDebt('${i.id}')">Закрыть</button>
      </div>
      <div class="subRow">
        <button class="wordButton" onclick="openQuoteFor('${i.id}')">✦ Слово к этому делу</button>
        <button class="editButton" onclick="openEditor('${i.id}')">Изменить</button>
      </div>
    </article>`;
  }).join("");
}
function logAction(i,amount,type){
  state.history.unshift({id:uid(),ts:new Date().toISOString(),day:localDateKey(),itemId:i.id,item:i.name,amount,unit:i.unit,type});
  state.history=state.history.slice(0,500);
}
function subtract(id,amount,type="complete"){
  const i=state.items.find(x=>x.id===id);if(!i)return;
  const n=Math.max(0,safeNumber(amount,0));if(!n)return;
  const before=i.debt;
  const actual=Math.min(before,n);
  i.debt=Math.max(0,before-n);
  const finalType=(before>0&&i.debt===0)?"close":type;
  logAction(i,actual,finalType);save();render();
}
function quickSubtract(id){const i=state.items.find(x=>x.id===id);if(i)subtract(id,i.quick);}
function closeDebt(id){const i=state.items.find(x=>x.id===id);if(i&&i.debt>0)subtract(id,i.debt,"close");}
function openAmount(id){
  amountId=id;const i=state.items.find(x=>x.id===id);if(!i)return;
  document.getElementById("amountTitle").textContent="Списать: "+i.name;
  document.getElementById("amountHint").textContent=`Сейчас осталось ${i.debt} ${i.unit}.`;
  document.getElementById("amountInput").value="";
  showOverlay("amountOverlay");setTimeout(()=>document.getElementById("amountInput").focus(),150);
}
function renderWeek(){
  const since=new Date();since.setDate(since.getDate()-6);since.setHours(0,0,0,0);
  const rows=state.items.map(i=>{
    const logs=state.history.filter(h=>h.itemId===i.id&&h.type!=="accrue"&&new Date(h.ts)>=since);
    const done=logs.reduce((s,h)=>s+h.amount,0);
    const actions=logs.length;
    return `<div class="weekItem"><div class="weekHead"><div class="weekName">${escapeHtml(i.name)}</div><div class="weekValue">${done} ${escapeHtml(i.unit)}</div></div><div class="weekSub">${actions} ${actions===1?"действие":"действий"} за 7 дней · текущий остаток ${i.debt}</div></div>`;
  }).join("");
  document.getElementById("weekPanel").innerHTML=rows||'<div class="empty">Пока нечего показывать.</div>';
}
function renderHistory(){
  const el=document.getElementById("historyPanel");
  if(!state.history.length){el.innerHTML='<div class="empty">История пока пуста.</div>';return;}
  el.innerHTML=state.history.slice(0,80).map(h=>{
    const d=new Intl.DateTimeFormat("ru-RU",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}).format(new Date(h.ts));
    return `<div class="historyItem"><div class="historyMain"><strong>${escapeHtml(h.item)}</strong><div class="historyDate">${d} · ${h.type==="close"?"закрыто":"выполнено"}</div></div><div class="historyAmount">−${h.amount}</div></div>`;
  }).join("");
}
function renderCatalog(){
  document.getElementById("catalog").innerHTML=assets.map(a=>`<div class="galleryCard"><img src="${a.src}" alt=""><div class="galleryMeta"><div class="galleryName">${a.name}</div><div class="galleryTags">${a.tags}</div></div></div>`).join("");
}
function render(){accrue();document.getElementById("date").textContent=new Intl.DateTimeFormat("ru-RU",{weekday:"long",day:"numeric",month:"long"}).format(new Date());renderDayQuote();renderStats();renderCards();renderWeek();renderHistory();renderCatalog();setTab(currentTab);}

function setTab(t){
  currentTab=t;document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===t));
  for(const x of["today","week","history","catalog"])document.getElementById(x+"View").classList.toggle("hidden",x!==t);
}
function showOverlay(id){document.getElementById(id).classList.add("show");}
function hideOverlay(id){document.getElementById(id).classList.remove("show");}
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>hideOverlay(b.dataset.close)));
document.querySelectorAll(".overlay").forEach(o=>o.addEventListener("click",e=>{if(e.target===o)hideOverlay(o.id)}));
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>setTab(b.dataset.tab)));

function imagePicker(){
  document.getElementById("imagePicker").innerHTML=assets.map(a=>`<button class="pick ${selectedImage===a.src?"selected":""}" onclick="selectImage('${a.src}')"><img src="${a.src}" alt=""><span>${a.name}</span></button>`).join("");
}
function selectImage(src){selectedImage=src;document.getElementById("eImageUrl").value="";imagePicker();}
function openEditor(id=null){
  editId=id;const i=id?state.items.find(x=>x.id===id):null;const today=localDateKey();
  document.getElementById("editorTitle").textContent=i?"Изменить норму":"Новая норма";
  document.getElementById("eName").value=i?.name||"";
  document.getElementById("eIncrement").value=i?.increment??1;
  document.getElementById("eUnit").value=i?.unit||"";
  document.getElementById("ePeriod").value=i?.period||"daily";
  document.getElementById("eIntervalDays").value=i?.intervalDays??2;
  toggleIntervalField();
  document.getElementById("eQuick").value=i?.quick??1;
  document.getElementById("eDebt").value=i?.debt??1;
  document.getElementById("eTheme").value=i?.theme||"auto";
  selectedImage=i?.image&&i.image.startsWith("images/")?i.image:"images/enso.webp";
  document.getElementById("eImageUrl").value=i?.image&&!i.image.startsWith("images/")?i.image:"";
  document.getElementById("pauseSwitch").classList.toggle("on",!!i?.paused);
  document.getElementById("deleteTask").classList.toggle("hidden",!i);
  imagePicker();showOverlay("editorOverlay");
}
function saveEditor(){
  const existing=editId?state.items.find(x=>x.id===editId):null;
  const imageUrl=document.getElementById("eImageUrl").value.trim();
  const item=existing||{id:uid(),lastAccrual:localDateKey()};
  item.name=document.getElementById("eName").value.trim()||"Новая норма";
  item.increment=Math.max(0,safeNumber(document.getElementById("eIncrement").value,1));
  item.unit=document.getElementById("eUnit").value.trim()||"ед.";
  item.period=document.getElementById("ePeriod").value;
  item.intervalDays=Math.max(1,safeNumber(document.getElementById("eIntervalDays").value,2));
  item.quick=Math.max(.01,safeNumber(document.getElementById("eQuick").value,1));
  item.debt=Math.max(0,safeNumber(document.getElementById("eDebt").value,item.increment));
  item.theme=document.getElementById("eTheme").value;
  item.image=imageUrl||selectedImage;
  item.paused=document.getElementById("pauseSwitch").classList.contains("on");
  item.lastAccrual=localDateKey(); // changing rule starts accrual cleanly from today
  if(!existing)state.items.push(item);
  save();hideOverlay("editorOverlay");render();
}
function deleteTask(){
  if(!editId)return;const i=state.items.find(x=>x.id===editId);if(!i)return;
  if(confirm(`Удалить «${i.name}»?`)){state.items=state.items.filter(x=>x.id!==editId);save();hideOverlay("editorOverlay");render();}
}

function openQuoteFor(id){
  const i=state.items.find(x=>x.id===id);quoteTheme=i?inferTheme(i):"general";quoteIndex=0;renderQuote();showOverlay("quoteOverlay");
}
function renderQuote(){
  const p=themePool(quoteTheme),q=p[quoteIndex%p.length];
  document.getElementById("qTheme").textContent=themes[quoteTheme]||"Слово";
  document.getElementById("qText").textContent=q.text;
  document.getElementById("qAuthor").textContent="— "+q.author;
  document.getElementById("qSource").textContent=q.source;
}

document.getElementById("dayQuote").addEventListener("click",nextDayQuote);
document.getElementById("addBtn").addEventListener("click",()=>openEditor());
document.getElementById("settingsBtn").addEventListener("click",()=>showOverlay("settingsOverlay"));
function toggleIntervalField(){document.getElementById("intervalField").classList.toggle("hidden",document.getElementById("ePeriod").value!=="interval");}
document.getElementById("ePeriod").addEventListener("change",toggleIntervalField);
document.getElementById("pauseSwitch").addEventListener("click",e=>e.currentTarget.classList.toggle("on"));
document.getElementById("saveTask").addEventListener("click",saveEditor);
document.getElementById("deleteTask").addEventListener("click",deleteTask);
document.getElementById("amountSave").addEventListener("click",()=>{if(amountId){subtract(amountId,document.getElementById("amountInput").value);hideOverlay("amountOverlay");}});
document.getElementById("nextQuote").addEventListener("click",()=>{quoteIndex++;renderQuote();});

function exportData(){
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="pravilo-backup.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function importData(file){
  const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);const m=migrateLegacy(x)||x;if(!Array.isArray(m.items))throw 0;state=m;save();hideOverlay("settingsOverlay");render();alert("Резервная копия восстановлена.");}catch(e){alert("Не удалось прочитать файл.");}};r.readAsText(file);
}
document.getElementById("exportBtn").addEventListener("click",exportData);
document.getElementById("importBtn").addEventListener("click",()=>document.getElementById("importFile").click());
document.getElementById("importFile").addEventListener("change",e=>{if(e.target.files[0])importData(e.target.files[0]);e.target.value="";});
document.getElementById("clearHistory").addEventListener("click",()=>{if(confirm("Очистить историю? Нормы и текущие долги останутся.")){state.history=[];save();render();}});
document.getElementById("resetAll").addEventListener("click",()=>{if(confirm("Полностью сбросить приложение?")){state=freshState();save();hideOverlay("settingsOverlay");render();}});

window.openAmount=openAmount;window.quickSubtract=quickSubtract;window.closeDebt=closeDebt;window.openEditor=openEditor;window.openQuoteFor=openQuoteFor;window.selectImage=selectImage;

render();
if("serviceWorker"in navigator){
  navigator.serviceWorker.register("./sw.js").then(reg=>{
    reg.update().catch(()=>{});
  }).catch(()=>{});
}
</script>
</body>
</html>