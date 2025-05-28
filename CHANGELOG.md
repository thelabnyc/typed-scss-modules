# Changelog

## v8.1.1 (2025-01-11)

### Fix

- upgrade bundle require

## v8.1.0 (2025-01-01)

### Feat

- add --allowArbitraryExtensions option (compatible with the TS 5.0 feature of the same name)

## v8.0.1 (2024-03-23)

### Fix

- resolve Prettier config based on generated file

## v8.0.0 (2023-11-25)

### BREAKING CHANGE

- upgrade minimum node version to 16

## v7.1.4 (2023-08-06)

### Fix

- clear out old types for empty files

## v7.1.3 (2023-08-05)

### Fix

- **updateStaleOnly**: compare file contents

## v7.1.2 (2023-07-23)

### Fix

- **list-different**: respect ignore option

## v7.1.1 (2023-06-18)

### Fix

- export the named types as declared

## v7.1.0 (2023-03-14)

### Feat

- **node-sass**: support 8.x as a peer dependency

## v7.0.2 (2023-01-10)

### Fix

- restore number camel-casing behavior changed in MR 161

## v7.0.1 (2022-09-29)

### Fix

- handle single nameFormat without array literal

## v7.0.0 (2022-09-14)

### BREAKING CHANGE

- Upgrade the minimum node-sass version to 7 to support latest the Node versions

## v6.6.0 (2022-09-13)

### Feat

- perform sanity check in watch mode

## v6.5.0 (2022-06-03)

### Feat

- **file-to-class-names**: adds support for multiple name formatters

### Fix

- improves even further by removing the unnecessary `NameFormatInput` type
- improves types used to avoid casting
- improve types to be more maintainable
- refactor code to match expectations as nameFormat becomes an array

## v6.4.1 (2022-05-10)

### Fix

- cli accepts 'snake' name format option

## v6.4.0 (2022-05-01)

### Feat

- add snake class name transformer

### Fix

- add updated yarn.lock

## v6.3.0 (2022-04-27)

### Feat

- export main as tsm

## v6.2.1 (2022-04-25)

### Fix

- alias and aliasPrefixes in config file

## v6.2.0 (2022-02-16)

### Feat

- add additionalData

## v6.1.0 (2022-02-16)

### Feat

- add outputFolder

## v6.0.0 (2022-02-14)

### BREAKING CHANGE

- sass updated to 1.49.7 and node-sass updated to 4.12.0

## v5.1.1 (2022-02-13)

### Fix

- remove extra logging

## v5.1.0 (2022-02-13)

### Feat

- add config file with custom importer support

### Refactor

- move defaults out so options properly merge

## v5.0.0 (2022-01-31)

### BREAKING CHANGE

- this package's bin (CLI) name was changed from 'tsm' to 'typed-scss-modules'.

### Fix

- update bin

## v4.1.3 (2022-01-31)

### Fix

- update bin

## v4.1.2 (2022-01-02)

### Fix

- **list-different**: raise error if no type file

### Refactor

- **list-diffrent**: early return

## v4.1.1 (2021-03-21)

### Fix

- **banner**: fix banner formatting

## v4.1.0 (2021-02-21)

### Feat

- **composition**: fix unit tests
- **composition**: path fetcher should return an object, not an array
- **composition**: support for composes: class from 'filename'

## v4.0.0 (2021-02-05)

### BREAKING CHANGE

- when using exportType default, the output will now have a semicolon after the type

### Fix

- **formatting**: add missing semicolon after type

## v3.4.1 (2021-01-10)

### Fix

- fix --updateStaleOnly issue where new files cause crash

## v3.4.0 (2020-11-19)

### Feat

- add update option to prevent unnecessary file updates

## v3.3.0 (2020-10-27)

### Feat

- add ability to delete old .d.ts files for \*.scss files

### Fix

- remove an extra message from alert

## v3.2.2 (2020-10-14)

### Fix

- **list-different**: handle prettier formatting

## v3.2.1 (2020-10-10)

### Fix

- addresses CRLF vs LF issue on windows

## v3.2.0 (2020-10-07)

### Feat

- **banner**: example updated
- **banner-required**: ensuring build works
- **banner**: add documentation to README
- **banner**: testing support

## v3.1.0 (2020-09-14)

### Feat

- use prettier to format files before save if available

### Refactor

- use spread operator for new object

## v3.0.0 (2020-08-25)

### BREAKING CHANGE

- re-releasing as a major since previous changes were breaking

### Fix

- **docs**: formatting

## v2.1.0 (2020-08-25)

### Feat

- sort class names

## v2.0.1 (2020-07-17)

### Fix

- **docs**: fix logLevel options alias

## v2.0.0 (2020-07-06)

### BREAKING CHANGE

- this can interfere with how others use their default exported classnames

### Fix

- **export-default**: export a type instead of an interface Fixes #71

## v1.4.0 (2020-07-02)

### Feat

- **loglevel**: implement logLevel option

### Fix

- **prettier**: readme formatting
- **loglevel**: fix code according to PR comments
- **cli**: fix option alias conflict

## v1.3.0 (2020-04-07)

### Feat

- **cli**: add augmenting options exportTypeName/exportTypeInterface

## v1.2.0 (2020-02-21)

### Feat

- **quotetype**: implement the quoteType option
- **quotetype**: implement the quoteType option

## v1.1.0 (2020-01-19)

### Feat

- **sass**: add dart-sass support

## v1.0.1 (2019-12-08)

### Fix

- **deps**: upgrade deps and fix breaking change

## v1.0.0 (2019-12-08)

### Feat

- **releases**: setup automated releases
- **ignore**: implement the ignore option
- **option**: allow to ignore initial build in watch
- **types**: add Styles and ClassNames types when using default export
- **list-different**: add list-different functionality
- **watch**: add support for watching files
- **export-type**: add support for default export types
- **cli**: add -i as an alias for --includePaths
- **cli**: add better example
- **directories**: support directories as well as globs
- **cli**: add local runner helper and better UX for CLI
- **glob**: allow passing a glob pattern
- **writing**: add basics for writing out type defs
- **casing**: add support for transforming classnames
- **cli**: add basic cli parsing

### Fix

- **travis**: node version
- **yarn**: add missing yarn.lock entry
- **dependencies**: move some dev deps to dependencies
- **types**: add types for reserved-words package
- **fs**: remove fs
- **classname**: only pass the classname when invoking map
- **cli**: fix CLI name, path and execution
- **glob**: fix glob patterns and remove ignore

### Refactor

- **main**: move much of logic to isolated files in lib/core
- **sass**: update the file parsing
