/**
 * PythonRunner - Singleton class for running Python code via Pyodide
 * Handles WASM loading, stdout/stderr capture, and package management
 * Uses dynamic import for pyodide to avoid build errors (node: deps)
 */

type PyodideInterface = any;

class PythonRunner {
  private _pyodide: PyodideInterface | null = null;
  private _output: (text: string) => void = console.log;
  private _ready = false;
  private _loading = false;

  async init(): Promise<void> {
    if (this._ready) return;
    if (this._loading) {
      // Wait for existing init to complete
      while (!this._ready) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return;
    }

    this._loading = true;
    try {
      // Load from CDN to avoid webpack bundling (pyodide uses node: imports)
      const pyodideUrl = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.mjs';
      const { loadPyodide } = await import(
        /* webpackIgnore: true */
        pyodideUrl
      );
      this._pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/',
        stdout: (text: string) => {
          this._output(text);
        },
        stderr: (text: string) => {
          this._output(`Error: ${text}`);
        },
      });

      // Preload micropip for package management
      await this._pyodide.runPythonAsync('import micropip');
      this._ready = true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to initialize Pyodide:', error);
      throw error;
    } finally {
      this._loading = false;
    }
  }

  setOutput(output: (text: string) => void): void {
    this._output = output;
  }

  async run(code: string, globalsReset = false): Promise<unknown> {
    if (!this._ready) {
      await this.init();
    }

    if (!this._pyodide) {
      throw new Error('Pyodide not initialized');
    }

    try {
      if (globalsReset) {
        // Reset globals for clean REPL-like behavior
        await this._pyodide.runPythonAsync('globals().clear()');
      }

      const result = await this._pyodide.runPythonAsync(code);
      return result;
    } catch (err: any) {
      const errorMsg = err.message || String(err);
      this._output(`Exception: ${errorMsg}`);
      throw err;
    }
  }

  async installPackage(pkg: string): Promise<void> {
    if (!this._ready) {
      await this.init();
    }

    if (!this._pyodide) {
      throw new Error('Pyodide not initialized');
    }

    try {
      await this._pyodide.runPythonAsync(`await micropip.install('${pkg}')`);
    } catch (err: any) {
      const errorMsg = err.message || String(err);
      throw new Error(`Failed to install ${pkg}: ${errorMsg}`);
    }
  }

  isReady(): boolean {
    return this._ready;
  }
}

// Singleton pattern
let instance: PythonRunner | null = null;

export const PyodideRunner = {
  getInstance: (): PythonRunner => {
    if (!instance) {
      instance = new PythonRunner();
    }
    return instance;
  },
};

