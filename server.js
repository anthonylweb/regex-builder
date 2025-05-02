require('dotenv').config();
const express = require('express');
const path = require('path');
const OpenAI = require('openai'); // This is how you import it in CommonJS

const app = express();

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Initialize OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure to set this in your environment
});

// Form submission route
app.post('/submit', async (req, res) => {
  const regreq = req.body.regexrequest; // Make sure your HTML form uses this name

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a regular expression expert. Return a regular expression based on the input you are given.',
        },
        {
          role: 'user',
          content: `Can you create a regular expression that does the following: ${regreq}`,
        },
      ],
    });

    const regex = completion.choices[0].message.content;

    res.send(`<h2>Your regular expression is:</h2><pre>${regex}</pre>`);
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while generating the regular expression.');
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
