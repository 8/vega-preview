'use strict';
import * as vscode from 'vscode';
import { ViewType, PreviewManager } from './previewmanager';
import * as fs from 'fs';
import { SvgExporter,  FileFormat } from './svgexporter';

type PreviewCommand = "vega-preview.showVegaPreview" | "vega-preview.showVegaLitePreview";
type ExportCommand = "vega-preview.exportVegaToSvg" | "vega-preview.exportVegaLiteToSvg";

/* main entrypoint */
export function activate(context: vscode.ExtensionContext) {

    const templateFile = context.asAbsolutePath("resources/template.html");
    const template = fs.readFileSync(templateFile, "utf8");
    const previewManager = new PreviewManager(template);
    const svgExporter = new SvgExporter();

    function createPreviewCommand(previewCommand: PreviewCommand, viewType: ViewType): vscode.Disposable {
        return vscode.commands.registerCommand(previewCommand, async () => {
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor) {
                await previewManager.showPreviewFor(activeEditor, viewType);
            }
        });
    }

    function createExportCommand(exportCommand: ExportCommand, fileFormat: FileFormat) {
        return vscode.commands.registerCommand(exportCommand, async () => {
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor) {
                svgExporter.exportToSvg(activeEditor.document, fileFormat);
            }
        });
    }

    const disposables = [
        createPreviewCommand("vega-preview.showVegaPreview", "vega-preview"),
        createPreviewCommand("vega-preview.showVegaLitePreview", "vega-lite-preview"),
        createExportCommand("vega-preview.exportVegaToSvg", "vega"),
        createExportCommand("vega-preview.exportVegaLiteToSvg", "vega-lite"),
        vscode.workspace.onDidChangeTextDocument(e => previewManager.updatePreviewFor(e.document))
    ];
    context.subscriptions.concat(disposables);
}