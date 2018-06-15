import { View, Spec, parse } from "vega-lib";

export function renderSvg(content: string): Promise<string> {
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