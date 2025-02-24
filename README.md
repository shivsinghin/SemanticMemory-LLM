# long Term Semantic Memory For LLMs 🤖

A context-aware AI assistant that builds semantic memory from conversations, enabling personalized and historically-informed responses.

## 🧠 System Architecture

```mermaid
graph TD
    A[User Input] --> B(Express Server);
    B --> C{Vector Embedding};
    C --> D[MongoDB];
    D --> E{Semantic Search};
    E --> F[Context Building];
    F --> G[OpenAI LLM];
    G --> H[Response];
    H --> D;
    H --> I[User Interface];
```

## 🌟 Key Features

### 1. Semantic Memory Storage
- Each conversation is vectorized and stored
- Maintains complete conversation history
- Enables semantic similarity search
- Automatic memory management

### 2. Vector-Based Retrieval System

```mermaid
flowchart LR
    A[New Message] --> B{Generate Embedding};
    B --> C[Vector Search];
    C --> D[Similar Conversations];
    D --> E[Context Building];
    E --> F[Enhanced Response];
```

### 3. Memory Architecture

| Component | Description |
|-----------|-------------|
| Vector Store | MongoDB with vector search capabilities |
| Embedding Model | OpenAI's embedding model |
| Context Window | 50 most relevant conversations |
| Storage Format | User message, Assistant response, Vector embedding, Timestamp |

## 💡 How It Works

```mermaid
sequenceDiagram
    participant U as User
    participant S as Server
    participant V as Vector Engine
    participant DB as MongoDB
    participant AI as OpenAI LLM
    U->>S: Send Message
    S->>V: Generate Embedding
    V->>DB: Search Similar Conversations
    DB->>S: Return Relevant History
    S->>AI: Generate Response with Context
    AI->>S: Return Response
    S->>DB: Store Conversation + Embedding
    S->>U: Send Response
```

## 🔋 System Components

### Frontend
- Real-time chat interface
- Message formatting support
- Timestamp display
- Code syntax highlighting

### Backend
- Express.js server
- MongoDB with vector search
- OpenAI API integration
- Semantic search capabilities

## 📊 Memory Management

### Storage Schema

```mermaid
erDiagram
    CONVERSATION {
        string user_message
        string assistant_response
        array vector_embedding
        date timestamp
    }
```
### Vector Search Process
1. Convert new message to vector embedding
2. Search vector index for similar conversations
3. Retrieve top 50 relevant conversations
4. Build context from retrieved conversations
5. Generate contextually aware response

## 🚀 Performance

### Scalability Features
- Vector index for efficient similarity search
- Automatic cleanup of old conversations
- Optimized MongoDB queries
- Efficient context building

### Memory Efficiency
- Vector dimensionality: Based on OpenAI's embedding model
- Storage optimization: Only essential conversation data
- Index-based retrieval: Fast semantic search
- Automatic data cleanup: Maintains system performance

## 🌐 System Requirements

### Dependencies
- Node.js
- MongoDB
- OpenAI API access
- Modern web browser

### Configuration
- MongoDB connection string
- OpenAI API credentials
- Server port settings
- CORS configuration

## 📬 Contact

* Website: [shivsingh.com](https://shivsingh.com)
* Email: hi@shivsingh.com
* LinkedIn: [Shiv Singh](https://linkedin.com/in/shivsinghin)
