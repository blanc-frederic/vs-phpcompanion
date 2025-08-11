const PhpParser = require('php-parser');
const { CodeAction, CodeActionKind, Position, workspace, WorkspaceEdit, window } = require('vscode');
const { ask } = require('./interact');

function isPartOfAssignment(node, startOffset, endOffset) {
    if (
        node.kind === 'assign'
        && node.left.loc
        && node.left.loc.end.offset <= startOffset
        && node.right.loc
        && node.right.loc.start.offset >= startOffset
    ) {
        return true;
    }

    if (node.loc && node.loc.start.offset > endOffset) {
        return false;
    }

    for (const key in node) {
        const child = node[key];
        if (Array.isArray(child)) {
            for (const c of child) {
                if (c && typeof c === 'object') {
                    const result = isPartOfAssignment(c, startOffset, endOffset);
                    if (result) return result;
                }
            }
        } else if (child && typeof child === 'object') {
            const result = isPartOfAssignment(child, startOffset, endOffset);
            if (result) return result;
        }
    }

    return false;
}

function findEnclosingMethod(node, startOffset, endOffset) {
    if (
        node.kind === 'method'
        && node.loc
        && node.loc.start.offset <= startOffset
        && node.loc.end.offset >= endOffset
    ) {
        return node;
    }

    if (node.loc && node.loc.start.offset > endOffset) {
        return null;
    }

    for (const key in node) {
        const child = node[key];
        if (Array.isArray(child)) {
            for (const c of child) {
                if (c && typeof c === 'object') {
                    const result = findEnclosingMethod(c, startOffset, endOffset);
                    if (result) return result;
                }
            }
        } else if (child && typeof child === 'object') {
            const result = findEnclosingMethod(child, startOffset, endOffset);
            if (result) return result;
        }
    }

    return null;
}

function walkChild(node, callbackfn) {
    if (node.kind) callbackfn(node);

    for (const key in node) {
        const child = node[key];
        if (Array.isArray(child)) {
            for(const item of child) walkChild(item, callbackfn);
        } else if (child && typeof child === 'object') walkChild(child, callbackfn);
    }
}

function usedVariables(node, offset = 0) {
    let names = [];

    walkChild(node, (child) => {
        if (
            child.kind === 'variable'
            && typeof child.name === 'string'
            && child.name !== 'this'
            && child.loc && child.loc.start.offset > offset
            && ! names.includes(child.name)
        ) {
            names.push(child.name);
        }
    });

    return names;
}

function assignedVariables(node, offsetMax = 0) {
    let names = [];

    walkChild(node, (child) => {
        if (offsetMax > 0 && child.loc && child.loc.end.offset > offsetMax) {
            return
        }

        let vars = [];

        if (child.kind === 'parameter') {
            vars.push(child.name);
        } else if (["assign", "assignop", "assignref"].includes(child.kind)) {
            if (child.left?.kind === 'variable') {
                vars.push(child.left);
            } else if (child.left.kind === "list") {
                child.left.items.forEach((item) => { vars.push(item.value); });
            } else if (child.left.kind === "array") {
                child.left.items.forEach((item) => { vars.push(item); });
            }
        } else if (child.kind === 'post' || child.kind === 'pre') {
            vars.push(child.what);
        }

        for(const variable of vars) {
            if (
                variable
                && (variable.kind === 'variable' || variable.kind === 'identifier')
                && typeof variable.name === 'string'
                && ! names.includes(variable.name)
            ) {
                names.push(variable.name);
            }
        }
    });

    return names;
}

function getEditorIndent(document) {
    let insertSpaces = true;
    let tabSize = 4;

    const editor = window.visibleTextEditors.find(e =>
        e.document.uri.toString() === document.uri.toString()
    );
    if (editor) {
        insertSpaces = window.activeTextEditor.options.insertSpaces;
        tabSize = window.activeTextEditor.options.tabSize;
    } else {
        const config = workspace.getConfiguration('editor', { languageId: 'php' });
        insertSpaces = config.get('insertSpaces', true);
        tabSize = config.get('tabSize', 4);
    }

    if (insertSpaces) {
        return ' '.repeat(Number(tabSize));
    }
    return '\t';
}

function extractMethod(document, range) {
    if (!document || !range) {
        if (! window.activeTextEditor) {
            return;
        }
        document = window.activeTextEditor.document;
        range = window.activeTextEditor.selection;
    }

    if (range.isEmpty) return;

    const parser = new PhpParser.Engine({ ast: { withPositions: true } });
    const selectionStart = document.offsetAt(range.start);
    const selectionEnd = document.offsetAt(range.end);

    const enclosingMethod = findEnclosingMethod(
        parser.parseCode(document.getText()),
        selectionStart,
        selectionEnd
    );
    if (!enclosingMethod) {
        window.showErrorMessage('Unable to locate parent method');
        return;
    }

    const selectedText = document.getText(range).trim();
    const selectedAst = parser.parseCode('<?php ' + selectedText);
    const assignedInSelection = assignedVariables(selectedAst);
    const assignedBefore = assignedVariables(enclosingMethod, selectionStart);
    const paramList = usedVariables(selectedAst)
        .filter(v => assignedBefore.includes(v));
    const returnVariables = usedVariables(enclosingMethod, selectionEnd)
        .filter(v => assignedInSelection.includes(v));

    nodeAssign = isPartOfAssignment(enclosingMethod, selectionStart, selectionEnd);
    if (nodeAssign && returnVariables.length > 0) {
        window.showErrorMessage('Unsafe refactoring : more than one returned variable in assignment');
        return;
    }

    ask('Method name').then(async (name) => {
        if (name === undefined || name.length < 1) {
            return
        }

        const insertPos = new Position(enclosingMethod.loc.end.line, 0);

        const edit = new WorkspaceEdit();
        edit.insert(
            document.uri,
            insertPos,
            getMethodDefinition(name, paramList, returnVariables, getEditorIndent(document), selectedText, nodeAssign)
        );
        edit.replace(document.uri, range, getMethodCall(name, paramList, returnVariables));
        await workspace.applyEdit(edit);
    })
}

function mergeVariables(variables) {
    return variables.map(v => '$' + v).join(', ');
}

function getMethodCall(name, params, returnVariables) {
    let assign = '';
    if (returnVariables.length === 1) {
        assign = `$${returnVariables[0]} = `;
    } else if (returnVariables.length > 1) {
        assign = '[' + mergeVariables(returnVariables) + '] = ';
    }

    return assign + '$this->' + name + '(' + mergeVariables(params) + ');';
}

function getMethodDefinition(name, params, returnVariables, indent, body, assign) {
    const newLine = `\n${indent}`;
    const paramList = mergeVariables(params);
    const signature = `private function ${name}(${paramList})`;

    let returnType = `: void${newLine}`;
    let prefix = '';
    let returnStmt = '';
    if (assign) {
        returnType = ' ';
        prefix = 'return ';
    } else if (returnVariables.length === 1) {
        returnType = ' ';
        returnStmt = `${newLine}${indent}return $${returnVariables[0]};`;
    } else if (returnVariables.length > 1) {
        returnType = `: array${newLine}`;
        const returnList = mergeVariables(returnVariables);
        returnStmt = `${newLine}${indent}return [${returnList}];`;
    }

    return `${newLine}${signature}${returnType}{${newLine}${indent}${prefix}${body}${returnStmt}${newLine}}\n`;
}

class ExtractMethodProvider {
  static providedCodeActionKinds = [
    CodeActionKind.RefactorExtract
  ];

  provideCodeActions(document, range, context, token) {
    if (range.isEmpty) return;

    const action = new CodeAction("Extract to method", CodeActionKind.RefactorExtract);

    action.command = {
      title: "Extract to method",
      command: "phpcompanion.extractMethod",
      arguments: [document, range]
    };

    return [action];
  }
}

exports.extractMethod = extractMethod;
exports.ExtractMethodProvider = ExtractMethodProvider;
