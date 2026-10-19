# Glossary Map

## Contexts

- [Farm](./ux/laws/glossary.md): the counts and identities a screen shows (Born, Alive, Owed…), each defined as entity · population · time · scope
- [Design workflow](./docs/design-workflow/GLOSSARY.md): how screens are designed, checked and handed off (atlas, feature, screen, status, frozen)
- [Data sync](./features/data-sync/GLOSSARY.md): the task, operation and ordering terms used by saved work on one phone

## Relationships

- **Design workflow → Farm**: a screen's copy uses the farm glossary's terms; a number whose meaning differs from its label's definition is a bug in the screen.
- **All contexts → the string registry** (`ux/laws/strings.json`): every visible string is defined once there, with its Chinese, and referenced by id.
- **Farm → Data sync**: a business task supplies the work scope; data sync tracks each saved operation and the prerequisites for sending it.
