# Spec Delta

## ADDED Requirements

### Requirement: Static hosting preserves the configured base path
Лендинг SHALL работать в корне сайта и под заданным project base: ресурсы, лицензии и preview-навигация остаются внутри этого пути. Конструктор SHALL сохранять локальное скачивание без отправки ответов серверу.

#### Scenario: Project Pages serves the site below a repository path
- **WHEN** сборка размещена под `/repo/`
- **THEN** скрипты, стили, логотип, favicon, лицензия и preview-ссылки доступны под `/repo/`
- **AND** посетитель может выбрать настройки и скачать пресет без ошибок загрузки ресурсов

#### Scenario: Root hosting and local development remain available
- **WHEN** base равен `/` или сайт размещён на собственном домене в корне
- **THEN** ресурсы и навигация разрешаются из корня, без двойных разделителей и обязательного имени репозитория

### Requirement: Landing publication has a separate explicit workflow
Публикация лендинга SHALL запускаться вручную, собирать статический сайт закреплённым окружением и получать origin/base из GitHub Pages. Workflow SHALL закреплять внешние Actions полными SHA и давать права публикации только deployment job; секреты моделей не требуются. Публикация страницы SHALL быть независима от выпуска скиллов; локальные проверки не подтверждают удалённый deployment.

#### Scenario: A maintainer manually runs the Pages workflow
- **WHEN** в выбранном GitHub-репозитории включён Pages Source GitHub Actions и сопровождающий запускает workflow
- **THEN** после успешной сборки и проверок загружается только статическое дерево лендинга и выполняется deployment
- **AND** обычный push или pull request сам по себе не запускает публикацию

#### Scenario: No remote repository is configured yet
- **WHEN** workflow и сайт проверены локально без GitHub remote
- **THEN** документация сообщает готовность локальной подготовки и отсутствие фактического remote run/URL
