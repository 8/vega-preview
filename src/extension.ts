'use strict';
import * as vscode from 'vscode';
import { ViewType, PreviewManager } from './previewmanager';
import * as fs from 'fs';

type PreviewCommand = "vega-preview.showVegaPreview" | "vega-preview.showVegaLitePreview";

/* main entrypoint */
export function activate(context: vscode.ExtensionContext) {

    const templateFile = context.asAbsolutePath("resources/template.html");
    const template = fs.readFileSync(templateFile, "utf8");
    const previewManager = new PreviewManager(template);

    function createCommand(previewCommand: PreviewCommand, viewType: ViewType): vscode.Disposable {
        return vscode.commands.registerCommand(previewCommand, async () => {
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor) {
                await previewManager.showPreviewFor(activeEditor, viewType);
            }
        });
    }

    const disposables = [
        createCommand("vega-preview.showVegaPreview", "vega-preview"),
        createCommand("vega-preview.showVegaLitePreview", "vega-lite-preview"),
        vscode.workspace.onDidChangeTextDocument(e => previewManager.updatePreviewFor(e.document))
    ];
    context.subscriptions.concat(disposables);
}