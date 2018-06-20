import * as fs from 'fs';
import * as path from 'path';

export interface IHtmlTemplateManager {
  getTemplate(): string;
}

class TemplateModel {
  public name: string = "";
  public content: string = "";
}

export class HtmlTemplateManager implements IHtmlTemplateManager {
  private templates: Array<TemplateModel>;

  public constructor(private templateFolder: string) {
    this.templates = this.loadTemplates(templateFolder);
  }

  private loadTemplates(folder: string): Array<TemplateModel> {
    const fileNames = fs.readdirSync(this.templateFolder).filter(f => f.endsWith(".html"));
    let templates: Array<TemplateModel> = [];
    fileNames.forEach(f => templates.push({name: f, content: fs.readFileSync(path.join(folder, f), "utf8")}));
    return templates;
  }

  public getTemplate(): string {
    return this.templates[0].content;
  }

}