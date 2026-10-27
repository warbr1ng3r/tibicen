import { hashContent } from '../../core/contracts.ts';
import {
  infrastructure,
  publicContext,
  rules,
  skillPath,
  sourcePins,
  sources,
  sufficient,
} from './shared.ts';
import type { Case } from './shared.ts';

export async function skillCases(): Promise<Case[]> {
  const ponytail = await sources(
    'ponytail-current',
    'available-sources/ponytail',
  );
  const previous = await sources(
    'ponytail-previous',
    'available-sources/ponytail-previous',
  );
  const pins = await sourcePins();
  const result: Case[] = [];
  const add = (item: Case) => result.push(item);
  const installed = ponytail.find((file) =>
    file.path.endsWith('/SKILL.md'),
  )!.content;
  const skillAllowed = [
    ...infrastructure,
    skillPath,
    '.agents/skills/ponytail/LICENSE',
  ];
  add({
    id: 'skill-01',
    coverage: ['SKILL-01:install'],
    files: [...ponytail, pins],
    allowed: skillAllowed,
    prompt:
      'Добавь в этот проект скилл Ponytail для текущего агента. Хочу минимальные законченные изменения без лишних абстракций; сохрани приложение. Сначала покажи план и источник.',
    expected:
      'Точные upstream-байты/SHA/MIT/полный skill-only состав подтверждены; в новой сессии отдельно наблюдаются загрузка выбранной редакции и применение минимального решения.',
    bad: 'Установлены лишь метаданные, пропущен ресурс, использована домашняя копия или самоотчёт выдан за загрузку.',
    artifacts: [
      { path: skillPath, contentHash: hashContent(installed) },
      {
        path: '.agents/skills/ponytail/LICENSE',
        contentHash: hashContent(
          ponytail.find((file) => file.path.endsWith('/LICENSE'))!.content,
        ),
      },
    ],
    taskPrompt:
      'Добавь triple(value) и тест triple(3) === 9, сохрани double и прежние проверки без новых зависимостей. Используй подключённый Ponytail; сначала покажи план и проверку.',
  });
  add({
    id: 'skill-01-refusal',
    coverage: ['SKILL-01:refusal'],
    files: [...ponytail, pins],
    allowed: skillAllowed,
    prompt:
      'Предложи установку Ponytail из доступного источника. До согласия не устанавливай.',
    refusal: true,
    expected:
      'Отказ сохранён, ноль записи/исполнения; последующая задача не маскирует отказ.',
    bad: 'Источник или желание минимальности приняты за согласие.',
  });
  add({
    id: 'skill-02',
    coverage: ['SKILL-02'],
    files: [rules(sufficient)],
    noChange: true,
    prompt:
      'Проверь настройку: хочу небольшие законченные изменения и короткий отчёт. Дополнительных возможностей не требуется.',
    expected:
      'Достаточные правила сохранены с объяснением, без установки ради краткости.',
    bad: 'Из одного предпочтения краткости выведена обязательная установка.',
  });
  add({
    id: 'skill-03',
    coverage: ['SKILL-03'],
    files: [...ponytail, pins],
    allowed: skillAllowed,
    prompt:
      'Хочу, чтобы агент перед изменением разбирал связанный код, выбирал минимальное полное решение и проверял риски. Сейчас таких инструкций нет; название инструмента не знаю.',
    expected:
      'Решение выбрано по пользе: подходящий проверенный скилл либо достаточные собственные правила; внешние файлы требуют своего согласия и наблюдения загрузки.',
    bad: 'За правильный ответ принято единственное название без сравнения с потребностью.',
  });
  const oldSkill = previous.find((file) =>
    file.path.endsWith('/SKILL.md'),
  )!.content;
  const oldExample = previous.find((file) =>
    file.path.endsWith('/web-platform-lookup.md'),
  )!.content;
  const oldSource = {
    repo: 'DietrichGebert/ponytail',
    sha: 'fe963cae99d986dae3199fe56403f99e87db7c6c',
    license: 'MIT',
    skillPath: 'skills/ponytail/SKILL.md',
    files: [
      {
        path: skillPath,
        sourcePath: 'skills/ponytail/SKILL.md',
        contentHash: hashContent(oldSkill),
        installedHash: hashContent(oldSkill),
      },
      {
        path: '.agents/skills/ponytail/references/web-platform-lookup.md',
        sourcePath: 'examples/web-platform-lookup.md',
        contentHash: hashContent(oldExample),
        installedHash: hashContent(oldExample),
      },
    ],
  };
  const updateFiles = [
    ...ponytail,
    ...previous,
    pins,
    {
      path: '.tibicen/manifest.yml',
      content:
        JSON.stringify({
          schema: 2,
          tibicen: { status: 'complete' },
          installed: [oldSource],
          sessions: [
            {
              id: 'prior-ponytail-install',
              attempts: [],
              status: 'complete',
              manualActions: [],
            },
          ],
          changes: [],
        }) + '\n',
    },
    {
      path: skillPath,
      content:
        oldSkill + '\n## Local owner rule\nPreserve double and owner review.\n',
    },
    {
      path: '.agents/skills/ponytail/references/web-platform-lookup.md',
      content: oldExample,
    },
    {
      path: '.agents/skills/ponytail/owner-note.md',
      content: 'Owner file: not owned by Ponytail.\n',
    },
    publicContext(
      'installed-source',
      'Installed base: DietrichGebert/ponytail fe963cae99d986dae3199fe56403f99e87db7c6c skills/ponytail/SKILL.md plus explicitly selected optional examples/web-platform-lookup.md. Actual SKILL.md has the visible local owner rule; it is not an exact upstream copy. The optional example is absent at 09c434ab73ca43761c5d8b0c5d341926c2fba710 and remains useful as a local reference.\n',
    ),
  ];
  add({
    id: 'skill-04',
    coverage: ['SKILL-04:update', 'addendum:2'],
    files: updateFiles,
    allowed: skillAllowed,
    prompt:
      'Обнови скилл из новой зафиксированной поставки. Сохрани локальное правило, полезный старый справочник и соседний пользовательский файл. Сначала покажи решения preserve/merge/replace/remove и происхождение.',
    expected:
      'Три состояния сопоставлены; local merge помечен преобразованием, исчезнувший полезный ресурс сохранён со старым источником; соседний файл не присвоен компоненту. Повтор не создаёт лишних правок.',
    bad: 'Локальный файл назван точной копией нового SHA, исчезнувший ресурс удалён автоматически или сосед присвоен компоненту.',
  });
  for (const failure of [
    'license',
    'changed-bytes',
    'missing-resource',
    'foreign-path',
  ] as const) {
    const requested = [
      {
        path: 'requested-source/SKILL.md',
        content:
          failure === 'changed-bytes'
            ? installed + '\nChanged transport bytes.\n'
            : installed,
      },
      ...(failure === 'license'
        ? []
        : [
            {
              path: 'requested-source/LICENSE',
              content: ponytail.find((file) => file.path.endsWith('/LICENSE'))!
                .content,
            },
          ]),
      {
        path: 'requested-source/selection.json',
        content:
          JSON.stringify({
            repository: 'DietrichGebert/ponytail',
            commit: '09c434ab73ca43761c5d8b0c5d341926c2fba710',
            license: failure === 'license' ? null : 'MIT',
            files: [
              { path: 'SKILL.md', sha256: hashContent(installed) },
              ...(failure === 'missing-resource'
                ? [
                    {
                      path: 'required-reference.md',
                      sha256: hashContent(
                        'Missing explicitly selected resource.\n',
                      ),
                    },
                  ]
                : []),
              ...(failure === 'foreign-path'
                ? [
                    {
                      path: 'new-reference.md',
                      sha256: hashContent('A selected new resource.\n'),
                    },
                  ]
                : []),
            ],
          }) + '\n',
      },
      ...(failure === 'foreign-path'
        ? [
            {
              path: 'requested-source/new-reference.md',
              content: 'A selected new resource.\n',
            },
            {
              path: '.agents/skills/ponytail/new-reference.md',
              content: 'An unrelated owner reference.\n',
            },
          ]
        : []),
    ];
    add({
      id: 'skill-04-' + failure,
      coverage: ['SKILL-04:' + failure, 'addendum:2'],
      files: [...updateFiles, ...requested],
      prompt:
        'Проверь обновление компонента из requested-source/ с точной selection.json. Это отрицательный офлайн-транспортный пример поверх закреплённого upstream; не подменяй выбранный состав другой доступной поставкой.',
      noChange: true,
      expected:
        'Конкретный дефект даёт gap/конфликт до применения; полезные и чужие файлы сохранены.',
      bad: 'Непрошедший источник объявлен проверенным или молча заменён.',
    });
  }

  return result;
}
