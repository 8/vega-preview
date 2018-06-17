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

  private replaceSvgPlaceholder(template: string, svg: string) {
    return template.replace(/<div id="vega">.*?<\/div>/, `${svg}`);
  }

  private replaceErrorPlaceholder(template: string, error: string) {
    return template.replace(/<div id="errors">.*?<\/div>/, `${error}`);
  }

  private async renderContentToSvg(content: string, viewType: ViewType): Promise<string> {
    let svg: Promise<string>;
    switch (viewType) {
      case "vega-preview":
        svg = renderVegaStringToSvg(content);
        break;
      case "vega-lite-preview":
        svg = renderVegaLiteStringToSvg(content);
        break;
      default:
        svg = Promise.resolve("");
        break;
    }
    return svg;
  }

  private async getPreviewHtml(content: string, viewType: ViewType, template: string): Promise<string> {
    let svg: string ="";
    let error: string ="";
    try {
      svg = await this.renderContentToSvg(content, viewType);
    } catch (e) {
      error = e.message;
    }

    let html = template;
    html = this.replaceSvgPlaceholder(html, svg);
    html = this.replaceErrorPlaceholder(html, error);
    return html;
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