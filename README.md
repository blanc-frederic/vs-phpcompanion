PHP Companion
=============

This extension allows to easily create new PHP class, run test, insert namespace, etc.

Features
--------

* Create PHP class file content
* Read Namespace from composer.json
* Insert namespace for a file
* Add extends PHPUnit TestCase to classes wich names ends by "Test"
* Add command and Keybindings to easily run tests
* Open tests logs in a virtual document

Create new PHP files
--------------------

From explorer, right click on a folder and select "New PHP Class"

![New PHP Class screenshot](./resources/new_php_class.png)

See [FAQ](./FAQ.md) to read more about generated namespace

Insert namespace in PHP files
-----------------------------

Select text or move cursor to the desired position and right click, then choose "Insert namespace" menu item

![Insert namespace screenshot](./resources/insert_namespace.png)

Easily run tests
----------------

Hit F9 (default keybindings) or select the command to run tests

![commands screenshot](./resources/commands.png)

Tests will be executed, and results will be shown in statusbar

![Status bar screenshot](./resources/status_bar.png)

Click "Open tests logs" and see what happened

![Tests logs screenshot](./resources/open_logs.png)

Configuration
-------------

Tip : use `File > Preferences > Settings`, and choose `Workspace` to specify a value decicated for current workspace only

```json
// Add "New PHP class" command and menu in explorer menu
"phpcompanion.activate.createPHPFile": true,

// Add "Insert namespace" command and menu for PHP files
"phpcompanion.activate.insertNamespace": true,

// Path to composer.json from workspace rootdir
"phpcompanion.composerJson": "composer.json",

// Specifies default vendor if not found in composer.json
"phpcompanion.vendor": null,

// Auto extends PHPUnit TestCase for generated classes with "Test" suffix
"phpcompanion.detectTestCase": true,

// Add "Run tests" commands and statusbar
"phpcompanion.activate.runTests": true,

// Command line to run tests (ex: "vendor/bin/phpunit", "bin/phpunit" or "phpunit")
"phpcompanion.testsCommand": "vendor/bin/phpunit",

// Arguments for tests command line
"phpcompanion.testsCommandArguments": [
    "--colors=never",
    "--verbose"
]
```
