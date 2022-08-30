PHP Companion
=============

This extension allows to easily create new PHP class, run test, insert namespace, etc.

Features
--------

* Create PHP class file content
* Read Namespace from composer.json
* Insert namespace for a file
* Add extends PHPUnit TestCase to classes wich names ends with "Test"
* Declare an interface if name ends with "Interface"
* Optionnally add extends Symfony Command to classes wich names ends with "Command"
* Add command and Keybindings to easily run tests
* Open tests logs in a virtual document

Create new PHP files
--------------------

From explorer, right click on a folder and select "New PHP Class"

![New PHP Class screenshot](https://raw.githubusercontent.com/blanc-frederic/vs-phpcompanion/main/resources/new_php_class.png)

See [FAQ](https://github.com/blanc-frederic/vs-phpcompanion/blob/main/FAQ.md) to read more about generated namespace

Insert namespace in PHP files
-----------------------------

Select text or move cursor to the desired position and right click, then choose "Insert namespace" menu item

![Insert namespace screenshot](https://raw.githubusercontent.com/blanc-frederic/vs-phpcompanion/main/resources/insert_namespace.png)

Snippets
--------

Type ```con``` to generate class constructor :

```php
public function __construct(Type $param)
{
    $this->param = $param;
}
```

Type ```prop``` to generate class property :

```php
private Type $;
```

Type ```fun``` to generate class method :

```php
public function functionName(Type $param): void
{
    
}
```

Type ```cop``` to generate class constructor with property (php >= 8.0 required) :

```php
public function __construct(
    private Type $param
) {
    
}
```

Easily run tests
----------------

Hit F9 (default keybindings) or select the command to run tests

![commands screenshot](https://raw.githubusercontent.com/blanc-frederic/vs-phpcompanion/main/resources/commands.png)

Tests will be executed, and results will be shown in statusbar

![Status bar screenshot](https://raw.githubusercontent.com/blanc-frederic/vs-phpcompanion/main/resources/status_bar.png)

Click "Open tests logs" and see what happened

![Tests logs screenshot](https://raw.githubusercontent.com/blanc-frederic/vs-phpcompanion/main/resources/open_logs.png)
