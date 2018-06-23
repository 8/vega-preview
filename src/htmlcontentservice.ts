import { FileFormat, renderSvg } from "./renderer";
import { ITemplateManager } from "./templatemanager";

export interface IHtmlContentService {
  getPreviewHtml(fileFormat: FileFormat, svg: string, baseFolder: string): Promise<string>;
}

export class HtmlContentService implements IHtmlContentService {
  constructor(private templateManager: ITemplateManager) {}

  private replaceSvgPlaceholder(template: string, svg: string) {
    return template.replace(/<div id="vega">.*?<\/div>/, `${svg}`);
  }

  private replaceErrorPlaceholder(template: string, error: string) {
    return template.replace(/<div id="errors">.*?<\/div>/, `${error}`);
  }

  public async getPreviewHtml(fileFormat: FileFormat, content: string, baseFolder: string): Promise<string> {
    let svg: string ="";
    let error: string ="";
    try {
      svg = await renderSvg(fileFormat, content, baseFolder);
    } catch (e) {
      error = e.message;
    }

    let html = this.templateManager.getTemplate();
    html = this.replaceSvgPlaceholder(html, svg);
    html = this.replaceErrorPlaceholder(html, error);
    return html;
  }
}