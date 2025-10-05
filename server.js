const express = require('express');
require('dotenv').config();
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const app = express();
const {connectDB} = require('./database/db');
const session = require('express-session');


const MongoStore = require('connect-mongo');

// Middleware
app.use(cors());
app.use(session({
  secret: 'secret',
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI}),
  resave: false,
  saveUninitialized: false
}));

app.set('view engine', 'ejs');
app.set('views',path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
connectDB();
const port = process.env.PORT
const {User} = require('./database/schema');

// n8n webhook URL for chatbot
const N8N_WEBHOOK_URL = 'https://sythomind.app.n8n.cloud/webhook/chat';

// Store conversation context (in production, use a database)
const conversationContext = new Map();

// Chatbot API endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, sessionId = 'default' } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get or create conversation context
        let context = conversationContext.get(sessionId) || {
            history: [],
            userPreferences: {}
        };

        // Prepare comprehensive data for n8n webhook
        const n8nPayload = {
            message: message,
            sessionId: sessionId,
            context: {
                history: context.history,
                userPreferences: context.userPreferences
            },
            timestamp: new Date().toISOString()
        };

        // Send full context to n8n webhook
        const n8nResponse = await axios.post(N8N_WEBHOOK_URL, n8nPayload, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 100000
        });

        // Extract response from n8n - handle different response formats
        let botReply;
        if (n8nResponse.data) {
            // Check various possible response formats from n8n
            botReply = n8nResponse.data.reply || 
                      n8nResponse.data.response || 
                      n8nResponse.data.output || 
                      n8nResponse.data.text ||
                      (typeof n8nResponse.data === 'string' ? n8nResponse.data : null);
        }
        
        // Fallback if no valid response found
        if (!botReply) {
            botReply = 'I received your message but need more context to provide a helpful response about engineering admissions.';
        }

        // Update conversation context with the new exchange
        context.history.push({
            user: message,
            bot: botReply,
            timestamp: new Date().toISOString()
        });

        // Keep only last 10 messages in history
        if (context.history.length > 10) {
            context.history = context.history.slice(-10);
        }

        conversationContext.set(sessionId, context);

        res.json({
            reply: botReply,
            sessionId: sessionId,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error processing chat message:', error);
        
        // Fallback responses for engineering admission queries
        const fallbackResponses = [
            "I'm having trouble accessing the admission database right now. However, I can help you with general queries about engineering colleges, cutoffs, and admission processes. What specific information are you looking for?",
            "It seems I'm experiencing some technical difficulties. Could you please rephrase your admission-related question? I'm here to help with college predictions, cutoffs, and guidance.",
            "I apologize, but I'm unable to fetch the latest information at the moment. You can still use our college predictor, cutoff tools, or ask me about general admission guidance. How can I assist you?"
        ];
        
        const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        
        res.json({
            reply: randomResponse,
            error: true
        });
    }
});

// Health check endpoint for chatbot
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'EduPath Engineering Admission Chatbot API'
    });
});

// Get conversation history
app.get('/api/conversation/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const context = conversationContext.get(sessionId);
    
    if (!context) {
        return res.status(404).json({ error: 'Conversation not found' });
    }
    
    res.json({
        sessionId,
        history: context.history,
        preferences: context.userPreferences
    });
});

// Clear conversation history
app.delete('/api/conversation/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    conversationContext.delete(sessionId);
    
    res.json({ 
        message: 'Conversation cleared successfully',
        sessionId 
    });
});

app.get('/',(req,res)=>{
  res.render('pcm');
});


const pcmRoutes = require('./routes/pcmroute'); 
app.use('/pcm',pcmRoutes);

const collegePredictorPCMRoutes = require('./routes/collegePredictorPCMroute'); 
app.use('/collegePredictorPCM',collegePredictorPCMRoutes);

// const collegePredictorPCBRoutes = require('./routes/collegePredictorPCBroute'); 
// app.use('/collegePredictorPCB',collegePredictorPCBRoutes);

// const collegePredictorBBABMSRoutes = require('./routes/collegePredictorBBABMSroute'); 
// app.use('/collegePredictorBBABMS',collegePredictorBBABMSRoutes);

// const collegePredictorBCARoutes = require('./routes/collegePredictorBCAroute'); 
// app.use('/collegePredictorBCA',collegePredictorBCARoutes);

// const collegePredictorNeetRoutes = require('./routes/collegePredictorNeetroute'); 
// app.use('/collegePredictorNeet',collegePredictorNeetRoutes);

const collegePagePCMRoutes = require('./routes/collegePagePCMroute'); 
app.use('/collegePagePCM',collegePagePCMRoutes);

// const collegePagePCBRoutes = require('./routes/collegePagePCBroute'); 
// app.use('/collegePagePCB',collegePagePCBRoutes);

// const collegePageBBABMSRoutes = require('./routes/collegePageBBABMSroute'); 
// app.use('/collegePageBBABMS',collegePageBBABMSRoutes);

// const collegePageBCARoutes = require('./routes/collegePageBCAroute'); 
// app.use('/collegePageBCA',collegePageBCARoutes);

// const collegePageNeetRoutes = require('./routes/collegePageNeetroute'); 
// app.use('/collegePageNeet',collegePageNeetRoutes);

const branchwiseCutoffPCMRoutes = require('./routes/branchwiseCutoffPCMroute'); 
app.use('/branchwiseCutoffPCM',branchwiseCutoffPCMRoutes);

app.listen(port,()=>{
    console.log('server listing at port 8080');
})