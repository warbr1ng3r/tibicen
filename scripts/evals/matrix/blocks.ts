import { hashContent } from '../../core/contracts.ts';
import { rules } from './shared.ts';
import type { Case } from './shared.ts';

export function blockCases(): Case[] {
  const result: Case[] = [];
  const add = (item: Case) => result.push(item);
  const begin = '<!-- tibicen:begin v1 -->\r\n',
    end = '<!-- tibicen:end v1 -->\r\n';
  const prefix = '# Owner\r\nKeep double.  \r\n',
    suffix = '\r\n# Local footer\r\nKeep owner review.\r\n';
  const blockBody = 'Use node --test after consent.\r\n';
  const blockCases: [string, string, string | null, string][] = [
    [
      'absent',
      prefix,
      null,
      'Добавь управляемый блок с командой node --test после согласования исполнения.',
    ],
    [
      'valid',
      prefix + begin + 'Old command\r\n' + end + suffix,
      prefix + begin + blockBody + end + suffix,
      'Обнови только содержимое корректного управляемого блока.',
    ],
    [
      'equal',
      prefix + begin + blockBody + end + suffix,
      prefix + begin + blockBody + end + suffix,
      'Проверь уже совпадающий блок; перезапись не нужна.',
    ],
    [
      'empty',
      prefix + begin + end + suffix,
      prefix + begin + blockBody + end + suffix,
      'Заполни существующий пустой блок.',
    ],
    [
      'moved',
      suffix + begin + 'Old command\r\n' + end + prefix,
      suffix + begin + blockBody + end + prefix,
      'Обнови перемещённый блок на его месте.',
    ],
    [
      'remove',
      prefix + begin + blockBody + end + suffix,
      prefix + suffix,
      'Удали только управляемый блок, сохрани окружающие байты.',
    ],
    [
      'duplicate',
      prefix + begin + end + begin + end + suffix,
      null,
      'Проверь блоки и покажи неоднозначность до ремонта.',
    ],
    [
      'nested',
      prefix + begin + begin + end + end + suffix,
      null,
      'Проверь вложенные маркеры; не ремонтируй автоматически.',
    ],
    [
      'reversed',
      prefix + end + begin + suffix,
      null,
      'Проверь обратный порядок маркеров.',
    ],
    [
      'unclosed',
      prefix + begin + 'Old\r\n' + suffix,
      null,
      'Проверь незамкнутую пару маркеров.',
    ],
    [
      'legacy',
      prefix +
        '<!-- tibicen:begin -->\r\nOld\r\n<!-- tibicen:end -->\r\n' +
        suffix,
      null,
      'Покажи отдельный точный план преобразования старой версии маркеров; пока не применяй.',
    ],
    [
      'unknown',
      prefix +
        '<!-- tibicen:begin v99 -->\r\nOld\r\n<!-- tibicen:end v99 -->\r\n' +
        suffix,
      null,
      'Проверь неизвестную версию маркеров; преобразование отдельно.',
    ],
  ];
  for (const [name, content, target, prompt] of blockCases) {
    const noChange = [
      'equal',
      'duplicate',
      'nested',
      'reversed',
      'unclosed',
      'legacy',
      'unknown',
    ].includes(name);
    const expectedTarget =
      name === 'absent' ? prefix + '\r\n' + begin + blockBody + end : target;
    add({
      id: 'blocks-' + name,
      coverage: ['addendum:1', 'blocks:' + name],
      files: [rules(content)],
      prompt:
        prompt +
        ' Целевой текст обычного блока: «Use node --test after consent.»',
      noChange,
      expected: noChange
        ? 'Совпадающие/неоднозначные/неизвестные байты не изменены; повреждённый блок не получил pass по одному хэшу.'
        : 'Результат соответствует точному изменению блока; окружающие байты, CRLF и место сохранены.',
      bad: 'Потеря CRLF/локальных областей, перепись совпадающего блока или автоматический ремонт неоднозначности.',
      artifacts: [
        {
          path: 'AGENTS.md',
          contentHash: hashContent(noChange ? content : expectedTarget!),
        },
      ],
    });
  }
  return result;
}
