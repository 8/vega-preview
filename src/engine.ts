import * as child_process from "child_process";

export class ProcessOutput {
  public stdOut : string;
  public stdErr : string;
  public exitCode: number;
  constructor(stdOut: string, stdErr: string, exitCode: number) {
    this.stdErr = stdErr;
    this.stdOut = stdOut;
    this.exitCode = exitCode;
  }
}

function startProcess(processName: string, content: string, cancel?: Promise<void>): Promise<ProcessOutput> {
  return new Promise((resolve, reject) => {
    let process = child_process.spawn(processName);

    /* collect stdout and stderr from the process */
    const stdoutBuffer: Array<string | Buffer> = [];
    const stderrBuffer: Array<string | Buffer> = [];
    process.stdout.on("data", d => stdoutBuffer.push(d));
    process.stderr.on("data", d => stderrBuffer.push(d));

    process.on("error", reject);

    /* return ProcessOutput when the process completes */
    process.on("exit", exitCode => resolve(new ProcessOutput(stdoutBuffer.join(""), stderrBuffer.join(""), exitCode)));

    /* support for cancelling the process */
    if (cancel) {
      cancel.then(() => process.kill());
    }

    /* send the contents to the process' stdin */
    process.stdin.end(content);
  });
}

export function vg2svg(content: string): Promise<ProcessOutput> {
  return startProcess("vg2svg", content);
}

export function vl2vg(content: string): Promise<ProcessOutput> {
  return startProcess("vl2vg", content);
}

// class VegaEngine {
// }

// export const vegaEngine = new VegaEngine();

//   readonly args = "vl2vg | vg2svg";