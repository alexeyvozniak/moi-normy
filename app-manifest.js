(()=>{
  'use strict';

  const VERSION='1.0.3';
  const STYLES=Object.freeze([
    'designer-fonts.css','ui-controls.css','ui-dialog.css','responsive.css','dashboard.css','editor-layout.css','onboarding.css','feature-ui.css','share-text.css','mode-tools.css','practice.css','prayer-card.css','prayer-haptics.css','reminders.css','settings-hub.css','quiet-ui.css','install-helper.css','header-polish.css','visual-polish.css','section-heroes.css','insights.css'
  ]);
  const SCRIPTS=Object.freeze([
    'ui-dialog.js','ui-notice.js','domain.js','quotes.js','day-clock.js','audio.js','history-ledger.js','share-text.js','accrual.js','onboarding.js','book-mode.js','stats-polish.js','practice-types.js','prayer-card.js','counter-mode.js','catalog-extras.js','path.js','prayer-practice.js','prayer-haptics.js','meditation-practice.js','notes.js','notes-export.js','history-delete.js','today-polish.js','week-history-tools.js','offline-storage.js','reminders.js','interaction-dialogs.js','app-help.js','install-helper.js','settings-hub.js','editor-layout.js','app-self-test.js'
  ]);
  const STATIC_ASSETS=Object.freeze([
    'sounds/prayer-ten.mp3','sounds/prayer-hundred.mp3','sounds/meditation-bell.mp3',
    'icon-180.png','icon-192.png','icon-512.png',
    'images/hero.webp','images/stat_active.webp','images/stat_debt.webp','images/stat_done.webp',
    'images/prayer_person_beads.webp','images/reading_person_book.webp','images/contemplation_looking_up.webp','images/samurai_training.webp','images/selfcare_onsen.webp','images/calligraphy_ink.webp','images/walking_path.webp','images/open_book.webp','images/books_notes.webp','images/enso.webp',
    'images/prayer_icons.webp','images/prayer_prostration.webp','images/prayer_bow.webp',
    'images/settings-reminders.webp','images/settings-data.webp','images/settings-app.webp',
    'images/week-hero.webp','images/history-hero.webp',
    'images/onboarding_hero.webp','images/onboarding_prayer.webp','images/onboarding_reading.webp','images/onboarding_meditation.webp'
  ]);

  globalThis.PraviloManifest=Object.freeze({version:VERSION,styles:STYLES,scripts:SCRIPTS,staticAssets:STATIC_ASSETS});
})();
