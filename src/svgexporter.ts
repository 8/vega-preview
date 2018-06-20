import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { renderSvg, FileFormat  } from './renderer';

export class SvgExporter {

  private getDefaultFileName(textDocument: vscode.TextDocument): string {
    return textDocument.fileName + ".svg";
  }

  private async renderSvg(textDocument: vscode.TextDocument, fileFormat: FileFormat): Promise<string> {

    const text = textDocument.getText(),
          folder = path.dirname(textDocument.fileName);

    return renderSvg(fileFormat, text, folder);
  }

  private async getSvgFileName(textDocument: vscode.TextDocument): Promise<string | undefined> {
    
    const defaultFileName = this.getDefaultFileName(textDocument);

    /* ask the user for a filename */
    const result = await vscode.window.showInputBox({
      prompt: "Please enter the filename of exported svg.",
      value: defaultFileName
    });

    return result;
  }

  public async exportToSvg(textDocument: vscode.TextDocument, fileFormat: FileFormat): Promise<boolean> {

    const svg = await this.renderSvg(textDocument, fileFormat);

    const fileName = await this.getSvgFileName(textDocument);

    let isExported = false;
    if (fileName !== undefined) {
      fs.writeFileSync(fileName, svg);
      isExported = true;
    }

    return isExported;
  }

}