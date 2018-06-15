'use strict';
import * as vscode from 'vscode';
import { previewManager } from './previewmanager';

const previewCommand = "vega-lite.showPreview";

/* main entrypoint */
export function activate(context: vscode.ExtensionContext) {
    console.log("vega-lite-preview: activate()");

    const disposables = [
        vscode.commands.registerCommand(previewCommand, async () => {
            console.log("vega-lite-preview: command showPreview");
            
            /* get the currently active editor */
            const activeEditor = vscode.window.activeTextEditor;
            
            /* create a preview window for it */
            if (activeEditor) {
                await previewManager.showPreviewFor(activeEditor);
            }
        }),
        vscode.workspace.onDidChangeTextDocument(e => previewManager.updatePreviewFor(e.document))
    ];
    context.subscriptions.concat(disposables);
}