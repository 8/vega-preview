import { FileFormat, renderSvg } from "./renderer";
import { ITemplateManager } from "./templatemanager";
import * as vscode from 'vscode';

export interface IHtmlContentService {
  getPreviewHtml(fileFormat: FileFormat, textDocument: vscode.TextDocument, baseFolder: string): Promise<string>;
}

export class HtmlContentService implements IHtmlContentService {
  private readonly svgCache: WeakMap<vscode.TextDocument, string>;
  constructor(private templateManager: ITemplateManager) {
    this.svgCache = new WeakMap<vscode.TextDocument, string>();
  }

  private replaceSvgPlaceholder(template: string, svg: string) {
    return template.replace(/<div id="vega">.*?<\/div>/, `${svg}`);
  }

  private replaceErrorPlaceholder(template: string, error: string) {
    return template.replace(/<div id="errors">.*?<\/div>/, `${error}`);
  }

  public async getPreviewHtml(fileFormat: FileFormat, textDocument: vscode.TextDocument, baseFolder: string): Promise<string> {
    let svg: string ="";
    let error: string ="";
    let content = textDocument.getText();
    try {
      svg = await renderSvg(fileFormat, content, baseFolder);

      /* update the cache for this document */
      this.svgCache.set(textDocument, svg);

    } catch (e) {

      error = e.message;

      /* use the last valid svg for this document, if any */
      svg = this.svgCache.get(textDocument) || "";
    }

    let html = this.templateManager.getTemplate();
    html = this.replaceSvgPlaceholder(html, svg);
    html = this.replaceErrorPlaceholder(html, error);
    return html;
  }
}