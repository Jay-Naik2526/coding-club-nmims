import axios from 'axios';

// Base64 encoding/decoding helper
export const encodeBase64 = (str: string): string => {
  return Buffer.from(str || '').toString('base64');
};

export const decodeBase64 = (str: string): string => {
  return Buffer.from(str || '', 'base64').toString('utf-8');
};

// Map languages to Judge0 language IDs
export const getLanguageId = (lang: string): number => {
  switch (lang.toLowerCase()) {
    case 'cpp':
    case 'c++':
      return 54; // GCC 9.2.0
    case 'java':
      return 91; // OpenJDK 17
    case 'python':
    case 'py':
      return 71; // Python 3.8.1
    case 'javascript':
    case 'js':
      return 93; // Node.js 18.15.0
    default:
      return 93;
  }
};

export const runCodeOnJudge0 = async (code: string, language: string, stdin: string, expectedOutput?: string) => {
  const apiKey = process.env.JUDGE0_API_KEY;
  const apiHost = process.env.JUDGE0_API_HOST || 'judge0-extra-ce.p.rapidapi.com';

  const languageId = getLanguageId(language);

  if (!apiKey || apiKey === 'your-rapidapi-judge0-key') {
    // ----------------------------------------------------
    // MOCK COMPILER FALLBACK (Offline / No Key support)
    // ----------------------------------------------------
    console.log('Using mock compiler fallback for language:', language);
    await new Promise((resolve) => setTimeout(resolve, 800)); // simulate latency

    const hasSyntaxError = code.includes('syntax_error_test_fail');
    const isTle = code.includes('infinite_loop_test_fail');
    
    if (hasSyntaxError) {
      return {
        status: { id: 6, description: 'Compilation Error' },
        time: '0.000',
        memory: 0,
        stdout: encodeBase64('Mock syntax error in code: compile failed.'),
      };
    }
    
    if (isTle) {
      return {
        status: { id: 5, description: 'Time Limit Exceeded' },
        time: '2.050',
        memory: 2048,
        stdout: '',
      };
    }

    // Default success output
    let outputText = expectedOutput ? decodeBase64(expectedOutput) : 'Success';
    
    // Customize output if we have a match in stdin
    const decodedStdin = stdin ? decodeBase64(stdin) : '';
    if (decodedStdin) {
      if (decodedStdin.includes('315')) {
        outputText = '[3,3,5,7]\n';
      } else if (decodedStdin.includes('[2,7,11,15]')) {
        outputText = '[0,1]\n';
      } else if (decodedStdin.includes('[3,2,4]')) {
        outputText = '[1,2]\n';
      } else if (decodedStdin.includes('[3,3]')) {
        outputText = '[0,1]\n';
      }
    }

    return {
      status: { id: 3, description: 'Accepted' },
      time: '0.085',
      memory: 4096,
      stdout: encodeBase64(outputText),
    };
  }

  // Live Judge0 RapidAPI call
  const response = await axios.post(
    `https://${apiHost}/submissions?base64_encoded=true&wait=true`,
    {
      source_code: encodeBase64(code),
      language_id: languageId,
      stdin: encodeBase64(stdin),
      expected_output: expectedOutput,
    },
    {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
};
