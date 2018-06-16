import * as vscode from 'vscode';
import { renderVegaStringToSvg, renderVegaLiteStringToSvg } from './renderer';

export type ViewType = "vega-preview" | "vega-lite-preview";

export class PreviewManager {
  private readonly previews = new WeakMap<vscode.TextDocument, vscode.WebviewPanel>();

  constructor(private template: string) {
  }

  private getColumn(activeColumn?: vscode.ViewColumn): vscode.ViewColumn {
    var ret: vscode.ViewColumn;
    if (activeColumn === vscode.ViewColumn.One) {
      ret = vscode.ViewColumn.Two;
    } else {
      ret = vscode.ViewColumn.Three;
    }
    return ret;
  }

  public async showPreviewFor(textEditor: vscode.TextEditor, viewType: ViewType) {
    let preview = this.previews.get(textEditor.document);
    if (!preview) {
      preview = await this.createPreview(textEditor.document, this.getColumn(textEditor.viewColumn), viewType);
      this.previews.set(textEditor.document, preview);
    } else {
      preview.reveal(textEditor.viewColumn || this.getColumn(textEditor.viewColumn), true);
    }
  }

  public updatePreviewFor(textDocument: vscode.TextDocument) {
    /* do we have a preview for that document? */
    let preview = this.previews.get(textDocument);
    if (preview) {
      this.updatePreviewContent(textDocument, preview, this.template);
    }
  }
  
  private async updatePreviewContent(textDocument: vscode.TextDocument, preview: vscode.WebviewPanel, template: string) {
    let content = textDocument.getText();
    let viewType = preview.viewType as ViewType;
    preview.webview.html = await this.getPreviewHtml(content, viewType, template);
  }

  private async getPreviewHtml(content: string, viewType: ViewType, template: string): Promise<string> {

    let svg: string;
    switch (viewType) {
      case "vega-preview":
        svg = await renderVegaStringToSvg(content);
        break;
      case "vega-lite-preview":
        svg = await renderVegaLiteStringToSvg(content);
        break;
      default:
        svg = "";
        break;
    }

    return template.replace('<div id="vega"></div>', svg);
  }

  private getPreviewTitle(document: vscode.TextDocument, viewType: ViewType): string {
    let previewType: string;
    switch (viewType) {
      case "vega-lite-preview": previewType = "Vega-Lite Preview"; break;
      case "vega-preview": previewType = "Vega Preview"; break;
      default: previewType =""; break;
    }
    return `${previewType} for '${document.fileName}'`;
  }

  private async createPreview(textDocument: vscode.TextDocument, viewColumn: vscode.ViewColumn, viewType: ViewType) : Promise<vscode.WebviewPanel> {
    /* create the preview */
    const preview = vscode.window.createWebviewPanel(
      viewType,
      this.getPreviewTitle(textDocument, viewType),
      {
        viewColumn: viewColumn,
        preserveFocus: true
      },
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    /* fill the preview */
    this.updatePreviewContent(textDocument, preview, this.template);

    /* wire up the event handlers */
    preview.onDidDispose(() => this.previews.delete(textDocument));

    return preview;
  }
}