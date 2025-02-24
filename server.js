require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const OpenAI = require('openai');
const path = require('path');

//===================================
// Express Configuration
//===================================
const app = express();
const port = 3000;

const cors = require('cors');
app.use(cors());

//===================================
// OpenAI Configuration
//===================================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//===================================
// MongoDB Configuration
//===================================
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

//===================================
// Middleware Setup
//===================================
app.use(express.json());
app.use(express.static('public'));

//===================================
// Route Handlers
//===================================
// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle chat messages
app.post('/chat', async (req, res) => {
  const { message } = req.body;

  try {
    await client.connect();
    const database = client.db("chatbot_db");
    const chats = database.collection("chats");

    // Generate embeddings for the user's message
    const embeddingResponse = await openai.embeddings.create({
      model: process.env.OPENAI_EMBEDDING_MODEL,
      input: message,
    });

    const [{ embedding }] = embeddingResponse.data;

    // Search for similar past conversations using vector search
    console.log('Searching for similar conversations...');
    const similarChats = await chats.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: embedding,
          numCandidates: 10000,
          limit: 50
        }
      },
      {
        $project: {
          user: 1,
          assistant: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]).toArray();

    console.log('Similar chats found:', similarChats.length);

    // Prepare context from similar chats
    const context = similarChats.map(chat => `User: ${chat.user}\nAssistant: ${chat.assistant}`).join('\n\n');

    // Generate response using GPT-3.5-turbo
    console.log('Generating response...');
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_CHAT_MODEL,
      messages: [
        { role: 'system', content: 'You are Jarvis, a highly intelligent and efficient personal AI companion. Utilize the conversation history to provide personalized, context-aware responses. Be concise, limiting answers to 40 words max. Prioritize accuracy, relevance, and a friendly, helpful tone. Adapt your personality to the users preferences over time.' },
        { role: 'user', content: `Conversation history:\n${context}\n\nUser: ${message}\nAssistant:` },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;

    // Save the new conversation with embeddings
    console.log('Saving conversation...');
    await chats.insertOne({
      user: message,
      assistant: response,
      embedding: embedding,
      timestamp: new Date(),
    });

    console.log('Response generated and saved successfully');
    res.json({ response });
  } catch (error) {
    console.error('Error processing chat:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  } finally {
    await client.close();
  }
});

// Fetch chat history
app.get('/chat-history', async (req, res) => {
  try {
    await client.connect();
    const database = client.db("chatbot_db");
    const chats = database.collection("chats");

    // Fetch the most recent 50 chat messages
    const chatHistory = await chats.find({})
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    res.json(chatHistory.reverse()); // Reverse to get oldest first
  } catch (error) {
    console.error('Detailed error in /chat-history:', error);
    res.status(500).json({ error: 'An error occurred while fetching chat history.' });
  }
});

//===================================
// Database Utility Functions
//===================================
// Create vector search index
async function createEmbeddingIndex() {
  try {
    await client.connect();
    const database = client.db("chatbot_db");
    const chats = database.collection("chats");

    const indexExists = await chats.indexExists("vector_index");
    if (!indexExists) {
      await chats.createIndex(
        { embedding: "2dsphere" },
        { name: "vector_index" }
      );
      console.log("Vector index created on embedding field");
    } else {
      console.log("Vector index already exists on embedding field");
    }
  } catch (error) {
    console.error("Error checking/creating index:", error);
  } finally {
    await client.close();
  }
}

// Cleanup old conversations
async function cleanupOldConversations() {
  try {
    await client.connect();
    const database = client.db("chatbot_db");
    const chats = database.collection("chats");

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    await chats.deleteMany({ timestamp: { $lt: oneWeekAgo } });
    console.log("Cleaned up old conversations");
  } catch (error) {
    console.error("Error cleaning up old conversations:", error);
  } finally {
    await client.close();
  }
}

//===================================
// Server Initialization
//===================================
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  createEmbeddingIndex();
});

// Scheduled cleanup
setInterval(cleanupOldConversations, 24 * 60 * 60 * 1000);