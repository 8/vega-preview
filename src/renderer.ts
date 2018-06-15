import { View, Spec, parse } from "vega-lib";

export function renderVegaToSvg(content: string): Promise<string> {
  return new Promise((resolve, reject) => {

    let spec = JSON.parse(content) as Spec;

    const view = new View(parse(spec))
    .renderer('none')
    .initialize();

    view.toSVG()
      .then(svg => resolve(svg))
      .catch(err => reject(err));
  });
}

export function renderVegaLiteToSvg(content: string): Promise<string> {
  return new Promise((resolve, reject) => {
    /* todo: implement vega-lite rendering! */
    return "";
  });
}