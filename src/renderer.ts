import { View, Spec, parse } from "vega-lib";
import { compile as compileVegaLite } from "vega-lite";

function renderVegaSpecToSvg(spec: Spec): Promise<string> {
  return new Promise((resolve, reject) => {

    const view = new View(parse(spec))
    .renderer('none')
    .initialize();

    view.toSVG()
      .then(svg => resolve(svg))
      .catch(err => reject(err));
  });
}

export function renderVegaStringToSvg(content: string): Promise<string> {
    let spec = JSON.parse(content) as Spec;
    return renderVegaSpecToSvg(spec);
}

export function renderVegaLiteStringToSvg(content: string): Promise<string> {
  let vlSpec = JSON.parse(content);
  let vgSpec = compileVegaLite(vlSpec).spec;
  return renderVegaSpecToSvg(vgSpec);
}