import { View, Spec, parse, loader, Loader }  from "vega";
import { compile as compileVegaLite } from "vega-lite";
import * as fs from 'fs';
import * as path from 'path';

export type FileFormat = "vega" | "vega-lite";

function getFileLoader(baseFolder: string): Loader {
  let fileLoader = loader();
  fileLoader.load = (uri: string, options: any) => {
    return new Promise((resolve, reject) => {
      fs.readFile(path.join(baseFolder, uri), "utf8", (err, data) => {
        if (err) { reject(err); }
        else { resolve(data); }
      });
    });
  };
  return fileLoader;
}

function renderVegaSpecToSvg(spec: Spec, baseFolder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileLoader = getFileLoader(baseFolder);
    const runtime = parse(spec);
    const view = new View(runtime, {
      loader: fileLoader
    })
    .renderer('none')
    .initialize();

    view.toSVG()
      .then(svg => resolve(svg))
      .catch(err => reject(err));
  });
}

function renderVegaStringToSvg(content: string, baseFolder: string): Promise<string> {
    let spec = JSON.parse(content) as Spec;
    return renderVegaSpecToSvg(spec, baseFolder);
}

function renderVegaLiteStringToSvg(content: string, baseFolder: string): Promise<string> {
  let vlSpec = JSON.parse(content);
  let vgSpec = compileVegaLite(vlSpec).spec;
  return renderVegaSpecToSvg(vgSpec, baseFolder);
}

export function renderSvg(viewType: FileFormat, content: string, baseFolder: string): Promise<string> {
  switch (viewType) {
    case "vega-lite": 
      return renderVegaLiteStringToSvg(content, baseFolder);
    case "vega":
      return renderVegaStringToSvg(content, baseFolder);
    default: 
      throw new Error(`Unknown viewType: '${viewType}'`);
  }
}