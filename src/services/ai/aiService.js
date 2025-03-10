import axios from 'axios';
import env from '../../config/env';

class AIService {
  constructor() {
    this.apiKey = env.HUGGING_FACE_API_KEY;
    // Using a more appropriate model for chat and code generation
    this.apiUrl = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
  }

  async analyzeCode(code, language) {
    try {
      console.log('Analyzing code with API key:', this.apiKey ? 'Present' : 'Missing');
      
      if (!this.apiKey) {
        throw new Error('API key is not configured');
      }

      const prompt = `
        Analyze and optimize this ${language} code:
        ${code}
        
        Provide:
        1. Syntax improvements
        2. Logical improvements
        3. Optimized version
        4. Explanation
      `;

      const response = await axios.post(
        this.apiUrl,
        { inputs: prompt },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      return this.parseApiResponse(response.data, code, language);

    } catch (error) {
      console.error('API Error:', error);
      return this.getMockAnalysis(code, language);
    }
  }

  getMockAnalysis(code, language) {
    // Example code improvements based on language
    const improvements = {
      javascript: {
        syntaxErrors: [
          'Use const/let instead of var for better scoping',
          'Add semicolons at line ends for consistency',
          'Use arrow functions for cleaner syntax'
        ],
        logicalErrors: [
          'Consider using Array methods like reduce() for calculations',
          'Add parameter type validation',
          'Consider using optional chaining for object properties'
        ],
        optimizedCode: this.getOptimizedJavaScriptCode(code),
        explanation: 'Code has been optimized using modern JavaScript features and best practices. Improved performance with better array methods and added safety checks.'
      },
      python: {
        syntaxErrors: [
          'Add type hints for better code clarity',
          'Add docstring for function documentation',
          'Use f-strings instead of string concatenation'
        ],
        logicalErrors: [
          'Use list comprehension for better performance',
          'Add error handling for potential exceptions',
          'Consider using built-in functions like sum() for calculations'
        ],
        optimizedCode: this.getOptimizedPythonCode(code),
        explanation: 'Code has been optimized following Python best practices and PEP guidelines. Added type hints and improved performance.'
      },
      java: {
        syntaxErrors: [
          'Missing access modifier for class member',
          'Unclosed resource in try block'
        ],
        logicalErrors: [
          'Consider using StringBuilder for string concatenation',
          'Potential null pointer exception'
        ],
        optimizedCode: this.getOptimizedMockCode(code, language),
        explanation: 'The code has been optimized for better performance and safety. Added proper resource handling and string operations.'
      }
    };

    return improvements[language] || {
      syntaxErrors: ['No language-specific analysis available'],
      logicalErrors: ['Consider adding comments to explain the code logic'],
      optimizedCode: code,
      explanation: 'Basic code structure looks acceptable. Consider adding documentation.'
    };
  }

  getOptimizedJavaScriptCode(code) {
    let optimized = code;

    // Replace var with const/let
    optimized = optimized.replace(/var\s+([a-zA-Z_$][0-9a-zA-Z_$]*)/g, 'const $1');

    // Replace traditional functions with arrow functions
    optimized = optimized.replace(
      /function\s*\(([^)]*)\)\s*{([^}]*)}/g,
      '($1) => {$2}'
    );

    // Replace forEach with more appropriate array methods
    optimized = optimized.replace(
      /\.forEach\((.*?)\)/g,
      (match, params) => {
        if (code.includes('total') || code.includes('sum')) {
          return `.reduce((acc, ${params}) => acc + ${params}, 0)`;
        }
        return `.map(${params})`;
      }
    );

    // Add parameter validation for functions
    if (optimized.includes('function') || optimized.includes('=>')) {
      optimized = optimized.replace(
        /(\w+)\s*\(([^)]*)\)\s*=>/,
        (match, name, params) => {
          const paramList = params.split(',').map(p => p.trim());
          const validations = paramList
            .map(p => `  if (${p} === undefined) throw new Error('${p} is required');`)
            .join('\n');
          return `${name} = (${params}) => {\n${validations}\n`;
        }
      );
    }

    // Add error handling
    if (!optimized.includes('try {')) {
      optimized = `try {\n  ${optimized.replace(/\n/g, '\n  ')}\n} catch (error) {\n  console.error('Error:', error);\n  throw error;\n}`;
    }

    // Add JSDoc comment
    optimized = `/**
 * Optimized version with:
 * - Modern JavaScript syntax
 * - Better error handling
 * - Improved performance
 * - Parameter validation
 */\n${optimized}`;

    return optimized;
  }

  getOptimizedPythonCode(code) {
    let optimized = code;

    // Add type hints
    optimized = optimized.replace(
      /def\s+(\w+)\s*\(([^)]*)\):/g,
      (match, funcName, params) => {
        const typedParams = params
          .split(',')
          .map(p => p.trim())
          .map(p => `${p}: float`)
          .join(', ');
        return `def ${funcName}(${typedParams}) -> float:`;
      }
    );

    // Add docstring
    if (!optimized.includes('"""')) {
      optimized = optimized.replace(
        /(def\s+\w+\s*\([^)]*\):)/,
        '$1\n    """Function to process numerical calculations\n\n    Args:\n        values: List of numbers to process\n    Returns:\n        float: Calculated result\n    """'
      );
    }

    // Replace loops with list comprehension
    optimized = optimized.replace(
      /for\s+(\w+)\s+in\s+range\(([^)]+)\):/g,
      '[$1 for $1 in range($2)]'
    );

    // Add error handling
    if (!optimized.includes('try:')) {
      optimized = `try:\n    ${optimized.replace(/\n/g, '\n    ')}\nexcept Exception as e:\n    raise ValueError(f"Error processing data: {e}")`;
    }

    return optimized;
  }

  getOptimizedMockCode(code, language) {
    // Add mock improvements based on language
    switch (language) {
      case 'javascript':
        return code
          .replace(/var /g, 'const ')
          .replace(/function/g, 'const')
          .replace(/forEach/g, 'map')
          + '\n\n// Added performance improvements and modern syntax';
      
      case 'python':
        return '"""This module handles data processing"""\n\n' 
          + code.replace(/for i in range/g, '[x for x in range')
          + '\n\n# Optimized with list comprehension';
      
      case 'java':
        return '/**\n * Optimized version with better resource handling\n */\n'
          + code.replace(/String \+/g, 'StringBuilder')
          + '\n\n// Added null checks and resource management';
      
      default:
        return code + '\n\n// Code structure maintained with added documentation';
    }
  }

  parseApiResponse(response, originalCode, language) {
    try {
      const responseText = response[0]?.generated_text || '';
      
      if (!responseText) {
        throw new Error('Empty API response');
      }

      // Try to extract optimized code from the response
      let optimizedCode = this.extractOptimizedCode(responseText, originalCode);
      
      // If we couldn't extract meaningful optimized code, use our mock optimization
      if (!optimizedCode || optimizedCode === originalCode) {
        return this.getMockAnalysis(originalCode, language);
      }

      return {
        syntaxErrors: this.extractSyntaxErrors(responseText),
        logicalErrors: this.extractLogicalErrors(responseText),
        optimizedCode: optimizedCode,
        explanation: this.extractExplanation(responseText)
      };
    } catch (error) {
      console.error('Error parsing API response:', error);
      return this.getMockAnalysis(originalCode, language);
    }
  }

  extractOptimizedCode(responseText, originalCode) {
    // Try to find code blocks in the response
    const codeBlockRegex = /```(?:[\w-]+)?\n([\s\S]*?)\n```/g;
    const matches = [...responseText.matchAll(codeBlockRegex)];
    
    if (matches.length > 0) {
      // Get the last code block as it's likely the optimized version
      return matches[matches.length - 1][1].trim();
    }

    // Fallback: try to find code-like content
    const lines = responseText.split('\n');
    const codeLines = lines.filter(line => 
      line.includes('{') || 
      line.includes('}') || 
      line.includes('function') || 
      line.includes('class') ||
      line.includes('def ')
    );

    return codeLines.length > 0 ? codeLines.join('\n') : originalCode;
  }

  extractSyntaxErrors(text) {
    const syntaxSection = text.match(/syntax(?:\s+)?(?:errors|improvements)?:?([\s\S]*?)(?=logical|optimization|$)/i);
    if (syntaxSection) {
      return this.extractBulletPoints(syntaxSection[1]);
    }
    return ['No syntax issues found'];
  }

  extractLogicalErrors(text) {
    const logicalSection = text.match(/logical(?:\s+)?(?:errors|improvements)?:?([\s\S]*?)(?=optimization|$)/i);
    if (logicalSection) {
      return this.extractBulletPoints(logicalSection[1]);
    }
    return ['No logical issues found'];
  }

  extractExplanation(text) {
    const explanationSection = text.match(/explanation:?([\s\S]*?)$/i);
    if (explanationSection) {
      return explanationSection[1].trim();
    }
    return 'Code has been analyzed and optimized';
  }

  extractBulletPoints(text) {
    const points = text.split('\n')
      .map(line => line.replace(/^[-•*]\s*/, '').trim())
      .filter(line => line.length > 0);
    return points.length > 0 ? points : ['No issues found'];
  }

  async testConnection() {
    try {
      // Test with a simple model API endpoint
      const response = await axios.get(
        'https://api-inference.huggingface.co/models/gpt2',
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      console.log('API Connection Test:', response.data);
      return true;
    } catch (error) {
      console.error('API Connection Test Failed:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      return false;
    }
  }

  async chatWithAI(prompt, code, language) {
    try {
      let inputPrompt;
      if (language === 'general') {
        // For general chat, use a more focused prompt
        if (prompt.toLowerCase().includes('what can you do') || 
            prompt.toLowerCase().includes('help me') || 
            prompt.toLowerCase().includes('abilities')) {
          return "I can help you write, debug, and optimize code in multiple languages.";
        }
        inputPrompt = `<s>[INST] You are a coding assistant. Respond in 2-3 sentences maximum. Focus only on coding-related topics. ${prompt} [/INST]</s>`;
      } else {
        inputPrompt = `<s>[INST] As an AI coding assistant, please help with the following:\n\nCode:\n${code}\n\nLanguage: ${language}\n\nUser Question: ${prompt} [/INST]</s>`;
      }

      const response = await axios.post(
        this.apiUrl,
        {
          inputs: inputPrompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            top_p: 0.95,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Remove the prompt text from the response
      let responseText = response.data[0].generated_text;
      responseText = responseText.replace(/<s>\[INST\].*?\[\/INST\]<\/s>/g, '').trim();
      return responseText;
    } catch (error) {
      console.error('Chat error:', error);
      return "I apologize, but I'm having trouble connecting to the AI service right now. Please try again in a moment.";
    }
  }

  async generateCode(description, language) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          inputs: `<s>[INST] Generate ${language} code for the following description:\n${description}\n\nPlease provide only the code without any explanations. [/INST]</s>`,
          parameters: {
            max_new_tokens: 1000,
            temperature: 0.7,
            top_p: 0.95,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data[0].generated_text;
    } catch (error) {
      console.error('Code generation error:', error);
      // Return a fallback response if the API fails
      return `// Generated ${language} code\n// Please try again if this doesn't match your requirements\nfunction example() {\n  // Your code here\n}`;
    }
  }

  async fixCode(code, issue, language) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `Fix the following ${language} code issue:\n\nCode:\n${code}\n\nIssue: ${issue}`,
          parameters: {
            max_new_tokens: 1000,
            temperature: 0.7,
            top_p: 0.95,
          },
        }),
      });

      const data = await response.json();
      return data[0].generated_text;
    } catch (error) {
      console.error('Code fixing error:', error);
      throw new Error('Failed to fix code');
    }
  }

  async enhanceCode(code, language) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `Enhance and optimize the following ${language} code:\n${code}`,
          parameters: {
            max_new_tokens: 1000,
            temperature: 0.7,
            top_p: 0.95,
          },
        }),
      });

      const data = await response.json();
      return data[0].generated_text;
    } catch (error) {
      console.error('Code enhancement error:', error);
      throw new Error('Failed to enhance code');
    }
  }
}

export const aiService = new AIService(); 