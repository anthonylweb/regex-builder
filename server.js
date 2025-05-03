require('dotenv').config();
const express = require('express');
const path = require('path');
const OpenAI = require('openai'); // This is how you import it in CommonJS
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

// Initialize OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure to set this in your environment
});

app.get('/', (req, res) => {
    res.render('index'); // renders index.ejs
  });

// Form submission route
app.post('/submit', async (req, res) => {
    const regreq = req.body.regexrequest;
    const includeExplanation = req.body.includeExplanation === 'on';
  
    if (!regreq) {
      return res.status(400).send('No regex request provided.');
    }
  
    try {
      const messages = [
        {
          role: 'system',
          content: includeExplanation
  ? `You are a regular expression expert. First, output only the regex pattern on a single line. Then, on the next lines, explain the pattern in plain English using full sentences. Do not wrap in backticks or code blocks. Do not use Markdown. Use plain text only.`
  : `You are a regular expression expert. Return only the regex pattern and nothing else.`,

        },
        {
          role: 'user',
          content: `Create a regular expression that satisfies the following requirement: ${regreq}`,
        },
      ];
  
      const completion = await client.chat.completions.create({
        model: 'gpt-4o',
        messages,
      });
  
      const raw = completion.choices[0].message.content.trim();

      // Remove code blocks, backticks, and unnecessary whitespace
      const cleaned = raw
        .replace(/^```[a-zA-Z]*\n?/, '')
        .replace(/```$/, '')
        .replace(/^`|`$/g, '')
        .trim();
      
      // Assume the regex pattern is on the first line
      const [patternLine, ...explanationLines] = cleaned.split('\n');
      const regexPattern = patternLine.trim();
      const explanation = explanationLines.join('\n').trim();


        //console.log('Rendering result with:', { regex: cleaned, explained: includeExplanation });


        res.render('result', {
            regexPattern,
            explanation,
          });
    } catch (err) {
      console.error(err);
      res.status(500).send('An error occurred while generating the regex.');
    }
  });

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
