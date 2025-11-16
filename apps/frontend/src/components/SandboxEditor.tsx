'use client';

import { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import * as monaco from 'monaco-editor';
import { WebContainer } from '@webcontainer/api';
import { io, Socket } from 'socket.io-client';
import { PyodideRunner } from '../utils/PythonRunner';
import { toast } from 'sonner';
import { debounce } from 'lodash';

interface SandboxEditorProps {
  roomId: string;
  userId: string;
  initialCode?: string;
  initialLang?: 'typescript' | 'python';
  ideaId?: string;
}

export default function SandboxEditor({
  roomId,
  userId,
  initialCode = '',
  initialLang = 'typescript',
  ideaId,
}: SandboxEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const wcRef = useRef<WebContainer | null>(null);
  const editorInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const isApplyingRemoteUpdateRef = useRef(false);

  const [status, setStatus] = useState('Booting...');
  const [lang, setLang] = useState<'typescript' | 'python'>(initialLang);
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [pkgInput, setPkgInput] = useState('');

  const pyRunner = PyodideRunner.getInstance();

  // Output handler (shared for both runtimes)
  const appendOutput = (text: string) => {
    setOutput((prev) => {
      const newOutput = prev + text + '\n';
      if (outputRef.current) {
        outputRef.current.innerHTML = `<pre class="text-green-400 font-mono text-sm">${newOutput.replace(/\n/g, '<br>')}</pre>`;
        outputRef.current.scrollTop = outputRef.current.scrollHeight;
      }
      return newOutput;
    });
  };

  useEffect(() => {
    // Initialize Yjs document
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // Socket.io for Yjs sync (using existing realtime infrastructure)
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001', {
      path: '/realtime',
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('joinRoom', {
        roomId: `sandbox:${roomId}`,
        userId,
        ideaId,
      });
    });

    // Receive initial document sync
    socket.on('docSync', (data: { roomId: string; update: number[] }) => {
      if (data.roomId === `sandbox:${roomId}`) {
        isApplyingRemoteUpdateRef.current = true;
        Y.applyUpdate(ydoc, new Uint8Array(data.update));
        isApplyingRemoteUpdateRef.current = false;
      }
    });

    // Receive remote document updates
    socket.on('docUpdate', (data: { roomId: string; update: number[] }) => {
      if (data.roomId === `sandbox:${roomId}`) {
        isApplyingRemoteUpdateRef.current = true;
        Y.applyUpdate(ydoc, new Uint8Array(data.update));
        isApplyingRemoteUpdateRef.current = false;
      }
    });

    // Yjs text for sandbox code
    const ytext = ydoc.getText('sandboxCode');
    if (initialCode) {
      ytext.insert(0, initialCode);
    }

    // Initialize Monaco editor
    if (editorRef.current && !editorInstanceRef.current) {
      const editor = monaco.editor.create(editorRef.current, {
        value: ytext.toString() || initialCode || getDefaultCode(lang),
        language: lang,
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: true },
        fontSize: 14,
        wordWrap: 'on',
      });
      editorInstanceRef.current = editor;

      // Bind Yjs to Monaco
      const model = editor.getModel();
      if (model) {
        // Create minimal awareness for MonacoBinding
        const mockAwareness = {
          getStates: () => new Map(),
          setLocalStateField: () => {},
          on: () => {},
          off: () => {},
        } as any;

        const binding = new MonacoBinding(ytext, model, new Set([editor]), mockAwareness);
        bindingRef.current = binding;
      }

      // Update editor language when Yjs changes
      ytext.observe(() => {
        const content = ytext.toString();
        if (model && model.getValue() !== content && !isApplyingRemoteUpdateRef.current) {
          // Content changed remotely, update editor
        }
      });
    }

    // Send local Yjs updates to server (debounced)
    const debouncedEmitUpdate = debounce(
      (update: Uint8Array) => {
        if (!isApplyingRemoteUpdateRef.current && socket.connected) {
          socket.emit('applyUpdate', {
            roomId: `sandbox:${roomId}`,
            update: Array.from(update),
          });
        }
      },
      100,
      { leading: false, trailing: true },
    );

    const updateHandler = (update: Uint8Array) => {
      debouncedEmitUpdate(update);
    };
    ydoc.on('update', updateHandler);

    // Initialize runtime based on language
    if (lang === 'typescript') {
      WebContainer.boot()
        .then((wc) => {
          wcRef.current = wc;
          setStatus('Ready');
          toast.success('Sandbox ready!', { description: 'WebContainer booted successfully' });

          // Mount initial files
          const updateFiles = () => {
            const code = ytext.toString();
            wc.mount({
              'index.ts': {
                file: {
                  contents: code || getDefaultCode('typescript'),
                },
              },
              'package.json': {
                file: {
                  contents: JSON.stringify({
                    name: 'sandbox',
                    version: '1.0.0',
                    type: 'module',
                    dependencies: {},
                  }),
                },
              },
              'tsconfig.json': {
                file: {
                  contents: JSON.stringify({
                    compilerOptions: {
                      target: 'ES2020',
                      module: 'ESNext',
                      moduleResolution: 'node',
                      strict: true,
                    },
                  }),
                },
              },
            });
          };

          // Update files when Yjs changes
          ytext.observe(() => {
            updateFiles();
          });

          updateFiles();
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('WebContainer boot failed:', err);
          toast.error('Sandbox boot failed', {
            description: err.message || 'Failed to initialize WebContainer',
          });
          setStatus('Error');
        });
    } else {
      // Python: Initialize Pyodide
      pyRunner
        .init()
        .then(() => {
          pyRunner.setOutput(appendOutput);
          setStatus('Ready');
          toast.success('Python sandbox ready!', { description: 'Pyodide loaded successfully' });
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('Pyodide init failed:', err);
          toast.error('Python sandbox failed', {
            description: err.message || 'Failed to initialize Pyodide',
          });
          setStatus('Error');
        });
    }

    return () => {
      debouncedEmitUpdate.cancel();
      ydoc.off('update', updateHandler);
      bindingRef.current?.destroy();
      editorInstanceRef.current?.dispose();
      if (wcRef.current) {
        wcRef.current.teardown();
      }
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, userId, ideaId, lang]);

  // Handle language change
  const handleLangChange = (newLang: 'typescript' | 'python') => {
    setLang(newLang);
    setOutput('');
    if (editorInstanceRef.current) {
      const model = editorInstanceRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, newLang);
        if (newLang === 'python') {
          pyRunner.setOutput(appendOutput);
        }
      }
    }
  };

  // Run code handler
  const runCode = async () => {
    if (!ydocRef.current) return;

    const code = ydocRef.current.getText('sandboxCode').toString();
    if (!code.trim()) {
      toast.warning('Add some code first!');
      return;
    }

    setRunning(true);
    setOutput('');

    try {
      if (lang === 'typescript') {
        if (!wcRef.current) {
          throw new Error('WebContainer not ready');
        }

        // Update files first
        await wcRef.current.mount({
          'index.ts': {
            file: {
              contents: code,
            },
          },
        });

        // Try to run with tsx (TypeScript runner) or compile first
        const process = await wcRef.current.spawn('npx', ['tsx', 'index.ts'], {
          output: true,
        });

        const reader = process.output.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const decoder = new TextDecoder();
          appendOutput(decoder.decode(value));
        }

        const exitCode = await process.exit;
        if (exitCode !== 0) {
          appendOutput(`Process exited with code ${exitCode}`);
        }
      } else {
        // Python: Run with Pyodide
        pyRunner.setOutput(appendOutput);
        const result = await pyRunner.run(code, true); // Reset globals
        if (result !== undefined) {
          appendOutput(`Result: ${JSON.stringify(result)}`);
        }
      }

      setStatus('Ready');
    } catch (err: any) {
      const errorMsg = err.message || String(err);
      appendOutput(`Runtime Error: ${errorMsg}`);
      toast.error('Execution failed', {
        description: errorMsg,
      });
    } finally {
      setRunning(false);
    }
  };

  // Install package (Python only)
  const installPkg = async () => {
    if (lang !== 'python') {
      toast.info('Switch to Python first');
      return;
    }

    if (!pkgInput.trim()) {
      toast.warning('Enter a package name');
      return;
    }

    try {
      setStatus('Installing...');
      await pyRunner.installPackage(pkgInput.trim());
      toast.success(`${pkgInput.trim()} installed!`);
      setPkgInput('');
      setStatus('Ready');
    } catch (err: any) {
      toast.error('Install failed', {
        description: err.message || 'Failed to install package',
      });
      setStatus('Ready');
    }
  };

  // Reset Python globals
  const resetGlobals = async () => {
    if (lang !== 'python') return;
    try {
      await pyRunner.run('globals().clear()', false);
      toast.success('Globals reset');
    } catch (err: any) {
      toast.error('Reset failed', { description: err.message });
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Toolbar */}
      <div className="p-2 bg-gray-800 border-b border-gray-700 flex items-center gap-2 flex-wrap">
        <select
          value={lang}
          onChange={(e) => handleLangChange(e.target.value as 'typescript' | 'python')}
          className="px-3 py-1.5 bg-gray-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-label="Select programming language"
        >
          <option value="typescript">TypeScript/JS</option>
          <option value="python">Python</option>
        </select>

        {lang === 'python' && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Package name (e.g., numpy)"
              value={pkgInput}
              onChange={(e) => setPkgInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  installPkg();
                }
              }}
              className="px-3 py-1.5 bg-gray-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-40"
              aria-label="Python package name"
            />
            <button
              onClick={installPkg}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
              disabled={!pkgInput.trim()}
            >
              Install
            </button>
            <button
              onClick={resetGlobals}
              className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700"
            >
              Reset Globals
            </button>
          </div>
        )}

        <div className="flex-1" />

        <button
          onClick={runCode}
          disabled={running || status !== 'Ready'}
          className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {running ? (
            <>
              <span className="animate-spin">⚡</span>
              Running...
            </>
          ) : (
            <>
              <span>▶</span>
              Run Code
            </>
          )}
        </button>

        <div className="text-xs text-gray-400">
          Status: <span className="text-green-400">{status}</span>
        </div>
      </div>

      {/* Editor */}
      <div ref={editorRef} className="flex-1" />

      {/* Output */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="text-xs text-gray-400 mb-2">Output:</div>
        <div
          ref={outputRef}
          className="overflow-auto h-40 bg-black text-green-400 p-3 rounded font-mono text-sm"
          role="log"
          aria-label="Code execution output"
        />
      </div>
    </div>
  );
}

// Default code templates
function getDefaultCode(lang: 'typescript' | 'python'): string {
  if (lang === 'python') {
    return `# Python Sandbox
import sys
print(f"Python {sys.version}")
print("Hello from OmniForge Sandbox!")
`;
  }
  return `// TypeScript Sandbox
console.log("Hello from OmniForge Sandbox!");
console.log("Node version:", process.version);
`;
}

