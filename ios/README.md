# iOS companion + WidgetKit для «Правило»

Эта папка — минимальный нативный слой для настоящего системного виджета iPhone.

Важно: Home Screen web app (PWA) не может сама установить WidgetKit-виджет. Для системного виджета нужно собрать iOS-приложение в Xcode и установить его на iPhone (для друзей — позже через TestFlight или App Store).

## Что уже готово

- `PraviloApp.swift` — тонкая SwiftUI/WKWebView-обёртка над текущим сайтом `https://alexeyvozniak.github.io/moi-normy/`.
- Обёртка перехватывает изменения `localStorage['pravilo_v1']` и копирует только состояние «Правила» в общий App Group.
- `PraviloWidget.swift` — маленький и средний WidgetKit-виджет: активные нормы, нормы с долгом, закрыто сегодня.
- Оба target используют App Group `group.github.alexeyvozniak.pravilo`.

## Как собрать в Xcode

1. Создай iOS App target с именем `Pravilo` (SwiftUI, Swift).
2. Добавь `PraviloApp.swift` в target приложения.
3. Добавь Widget Extension с именем `PraviloWidget`.
4. Добавь `PraviloWidget.swift` только в target виджета.
5. Для обоих targets включи Signing & Capabilities → App Groups → `group.github.alexeyvozniak.pravilo`.
6. При желании используй приложенные `.entitlements` как образец.
7. Собери приложение на iPhone. После первого открытия нативного «Правила» виджет начнёт получать его состояние.
8. На iPhone: удержание на домашнем экране → Добавить виджет → `Правило`.

## Про данные

Никакие данные не отправляются на сервер этим кодом. Состояние копируется локально из WKWebView в `UserDefaults` общего App Group, доступного только приложению и его виджету.

## Ограничение текущей PWA

Существующая версия, добавленная из Safari через «На экран Домой», остаётся самостоятельной и продолжает работать как раньше. Её `localStorage` не разделяется с отдельным нативным приложением. Поэтому живой системный WidgetKit-виджет работает вместе с нативной обёрткой, а не напрямую с Safari-PWA.
