import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { useQuery } from '@tanstack/react-query'
import { useApp } from '@/store/useApp'
import { api } from '@/lib/api'
import { DEPTS } from '@/lib/depts'

const LANG_TEMPLATES: Record<string, string> = {
  javascript: `// JavaScript (Node.js) Playground
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();

function solve(input) {
    // Write code here
    return input;
}

console.log(solve(input));`,
  python: `# Python 3.x Playground
import sys

def solve():
    # Read all input from standard input
    input_data = sys.stdin.read().strip()
    # Write code here
    print(input_data)

if __name__ == '__main__':
    solve()`,
  cpp: `// C++ (GCC) Playground
#include <iostream>
#include <string>
using namespace std;

int main() {
    string input;
    // Read stdin
    while (cin >> input) {
        cout << input << endl;
    }
    return 0;
}`,
  java: `// Java (OpenJDK) Playground
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            String input = sc.next();
            System.out.println(input);
        }
    }
}`
};

export function IdePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useApp()
  const eventSlug = searchParams.get('event') || 'codeblitz-4'

  // Query Event details
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', eventSlug],
    queryFn: async () => {
      const res = await api.get(`/events/${eventSlug}`)
      return res.data
    },
    enabled: !!eventSlug
  })

  // Query Problems for the active event
  const { data: problems, isLoading: problemsLoading } = useQuery({
    queryKey: ['problems', eventSlug],
    queryFn: async () => {
      const res = await api.get(`/events/${eventSlug}/problems`)
      return res.data
    },
    enabled: !!eventSlug
  })

  // Editor states
  const [selectedProblemId, setSelectedProblemId] = useState<string>('')
  const [language, setLanguage] = useState<string>('javascript')
  const [code, setCode] = useState<string>('')
  const [stdin, setStdin] = useState<string>('')
  
  // Output panel states
  const [activeTab, setActiveTab] = useState<'input' | 'output'>('input')
  const [verdict, setVerdict] = useState<string>('')
  const [running, setRunning] = useState<boolean>(false)
  const [runTime, setRunTime] = useState<string>('')
  const [runMemory, setRunMemory] = useState<string>('')
  const [stdout, setStdout] = useState<string>('')
  const [stderr, setStderr] = useState<string>('')
  const [compileOutput, setCompileOutput] = useState<string>('')

  // Set default problem and language code template on load
  useEffect(() => {
    if (problems && problems.length > 0) {
      setSelectedProblemId(problems[0]._id)
      setStdin(problems[0].sampleInput || '')
    }
  }, [problems])

  useEffect(() => {
    setCode(LANG_TEMPLATES[language] || '')
  }, [language])

  const selectedProblem = problems?.find((p: any) => p._id === selectedProblemId)

  // Update custom stdin input when switching problems
  const handleProblemChange = (id: string) => {
    setSelectedProblemId(id)
    const prob = problems?.find((p: any) => p._id === id)
    if (prob) {
      setStdin(prob.sampleInput || '')
    }
  }

  // Compile and run code against custom stdin
  const handleRunCode = async () => {
    setRunning(true)
    setVerdict('Running...')
    setActiveTab('output')
    setStdout('')
    setStderr('')
    setCompileOutput('')
    setRunTime('')
    setRunMemory('')

    try {
      const res = await api.post('/judge/run', {
        code,
        language,
        stdin
      })

      setVerdict(res.data.verdict)
      setStdout(res.data.stdout || '')
      setStderr(res.data.stderr || '')
      setCompileOutput(res.data.compile_output || '')
      setRunTime(res.data.time || '0.000')
      setRunMemory(res.data.memory || '0')
    } catch (err: any) {
      setVerdict('Runner Error')
      setStderr(err.response?.data?.error || 'Failed to connect to compiler engine.')
    } finally {
      setRunning(false)
    }
  }

  // Submit code against all hidden test cases
  const handleSubmitCode = async () => {
    if (!user) {
      alert('Please sign in using the Google link in the navigation bar first.')
      return
    }

    setRunning(true)
    setVerdict('Submitting...')
    setActiveTab('output')
    setStdout('')
    setStderr('')
    setCompileOutput('')
    setRunTime('')
    setRunMemory('')

    try {
      const res = await api.post('/judge/submit', {
        problemId: selectedProblemId,
        code,
        language
      })

      const sub = res.data.submission
      setVerdict(sub.verdict)
      setRunTime(`${sub.runtime} ms`)
      setRunMemory(`${sub.memory} KB`)
      
      if (sub.verdict === 'AC') {
        let msg = 'ALL TESTS PASSED!'
        if (res.data.xpAwarded) msg += ` +${res.data.xpAwarded} XP Earned.`
        if (res.data.badgeEarned) msg += ` [Badge Unlocked: ${res.data.badgeEarned}]`
        setStdout(msg)
      } else {
        setStdout(`Failed at Test Case #${res.data.failedTestCaseIndex + 1}. Try debugging edge cases.`)
      }
    } catch (err: any) {
      setVerdict('Submission Failed')
      setStderr(err.response?.data?.error || 'Server error grading solution.')
    } finally {
      setRunning(false)
    }
  }

  const cfg = event ? DEPTS[event.department as keyof typeof DEPTS] : null

  if (eventLoading || problemsLoading) {
    return (
      <div className="px-5 py-24 text-center sm:px-10">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--news-ink)' }} />
        <div className="mt-2 text-[10px] uppercase tracking-[0.25em]" style={{ color: 'rgba(26,22,18,.5)', fontFamily: 'var(--font-os)' }}>
          Preparing code workspace...
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1280px] px-5 py-8 sm:px-10">
      {/* header */}
      <header className="mb-6 flex flex-wrap items-baseline justify-between border-b-[3px] pb-2" style={{ borderColor: 'var(--news-ink)' }}>
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="font-[family-name:var(--font-serif)] text-2xl font-black sm:text-3xl">
            § The Judge Sandbox
          </h1>
          <span className="text-xs italic" style={{ color: 'rgba(26,22,18,.55)' }}>
            Contest: {event?.title || 'Competitive Syntax'}
          </span>
        </div>
        <button onClick={() => navigate('/events')} className="text-[10px] uppercase tracking-[0.1em]" style={{ color: 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
          ← Back to Editorial
        </button>
      </header>

      {problems && problems.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Panel: Problem Statement */}
          <div className="lg:col-span-5 flex flex-col border p-5 bg-[rgba(26,22,18,.01)]" style={{ borderColor: 'rgba(26,22,18,.18)' }}>
            <div className="mb-4">
              <label className="block text-[9px] uppercase tracking-[0.12em] text-gray-500 mb-1" style={{ fontFamily: 'var(--font-os)' }}>
                Select Challenge
              </label>
              <select
                value={selectedProblemId}
                onChange={(e) => handleProblemChange(e.target.value)}
                className="w-full border p-2 text-xs bg-white focus:outline-none"
                style={{ borderColor: 'var(--news-ink)' }}
              >
                {problems.map((p: any) => (
                  <option key={p._id} value={p._id}>
                    {p.title} (Level {p.difficulty})
                  </option>
                ))}
              </select>
            </div>

            {selectedProblem ? (
              <div className="text-left space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <h2 className="font-[family-name:var(--font-serif)] text-xl font-bold">
                      {selectedProblem.title}
                    </h2>
                    <span className="text-[9px] uppercase tracking-[0.1em] px-2 py-0.5 text-white" style={{ background: cfg?.acc || 'var(--news-red)', fontFamily: 'var(--font-os)' }}>
                      Diff: {selectedProblem.difficulty}/5
                    </span>
                  </div>
                  
                  <div className="mt-3 text-sm leading-relaxed text-gray-700 whitespace-pre-line" style={{ fontFamily: 'var(--font-sans)' }}>
                    {selectedProblem.description}
                  </div>
                </div>

                <div className="mt-6 space-y-3 pt-4 border-t">
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.1em] text-gray-500 font-bold" style={{ fontFamily: 'var(--font-os)' }}>Sample Input</h4>
                    <pre className="mt-1 border p-2.5 bg-white text-xs font-mono overflow-x-auto" style={{ borderColor: 'rgba(26,22,18,.15)' }}>
                      {selectedProblem.sampleInput}
                    </pre>
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.1em] text-gray-500 font-bold" style={{ fontFamily: 'var(--font-os)' }}>Sample Output</h4>
                    <pre className="mt-1 border p-2.5 bg-white text-xs font-mono overflow-x-auto" style={{ borderColor: 'rgba(26,22,18,.15)' }}>
                      {selectedProblem.sampleOutput}
                    </pre>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Right Panel: Editor & Console */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {/* Editor Config bar */}
            <div className="flex items-center justify-between border p-2.5 bg-[rgba(26,22,18,.02)]" style={{ borderColor: 'rgba(26,22,18,.18)' }}>
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-[9px] uppercase tracking-[0.12em] text-gray-500 mr-2" style={{ fontFamily: 'var(--font-os)' }}>Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="border px-2 py-1 text-xs bg-white"
                    style={{ borderColor: 'var(--news-ink)', fontFamily: 'var(--font-os)' }}
                  >
                    <option value="javascript">JavaScript (Node)</option>
                    <option value="python">Python 3</option>
                    <option value="cpp">C++ (GCC)</option>
                    <option value="java">Java (OpenJDK)</option>
                  </select>
                </div>
              </div>
              <span className="text-[9px] uppercase tracking-[0.1em] text-gray-400" style={{ fontFamily: 'var(--font-os)' }}>
                Monaco Editor active
              </span>
            </div>

            {/* Monaco Editor */}
            <div className="border border-black min-h-[360px] relative">
              <Editor
                height="380px"
                language={language}
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || '')}
                options={{
                  fontSize: 13,
                  fontFamily: 'var(--font-os)',
                  minimap: { enabled: false },
                  automaticLayout: true,
                  padding: { top: 10, bottom: 10 },
                }}
              />
            </div>

            {/* Console Pane */}
            <div className="border text-left flex flex-col min-h-[180px]" style={{ borderColor: 'rgba(26,22,18,.18)' }}>
              {/* Console Tabs */}
              <div className="flex border-b bg-gray-50" style={{ borderColor: 'rgba(26,22,18,.18)' }}>
                <button
                  onClick={() => setActiveTab('input')}
                  className={`px-4 py-2 text-[10px] uppercase tracking-[0.1em] font-bold border-r ${activeTab === 'input' ? 'bg-white border-b-2 border-b-black' : 'opacity-65'}`}
                  style={{ fontFamily: 'var(--font-os)' }}
                >
                  Custom Input
                </button>
                <button
                  onClick={() => setActiveTab('output')}
                  className={`px-4 py-2 text-[10px] uppercase tracking-[0.1em] font-bold border-r ${activeTab === 'output' ? 'bg-white border-b-2 border-b-black' : 'opacity-65'}`}
                  style={{ fontFamily: 'var(--font-os)' }}
                >
                  Result / Output {verdict && `[${verdict}]`}
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 p-3 bg-white">
                {activeTab === 'input' ? (
                  <textarea
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                    placeholder="Provide standard input variables here..."
                    className="w-full h-[95px] text-xs font-mono p-2 border focus:outline-none"
                    style={{ borderColor: 'rgba(26,22,18,.15)' }}
                  />
                ) : (
                  <div className="text-xs font-mono space-y-2 h-[95px] overflow-y-auto">
                    {verdict ? (
                      <div className="flex flex-wrap gap-4 border-b pb-2 mb-2">
                        <div>
                          <span className="text-gray-500">Verdict:</span>{' '}
                          <span className={`font-bold ${verdict === 'Accepted' || verdict === 'AC' ? 'text-green-700' : 'text-red-700'}`}>
                            {verdict}
                          </span>
                        </div>
                        {runTime && (
                          <div>
                            <span className="text-gray-500">Runtime:</span> <span>{runTime}</span>
                          </div>
                        )}
                        {runMemory && (
                          <div>
                            <span className="text-gray-500">Memory:</span> <span>{runMemory}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-400 italic">Run your program to see output console logs.</div>
                    )}

                    {stdout && (
                      <div>
                        <div className="text-[9px] uppercase tracking-[0.05em] text-gray-400 font-bold">Standard Output</div>
                        <pre className="bg-gray-50 p-2 border mt-1 whitespace-pre-wrap">{stdout}</pre>
                      </div>
                    )}
                    {stderr && (
                      <div>
                        <div className="text-[9px] uppercase tracking-[0.05em] text-red-500 font-bold">Standard Error</div>
                        <pre className="bg-red-50 text-red-800 p-2 border border-red-200 mt-1 whitespace-pre-wrap">{stderr}</pre>
                      </div>
                    )}
                    {compileOutput && (
                      <div>
                        <div className="text-[9px] uppercase tracking-[0.05em] text-red-500 font-bold">Compile Log</div>
                        <pre className="bg-red-50 text-red-800 p-2 border border-red-200 mt-1 whitespace-pre-wrap">{compileOutput}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 p-3 bg-gray-50 border-t" style={{ borderColor: 'rgba(26,22,18,.18)' }}>
                <button
                  onClick={handleRunCode}
                  disabled={running || !selectedProblemId}
                  className="cc-hover border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.1em]"
                  style={{ borderColor: 'var(--news-ink)', fontFamily: 'var(--font-os)', cursor: running ? 'not-allowed' : 'pointer' }}
                >
                  {running && activeTab === 'input' ? 'Running…' : 'Run Custom Test'}
                </button>
                <button
                  onClick={handleSubmitCode}
                  disabled={running || !selectedProblemId}
                  className="cc-hover px-5 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-white"
                  style={{ background: 'var(--news-ink)', fontFamily: 'var(--font-os)', cursor: running ? 'not-allowed' : 'pointer' }}
                >
                  {running && activeTab === 'output' ? 'Grading…' : 'Submit Solution'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 italic text-gray-500">
          No coding challenges found for this event.
        </div>
      )}
    </div>
  )
}
