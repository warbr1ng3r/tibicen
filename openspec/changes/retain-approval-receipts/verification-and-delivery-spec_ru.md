# Verification and delivery specification (_ru)

Канонический текст: [spec.md](specs/verification-and-delivery/spec.md).

## ADDED Requirements

### Requirement: Approval consumption retains source-bound receipts

Когда `apply` или `resume` проходит гейт digest и сохраняет сессию, CLI SHALL
сохранять и показывать структурированную запись с точным digest компилированного
плана, предъявленным digest, операцией, каналом, корнем проекта, ID сессии и
временем. Запись SHALL оставаться свидетельством содержимого и канала,
никогда не аутентификацией внешнего согласующего.

#### Scenario: A valid exact external grant is consumed

- **WHEN** предъявленный apply/resume digest совпадает с точным планом
- **THEN** запись содержит digest, операцию, канал, корень, ID сессии и время
- **AND** результат apply/resume, `status`, `report` и сводка паспорта показывают её

#### Scenario: The executor presents a different digest from the plan it applies

- **WHEN** предъявленный digest отличается от digest предлагаемого плана
- **THEN** применение отказывает, называя предъявленный и требуемый digest
- **AND** контроллер может сопоставить собственное согласие с этой записью

#### Scenario: Consent is refused

- **WHEN** digest не совпадает при наличии или отсутствии сохранённой работы
- **THEN** отказ находится в конверте ошибки
- **AND** проект, включая сохранённый state, остаётся побайтно неизменным
- **AND** запись называет ID сохранённой сессии при наличии state либо когда
  resume выбирает сохранённую работу из паспорта без временного state
- **AND** новый apply без state SHALL не приписывать отказ прошлой завершённой
  сессии паспорта

#### Scenario: A session saved before receipts existed resumes

- **WHEN** старый state или сводка паспорта не содержат записей
- **THEN** они остаются читаемыми и допускают resume с новым согласием
- **AND** новые записи добавляются к сохранённой истории

#### Scenario: Receipt integrity

- **WHEN** журнал сохранённой сессии структурно повреждён
- **THEN** загрузка явно отказывает
- **AND** сохраняются не более восьми записей; более длинный список или
  сохранённый отказ даёт `tamper-suspect`, поскольку продукт не пишет отказы

#### Scenario: Invalid caller channel cannot create unreadable state

- **WHEN** входной канал apply/resume отличается от `cli --approve` и `programmatic`
- **THEN** вызов SHALL дать `invalid-approval-channel` до записи
- **AND** неверный ввод SHALL не создавать нечитаемый журнал

#### Scenario: Consumed evidence has consistent ownership and digests

- **WHEN** журнал читается из state или любой сессии паспорта
- **THEN** каждая запись SHALL иметь равные не-null строковые 64-hex digest,
  точный ID владельца-сессии, поддержанный канал и абсолютный сохранённый корень
- **AND** повреждённый журнал паспорта SHALL отказывать до показа/наследования
- **AND** последняя активная запись SHALL совпадать с текущим корнем/digest;
  предыдущие могут описывать прежние согласованные планы и корни

#### Scenario: A legacy state belongs to a different session from the last manifest entry

- **WHEN** legacy-state без записей продолжается, а последняя запись паспорта
  принадлежит другой сессии
- **THEN** apply, status и report SHALL не приписывать её согласия текущей сессии
- **AND** fallback SHALL выбирать только совпадающий ID сессии

#### Scenario: A project with historical receipts moves to a new root

- **WHEN** проект скопирован/перенесён и история содержит старые абсолютные
  корни, включая пути другой ОС
- **THEN** status и создание нового предложения SHALL сохранять историю читаемой
- **AND** отдельно согласованный stateless resume SHALL сохранять ID сессии и
  прежние записи, добавляя запись текущего корня
- **AND** прежний гейт соответствия текущего плана/корня SHALL не изменяться
