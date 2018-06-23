'use strict';
import * as vscode from 'vscode';
import { PreviewManager } from './previewmanager';
import { SvgExporter } from './svgexporter';
import { FileFormat } from './renderer';
import { HtmlContentService } from './htmlcontentservice';
import { TemplateManager } from './templatemanager';

type PreviewCommand = "vega-preview.showVegaPreview" | "vega-preview.showVegaLitePreview";
type ExportCommand = "vega-preview.exportVegaToSvg" | "vega-preview.exportVegaLiteToSvg";

/* main entrypoint */
export function activate(context: vscode.ExtensionContext) {

    const previewManager = new PreviewManager(new HtmlContentService(new TemplateManager(context.asAbsolutePath("resources"))));
    const svgExporter = new SvgExporter();

    function createPreviewCommand(previewCommand: PreviewCommand, fileFormat: FileFormat): vscode.Disposable {
        return vscode.commands.registerCommand(previewCommand, async () => {
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor) {
                await previewManager.showPreviewFor(activeEditor, fileFormat);
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
        createPreviewCommand("vega-preview.showVegaPreview", "vega"),
        createPreviewCommand("vega-preview.showVegaLitePreview", "vega-lite"),
        createExportCommand("vega-preview.exportVegaToSvg", "vega"),
        createExportCommand("vega-preview.exportVegaLiteToSvg", "vega-lite"),
        vscode.workspace.onDidChangeTextDocument(e => previewManager.updatePreviewFor(e.document))
    ];
    context.subscriptions.concat(disposables);
}