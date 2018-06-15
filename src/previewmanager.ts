import * as vscode from 'vscode';
import { renderSvg } from './renderer';

class PreviewManager {
  private readonly previews = new WeakMap<vscode.TextDocument, vscode.WebviewPanel>();
  private readonly viewType = "vega-preview";

  private getColumn(activeColumn?: vscode.ViewColumn): vscode.ViewColumn {
    var ret: vscode.ViewColumn;
    if (activeColumn === vscode.ViewColumn.One) {
      ret = vscode.ViewColumn.Two;
    } else {
      ret = vscode.ViewColumn.Three;
    }
    return ret;
  }

  public async showPreviewFor(textEditor: vscode.TextEditor) {
    let preview = this.previews.get(textEditor.document);
    if (!preview){
      preview = await this.createPreview(textEditor.document, this.getColumn(textEditor.viewColumn));
      this.previews.set(textEditor.document, preview);
    } else {
      preview.reveal(textEditor.viewColumn || this.getColumn(textEditor.viewColumn), true);
    }
  }

  public updatePreviewFor(textDocument: vscode.TextDocument) {
    /* do we have a preview for that document? */
    let preview = this.previews.get(textDocument);
    if (preview) {
      // console.log(`Updating content for document '${textDocument}'`);
      this.updatePreviewContent(textDocument, preview);
    }
  }
  
  private async updatePreviewContent(textDocument: vscode.TextDocument, preview: vscode.WebviewPanel) {
    let content = textDocument.getText();
    preview.webview.html = await this.getPreviewHtml(content);
  }

  private async getPreviewHtml(content: string): Promise<string> {
    // return `<html><body><p>This is the preview!</p><pre><code>${content}</code></pre></body></html>`;
    const svg = await renderSvg(content);
    return `<html><head></head><body>${svg}</body>`;
  }

  private getPreviewTitle(document: vscode.TextDocument): string {
    return `Preview for '${document.fileName}'`;
  }

  private async createPreview(textDocument: vscode.TextDocument, viewColumn: vscode.ViewColumn) : Promise<vscode.WebviewPanel> {

    /* create the preview */
    const preview = vscode.window.createWebviewPanel(
      this.viewType,
      this.getPreviewTitle(textDocument),
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
    this.updatePreviewContent(textDocument, preview);

    /* wire up the event handlers */
    preview.onDidDispose(() => this.previews.delete(textDocument));

    return preview;
  }

}

export const previewManager = new PreviewManager();
