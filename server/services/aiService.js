const Groq = require('groq-sdk');

// AI-powered analysis using Groq API
const analyzeWithGroq = async (code, language) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const prompt = `You are a senior code reviewer and algorithm analyst. Analyze the following ${language} code and return a JSON object with these exact fields:
- "summary": A brief summary of what the code does
- "issues": An array of strings describing potential bugs, anti-patterns, or problems
- "suggestions": An array of strings with improvement suggestions
- "complexity": A string like "Low", "Medium", or "High" describing overall code complexity
- "timeComplexity": A string describing the time complexity using Big-O notation (e.g. "O(n)", "O(n log n)", "O(n²)"). Analyze loops, recursion, and algorithmic patterns to determine this.
- "spaceComplexity": A string describing the space complexity using Big-O notation (e.g. "O(1)", "O(n)"). Analyze memory usage, data structures, and allocations.
- "score": A number from 0-100 rating the overall code quality

Return ONLY valid JSON, no markdown, no explanation.

Code:
\`\`\`${language}
${code}
\`\`\``;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.3,
    max_tokens: 1024
  });

  const content = completion.choices[0]?.message?.content || '{}';

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse AI response');

  const result = JSON.parse(jsonMatch[0]);

  return {
    summary: result.summary || 'No summary available',
    issues: Array.isArray(result.issues) ? result.issues : [],
    suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
    complexity: result.complexity || 'N/A',
    timeComplexity: result.timeComplexity || 'N/A',
    spaceComplexity: result.spaceComplexity || 'N/A',
    score: typeof result.score === 'number' ? Math.min(100, Math.max(0, result.score)) : 50
  };
};

// Estimate time complexity from code patterns
const estimateTimeComplexity = (code) => {
  const lines = code.split('\n');

  // Detect recursion
  const funcNames = [];
  const funcRegex = /function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?\(/g;
  let m;
  while ((m = funcRegex.exec(code)) !== null) {
    funcNames.push(m[1] || m[2]);
  }
  const hasRecursion = funcNames.some(name => {
    const bodyRegex = new RegExp(`\\b${name}\\s*\\(`);
    const occurrences = code.match(bodyRegex);
    return occurrences && occurrences.length > 1;
  });

  // Count nested loop depth
  let maxNestDepth = 0;
  let currentDepth = 0;
  for (const line of lines) {
    if (/\b(for|while)\s*\(/.test(line)) {
      currentDepth++;
      maxNestDepth = Math.max(maxNestDepth, currentDepth);
    }
    // Simple heuristic: closing brace at similar indent reduces depth
    if (currentDepth > 0 && /^\s*\}/.test(line)) {
      currentDepth = Math.max(0, currentDepth - 1);
    }
  }

  // Detect sorting calls
  const hasSorting = /\.sort\(|sorted\(|Arrays\.sort|Collections\.sort/.test(code);

  // Detect hash map / set usage (often O(1) lookup)
  const hasHashStructure = /new\s+(Map|Set|HashMap|HashSet|Dictionary)|{}\s*;|\bdict\b|\bset\b/.test(code);

  // Detect binary search patterns
  const hasBinarySearch = /Math\.floor\s*\(\s*\(.*\+.*\)\s*\/\s*2\s*\)|>> 1|binarySearch|bisect/.test(code);

  if (hasRecursion && maxNestDepth >= 1) return 'O(2ⁿ) — Exponential (recursion with branching)';
  if (maxNestDepth >= 3) return 'O(n³) — Cubic (triple nested loops)';
  if (maxNestDepth === 2) return 'O(n²) — Quadratic (nested loops)';
  if (hasSorting) return 'O(n log n) — Linearithmic (sorting detected)';
  if (hasBinarySearch) return 'O(log n) — Logarithmic (binary search detected)';
  if (hasRecursion) return 'O(n) — Linear (recursive, single branch)';
  if (maxNestDepth === 1) return 'O(n) — Linear (single loop)';
  return 'O(1) — Constant (no loops or recursion)';
};

// Estimate space complexity from code patterns
const estimateSpaceComplexity = (code) => {
  const hasRecursion = (() => {
    const funcNames = [];
    const funcRegex = /function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?\(/g;
    let m;
    while ((m = funcRegex.exec(code)) !== null) {
      funcNames.push(m[1] || m[2]);
    }
    return funcNames.some(name => {
      const bodyRegex = new RegExp(`\\b${name}\\s*\\(`);
      const occurrences = code.match(bodyRegex);
      return occurrences && occurrences.length > 1;
    });
  })();

  // Detect array/list creation inside loops
  const hasArrayInLoop = /\b(for|while)\b[\s\S]{0,200}(new\s+Array|\[\]|\.push|\.append|\.add)/.test(code);

  // Detect new data structure allocations
  const allocations = (code.match(/new\s+(Array|Map|Set|Object|HashMap|ArrayList|LinkedList|TreeMap)|=\s*\[\s*\]|=\s*\{\s*\}/g) || []).length;

  // Detect matrix/2D array patterns
  const has2DArray = /\[\s*\[|Array\(\w+\)\.fill\(.*Array|new\s+int\s*\[.*\]\s*\[/i.test(code);

  if (has2DArray) return 'O(n²) — Quadratic (2D data structure)';
  if (hasRecursion && hasArrayInLoop) return 'O(n) — Linear (recursion stack + allocations)';
  if (hasRecursion) return 'O(n) — Linear (recursion call stack)';
  if (hasArrayInLoop) return 'O(n) — Linear (dynamic allocations in loop)';
  if (allocations > 2) return 'O(n) — Linear (multiple data structures)';
  if (allocations > 0) return 'O(n) — Linear (data structure allocation)';
  return 'O(1) — Constant (no significant allocations)';
};

// Rule-based fallback analysis
const analyzeWithRules = (code, language) => {
  const lines = code.split('\n');
  const totalLines = lines.length;
  const nonEmptyLines = lines.filter(l => l.trim().length > 0).length;
  const issues = [];
  const suggestions = [];

  // Detect long functions (>50 lines)
  let funcStart = -1;
  let funcCount = 0;
  let longFunctions = 0;
  lines.forEach((line, i) => {
    if (/function\s|=>|def\s|public\s|private\s|class\s/.test(line)) {
      if (funcStart !== -1 && (i - funcStart) > 50) {
        longFunctions++;
      }
      funcStart = i;
      funcCount++;
    }
  });
  if (funcStart !== -1 && (totalLines - funcStart) > 50) longFunctions++;

  if (longFunctions > 0) {
    issues.push(`Found ${longFunctions} function(s) exceeding 50 lines — consider refactoring`);
  }

  // Count loops and conditionals
  const loopCount = (code.match(/\b(for|while|do)\b/g) || []).length;
  const condCount = (code.match(/\b(if|else|switch|case)\b/g) || []).length;

  if (loopCount > 5) issues.push(`High loop count (${loopCount}) — may affect performance`);
  if (condCount > 10) issues.push(`High conditional complexity (${condCount} branches)`);

  // Line length check
  const longLines = lines.filter(l => l.length > 120).length;
  if (longLines > 0) {
    suggestions.push(`${longLines} line(s) exceed 120 characters — consider wrapping`);
  }

  // Nested depth heuristic
  const maxIndent = Math.max(...lines.map(l => {
    const match = l.match(/^(\s+)/);
    return match ? match[1].length : 0;
  }));
  if (maxIndent > 16) {
    issues.push('Deep nesting detected — consider extracting helper functions');
  }

  // Console.log / print statements
  const debugStatements = (code.match(/console\.(log|warn|error|debug)|print\(|System\.out/g) || []).length;
  if (debugStatements > 0) {
    suggestions.push(`Found ${debugStatements} debug/print statement(s) — remove before production`);
  }

  // TODO/FIXME comments
  const todoCount = (code.match(/\/\/\s*(TODO|FIXME|HACK|XXX)/gi) || []).length;
  if (todoCount > 0) {
    suggestions.push(`Found ${todoCount} TODO/FIXME comment(s) to address`);
  }

  // Basic readability
  if (totalLines > 0 && nonEmptyLines / totalLines < 0.5) {
    suggestions.push('Code has many empty lines — clean up for readability');
  }

  if (issues.length === 0) suggestions.push('No major issues detected — code looks clean!');

  // Calculate a score
  let score = 85;
  score -= longFunctions * 10;
  score -= Math.max(0, loopCount - 3) * 3;
  score -= Math.max(0, condCount - 5) * 2;
  score -= longLines * 1;
  score -= debugStatements * 3;
  score = Math.min(100, Math.max(0, score));

  const complexity = loopCount + condCount > 10 ? 'High' : loopCount + condCount > 4 ? 'Medium' : 'Low';

  // Estimate time and space complexity
  const timeComplexity = estimateTimeComplexity(code);
  const spaceComplexity = estimateSpaceComplexity(code);

  return {
    summary: `Rule-based analysis of ${totalLines} lines of ${language} code. Found ${funcCount} function(s), ${loopCount} loop(s), and ${condCount} conditional(s).`,
    issues,
    suggestions,
    complexity,
    timeComplexity,
    spaceComplexity,
    score
  };
};

// Main analysis function — tries Groq, falls back to rules
const analyzeCode = async (code, language) => {
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here_or_leave_empty') {
    try {
      const result = await analyzeWithGroq(code, language);
      return { ...result, type: 'ai' };
    } catch (error) {
      console.warn('Groq API failed, falling back to rule-based analysis:', error.message);
    }
  }
  return { ...analyzeWithRules(code, language), type: 'rule-based' };
};

module.exports = { analyzeCode };
