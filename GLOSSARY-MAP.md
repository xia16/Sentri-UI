# Glossary Map

## Contexts

- [Farm](./ux/laws/glossary.md): the counts and identities a screen shows (Born, Alive, Owed…), each defined as entity · population · time · scope
- [Design workflow](./docs/design-workflow/GLOSSARY.md): how screens are designed, checked and handed off (atlas, feature, screen, status, frozen)

## Relationships

- **Design workflow → Farm**: a screen's copy uses the farm glossary's terms; a number whose meaning differs from its label's definition is a bug in the screen.
- **Both → the string registry** (`ux/laws/strings.json`): every visible string is defined once there, with its Chinese, and referenced by id.
