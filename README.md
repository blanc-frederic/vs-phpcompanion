PHP Companion
=============

This extension generate code (php >=7.4) for classes, interfaces and traits

Editor context menu
-------------------

Only for PHP files : select text, or position cursor, and choose "Insert namespace" to generate and insert namespace for current file

Explorer context menu
---------------------

Select "new PHP Class" directly from explorer context menu. You will be prompted for the name

Commands
--------

Corresponding commands exists to create new file, you will be prompted for parent folder, then item name : `new PHP Class`

Commands also exists for inserting namespace **in current editor** only in PHP file: `Insert namespace`

Configuration
-------------

```json
// Path to composer.json from workspace rootdir
"phpcompanion.composerJson": "composer.json",

// Specifies default vendor if not found in composer.json
"phpcompanion.vendor": null,

// Auto extends PHPUnit TestCase for generated classes with "Test" suffix
"phpcompanion.detectTestCase": true,
```

> Tip : use `File > Preferences > Settings`, and choose `Workspace` to specify a value decicated for current workspace only

FAQ
---

> How does it detects namespace ?

First, it search for a vendor prefix (stop as soon as one matches) :

1. compare relative filename (from workspace) with composer entries from `autoload/psr-4`
2. compare relative filename (from workspace) with composer entries from `autoload-dev/psr-4`
3. phpcompanion.vendor (if set)

Then, append relative path (from workspace root folder) :

- if vendor prefix was extracted from composer, exclude corresponding path prefix from composer
- else if path starts with `src/` or `tests/`, exclude this prefix from path
- else if `phpcompanion.vendor` is set and path starts with `app/`, exclude this prefix from path

> Why no "new PHP Trait" or "new PHP Interface" ?

It was in the first release, but it made the contextual menu and the commands bigger, whereas you just have to change the keyword "class" by "trait" or "interface".
