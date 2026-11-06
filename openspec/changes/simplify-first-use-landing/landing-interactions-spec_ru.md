# Spec Delta

Канонические сценарии: [landing-interactions](specs/landing-interactions/spec.md).

## MODIFIED Requirements

### Requirement: Consistent custom selection
Пресеты SHALL сохранить доступные имена, клавиатуру, Escape/outside dismissal и границы экрана. Подсказки среды не дают возможностей. Команды установки читаются без JS/select. Выбор не скачивает пресет сам; языковая подсказка не выдумывается.

## ADDED Requirements

### Requirement: Independent home and preset initialization
Копирование SHALL работать без формы на главной; обработчики пресета подключаются только при наличии формы. Обе страницы не дают ошибок и сообщают локализованный статус. Исправленные параметры валидируются и скачиваются локально без отправки.
