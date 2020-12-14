PHP Companion
=============

This extension generate code (php >=7.4) for classes, interfaces and traits

Editor context menu
-------------------

Only for PHP files : select text, or position cursor, and choose "Insert namespace" to generate and insert namespace for current file

Explorer context menu
---------------------

Select "new PHP Class", "new PHP Interface" or "new PHP trait" directly from explorer context menu. You will be prompted for the name

Commands
--------

Corresponding commands exists to create new file, you will be prompted for parent folder, then item name : 

- `new PHP Class`
- `new PHP Interface`
- `new PHP Trait`

Commands also exists for inserting namespace or generate class, interface or trait code, **in current editor** :

- `Insert namespace`
- `Generate code for PHP Class`
- `Generate code for PHP Interface`
- `Generate code for PHP Trait`

Configuration
-------------

```json
// Path to composer.json from workspace rootdir
"phpcompanion.composerJson": "composer.json",

// Specifies default vendor if not extracted from composer.json
"phpcompanion.vendor": null,

// Extends PHPUnit TestCase for generated classes with "Test" suffix
"phpcompanion.detectTestCase": true,
```

> Tip : use `File > Preferences > Settings`, and choose `Workspace` to specify a value decicated for current workspace only
