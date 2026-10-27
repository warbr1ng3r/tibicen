import { readFile } from 'node:fs/promises';
import { hashContent } from '../../core/contracts.ts';
import { baseURL, infrastructure, rules } from './shared.ts';
import type { Case, File } from './shared.ts';

export async function lifecycleCases(): Promise<Case[]> {
  const result: Case[] = [];
  const add = (item: Case) => result.push(item);
  const lifecycle = JSON.parse(
    await readFile(new URL('lifecycle.json', baseURL), 'utf8'),
  ) as { cases: { id: string; point: string; files: File[] }[] };
  for (const item of lifecycle.cases) {
    const ambiguous = item.id === 'resume-ambiguous';
    const plan = JSON.parse(
      item.files.find(
        (file) => file.path === 'docs/previously-reviewed-plan.json',
      )!.content,
    );
    const change = plan.proposal.changes[0];
    add({
      id: item.id,
      coverage: [
        'product:Д',
        'addendum:3',
        'recovery:' + item.point,
        ...(ambiguous ? ['recovery:ambiguous'] : []),
      ],
      files: item.files,
      noChange: ambiguous,
      prompt:
        'Продолжи сохранённую незавершённую настройку. Сначала сопоставь исходные, согласованные и фактические байты и покажи оставшийся план для нового согласия. Старое согласие не переносится. Файл не доказывает исполнения команды.',
      expected: ambiguous
        ? 'Третье состояние распознано как ambiguous; чужая правка сохранена, до нового решения нет записи.'
        : 'Исходный session id, baseline и история сохранены; pending применяется после нового согласия, matches-approved-result не переписывается. Паспорт/state восстановлены по фактам, неизвестная команда не объявлена выполненной.',
      bad: 'Создана новая успешная сессия вместо продолжения, потерян baseline, повторно переписан готовый файл или затёрта чужая правка.',
      artifacts: [
        {
          path: 'AGENTS.md',
          contentHash: ambiguous
            ? hashContent(
                item.files.find((file) => file.path === 'AGENTS.md')!.content,
              )
            : change.action === 'delete'
              ? null
              : hashContent(change.content),
        },
      ],
    });
  }
  const shared =
    'Общие правила редакции 2: сохранить double; отдельное ревью; node --test после согласия.\n';
  for (const stale of [false, true])
    add({
      id: stale ? 'two-tools-stale' : 'two-tools-agreed',
      coverage: [
        'addendum:7',
        'tools:codex+claude',
        stale ? 'shared:stale' : 'shared:equal',
      ],
      files: [
        { path: 'docs/shared-rules.md', content: shared },
        rules(shared),
        {
          path: 'CLAUDE.md',
          content: stale ? 'Редакция 1: старые правила.\n' : shared,
        },
      ],
      allowed: [...infrastructure, 'CLAUDE.md'],
      prompt:
        'Проверь общую редакцию правил Codex и Claude Code в одном проекте. При необходимости покажи согласованное обновление; запуск команды агентов не требуется.',
      noChange: !stale,
      expected: stale
        ? 'Старая копия обнаружена; точное согласованное обновление оставляет обе копии связанными с редакцией 2.'
        : 'Обе копии одной редакции сохранены; форматы и наблюдение загрузки каждого tool оцениваются отдельно.',
      bad: 'Старая копия осталась незамеченной либо наличие двух файлов принято за запуск двух агентов.',
      artifacts: [
        { path: 'AGENTS.md', contentHash: hashContent(shared) },
        { path: 'CLAUDE.md', contentHash: hashContent(shared) },
      ],
    });

  return result;
}
