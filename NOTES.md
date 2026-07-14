# Notes

## Decisions

- Migrated the project to TypeScript while preserving the original runtime behavior.
- Used MongoDB `$inc` to increment the URL visit counter atomically and avoid race conditions.
- Added declaration files for third-party packages without TypeScript support.
- Kept the existing project structure as requested.
- Introduced a service layer to encapsulate business logic and keep controllers lightweight. 
- Added a database layer to centralize database access and improve separation of concerns.

## Trade-offs

- Used type assertions (`as`) only when required to preserve the original logic and runtime behavior during the TypeScript migration.
- One example is the dynamic route registration, where `koa-router` overloads could not infer the middleware order correctly.
- Created local declaration files for legacy packages instead of adding unofficial type packages.

## Improvements

Given more time, I would:

- Improve some custom type declarations.
- Reduce the remaining type assertions by redesigning parts of the router registration.
