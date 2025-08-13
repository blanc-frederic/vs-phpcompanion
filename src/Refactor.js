const PhpParser = require('php-parser');
const { CodeAction, CodeActionKind, Position, workspace, WorkspaceEdit, window } = require('vscode');
const { ask } = require('./interact');

function isPartial(node, startOffset, endOffset) {
    if (
        node.kind === 'assign'
        && node.left.loc
        && node.left.loc.end.offset <= startOffset
        && node.right.loc
        && node.right.loc.start.offset >= startOffset
    ) {
        return true;
    }

    if (
        node.kind === 'bin'
        && node.loc
        && node.loc.end.offset >= startOffset
        && node.loc.end.offset > endOffset
        && node.loc.start.offset <= endOffset
        && node.loc.start.offset < startOffset
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
                    const result = isPartial(c, startOffset, endOffset);
                    if (result) return result;
                }
            }
        } else if (child && typeof child === 'object') {
            const result = isPartial(child, startOffset, endOffset);
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

function mergeVariables(variables) {
    return variables.map(v => '$' + v).join(', ');
}

function getMethodCall(name, params, returnVariables, isPart) {
    let assign = '';
    if (returnVariables.length === 1) {
        assign = `$${returnVariables[0]} = `;
    } else if (returnVariables.length > 1) {
        assign = '[' + mergeVariables(returnVariables) + '] = ';
    }

    return assign + '$this->' + name + '(' + mergeVariables(params) + ')' + (isPart ? '' : ';');
}

function getMethodDefinition(name, params, returnVariables, indent, body, isPart) {
    const newLine = `\n${indent}`;
    const paramList = mergeVariables(params);
    const signature = `private function ${name}(${paramList})`;

    let returnType = `: void${newLine}`;
    let prefix = '';
    let returnStmt = '';
    if (isPart) {
        returnType = ' ';
        prefix = 'return ';
        returnStmt = (body.substring(body.length -1) !== ';') ? ';' : '';
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

function findStatement(ast, offsetStart, offsetEnd) {
    let statement = null;
    walkChild(ast, node => {
        if (
            node.loc
            && node.loc.start.offset <= offsetStart
            && node.loc.end.offset >= offsetEnd
            && [
                'expressionstatement',
                'return',
                'if',
                'foreach',
                'for',
                'while',
                'dowhile',
                'switch',
                'throw'
            ].includes(node.kind)
        ) {
            statement = node;
        }
    });
    return statement;
}

function isExtractVariablePossible(text) {
    const forbiddenTokens = [
        'if',
        'else',
        'return',
        'throw',
        'try',
        'catch',
        'finally',
        ';',
        '{',
        '}'
    ];
    const lowered = text.toLowerCase();
    return !forbiddenTokens.some(token => lowered.includes(token));
}

function getIndentation(lineText) {
  const match = lineText.match(/^(\s*)/);
  return match ? match[1] : '';
}

function createRefactorAction(title, command, document, range) {
    const action = new CodeAction(title, CodeActionKind.RefactorExtract);
    action.command = { title: title, command: command, arguments: [document, range] };
    return action;
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
        window.showErrorMessage('Extract method : unable to locate parent method');
        return;
    }

    const selectedText = document.getText(range).trim();
    let selectedAst = null
    try {
        selectedAst = parser.parseCode('<?php ' + selectedText);
    }  catch (e) {
        window.showErrorMessage('Extract method : invalid selection');
        return;
    }

    const assignedInSelection = assignedVariables(selectedAst);
    const assignedBefore = assignedVariables(enclosingMethod, selectionStart);
    const paramList = usedVariables(selectedAst)
        .filter(v => assignedBefore.includes(v));
    const returnVariables = usedVariables(enclosingMethod, selectionEnd)
        .filter(v => assignedInSelection.includes(v));

    const isPart = isPartial(enclosingMethod, selectionStart, selectionEnd);
    if (isPart && returnVariables.length > 0) {
        window.showErrorMessage('Extract method : more than one returned variable in assignment');
        return;
    }
    const endMark = selectedText.substring(selectedText.length -1) === ';'

    ask('Method name').then(async (name) => {
        if (name === undefined || name.length < 1) {
            return
        }

        const insertPos = new Position(enclosingMethod.loc.end.line, 0);

        const edit = new WorkspaceEdit();
        edit.insert(document.uri, insertPos, getMethodDefinition(
            name,
            paramList,
            returnVariables,
            getEditorIndent(document),
            selectedText,
            isPart
        ));
        edit.replace(document.uri, range, getMethodCall(
            name,
            paramList,
            returnVariables,
            isPart && (! endMark)
        ));
        await workspace.applyEdit(edit);
    });
}

async function extractVariable(document, range) {
    if (!document || !range) {
        if (!window.activeTextEditor) {
            return;
        }
        document = window.activeTextEditor.document;
        range = window.activeTextEditor.selection;
    }

    if (range.isEmpty) return;

    const selectedText = document.getText(range).trim();
    if (!isExtractVariablePossible(selectedText)) {
        window.showErrorMessage('Extract variable : invalid selection');
        return;
    }

    const parser = new PhpParser.Engine({ ast: { withPositions: true } });
    const ast = parser.parseCode(document.getText());
    const statementNode = findStatement(
        ast,
        document.offsetAt(range.start),
        document.offsetAt(range.end)
    );
    if (!statementNode) {
        window.showErrorMessage('Extract variable : invalid selection');
        return;
    }

    ask('Variable name').then(async (variableName) => {
        if (!variableName) return;

        const insertLine = statementNode.loc.start.line - 1;
        const phpCode = getIndentation(document.lineAt(insertLine).text)
            + '$' + variableName + ' = ' + selectedText + ";\n";

        const edit = new WorkspaceEdit();
        edit.insert(document.uri, new Position(insertLine, 0), phpCode);
        edit.replace(document.uri, range, '$' + variableName);
        await workspace.applyEdit(edit);
    });
}

class RefactorProvider {
  static providedCodeActionKinds = [CodeActionKind.RefactorExtract];

  provideCodeActions(document, range, context, token) {
    if (range.isEmpty) return [];

    let actions = [];

    if (config.get('activate.refactor.extractVariable', true)) {
        const selectedText = document.getText(range).trim();
        if (isExtractVariablePossible(selectedText)) {
            actions.push(createRefactorAction(
                "Extract to variable",
                "phpcompanion.extractVariable",
                document,
                range
            ));
        }
    }

    if (config.get('activate.refactor.extractMethod', true)) {
        actions.push(createRefactorAction(
            "Extract to method",
            "phpcompanion.extractMethod",
            document,
            range
        ));
    }

    return actions;
  }
}

exports.extractMethod = extractMethod;
exports.extractVariable = extractVariable;
exports.RefactorProvider = RefactorProvider;

