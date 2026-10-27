import { readFile } from 'node:fs/promises';
import { assert, hashContent, parseData } from '../../core/contracts.ts';
import type { EvalScenario } from '../contracts.ts';
import type { MechanicalOracle } from '../mechanical.ts';

export type File = EvalScenario['files'][number];
export interface ProcessPlanning {
  specification: string[];
  plan: string[];
  optionalDesign: string | null;
}
export interface Case {
  id: string;
  coverage: string[];
  prompt: string;
  expected: string;
  bad: string;
  files?: File[];
  remove?: string[];
  allowed?: string[];
  taskAllowed?: string[];
  dialogue?: EvalScenario['dialogue'];
  clarification?: string;
  correction?: string;
  refusal?: boolean;
  noChange?: boolean;
  hostile?: boolean;
  process?: boolean;
  planning?: ProcessPlanning;
  artifacts?: NonNullable<MechanicalOracle['setup']['artifacts']>;
  taskPrompt?: string;
  noApplication?: boolean;
}
export const baseURL = new URL('../fixtures/', import.meta.url);
export const infrastructure = [
  'AGENTS.md',
  '.tibicen/manifest.yml',
  '.tibicen/state/session.json',
];
export const skillPath = '.agents/skills/ponytail/SKILL.md';
export const sufficient =
  'Показывай результат, существенные ограничения и проверки коротко. Используй node --test после согласования исполнения. Сохраняй приложение. Предложение → согласие → реализация → проверка.\n';
export const owner =
  'Изменения агентской инфраструктуры проходят обязательное отдельное ревью владельца до применения.\n';
export const rules = (content: string): File => ({
  path: 'AGENTS.md',
  content,
});
export const publicContext = (name: string, content: string): File => ({
  path: 'docs/' + name + '.md',
  content,
});
export async function sources(id: string, target: string): Promise<File[]> {
  const manifest = parseData(
    await readFile(new URL('sources/upstream.json', baseURL), 'utf8'),
  ) as { files: { id: string; path: string; local: string; sha256: string }[] };
  return Promise.all(
    manifest.files
      .filter((file) => file.id === id)
      .map(async (file) => {
        const content = await readFile(
          new URL(`sources/${id}/${file.path}`, baseURL),
          'utf8',
        );
        assert(
          hashContent(content) === file.sha256,
          'changed-eval-source',
          'Frozen upstream bytes changed.',
        );
        return { path: target + '/' + file.path, content };
      }),
  );
}

export async function sourcePins(): Promise<File> {
  return publicContext(
    'available-sources',
    await readFile(new URL('sources/upstream.json', baseURL), 'utf8'),
  );
}

export function workflowOptions(): File {
  return publicContext(
    'workflow-options',
    'Доступные материалы: проектный Markdown-процесс (docs/local-process.md) и OpenSpec 1.14.3 (docs/openspec-package.json). Первый использует уже имеющиеся файлы и node --test; отдельного проверенного адаптера Tibicen у него нет. OpenSpec использует отдельный CLI Node >=20.19.0 и шаблоны spec-driven; ограниченный адаптер Tibicen поддерживает 1.14.3. Доступ агента: только файлы этого проекта и стандартная оболочка; истории вне данного диалога нет.\n',
  );
}

export function localProcess(): File {
  return publicContext(
    'local-process',
    'Предложенный командой файловый процесс: docs/requirements.md хранит принятые требования с id; docs/tasks.md связывает id требования с задачей, статусом и результатом node --test. Стадии: требования → план → отдельное ревью → реализация → проверка. Дополнительный CLI не нужен; связь и статусы проверяются при ревью. Это локальные правила команды, не внешний пакет или готовый адаптер.\n',
  );
}

export async function openSpec(): Promise<File> {
  return {
    path: 'docs/openspec-package.json',
    content: await readFile(new URL('sources/openspec.json', baseURL), 'utf8'),
  };
}
