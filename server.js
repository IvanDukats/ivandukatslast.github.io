const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 3000;

// Подключение к MongoDB
const url = 'mongodb://localhost:27017'; // или ваша MongoDB Atlas URL
const dbName = 'contensus';
let db;

MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if (err) {
        console.error(err);
        return;
    }
    db = client.db(dbName);
    console.log(`Connected to database: ${dbName}`);
});

app.use(bodyParser.json());
app.use(cors());

// Обработка POST-запроса для добавления сообщения
app.post('/addMessage', (req, res) => {
    const { sessionId, message } = req.body;
    const newMessage = { sessionId, message, likes: 0 };

    db.collection('messages').insertOne(newMessage, (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Failed to add message' });
            return;
        }
        res.status(200).json({ success: true });
    });
});

// Обработка POST-запроса для лайка сообщения
app.post('/likeMessage', (req, res) => {
    const { sessionId, messageIndex } = req.body;

    db.collection('messages').findOneAndUpdate(
        { sessionId, _id: ObjectId(messageIndex) },
        { $inc: { likes: 1 } },
        (err, result) => {
            if (err) {
                res.status(500).json({ error: 'Failed to like message' });
                return;
            }
            res.status(200).json({ success: true });
        }
    );
});

// Обработка POST-запроса для отмены лайка сообщения
app.post('/unlikeMessage', (req, res) => {
    const { sessionId, messageIndex } = req.body;

    db.collection('messages').findOneAndUpdate(
        { sessionId, _id: ObjectId(messageIndex) },
        { $inc: { likes: -1 } },
        (err, result) => {
            if (err) {
                res.status(500).json({ error: 'Failed to unlike message' });
                return;
            }
            res.status(200).json({ success: true });
        }
    );
});

// Обработка GET-запроса для получения сообщений
app.get('/getMessages', (req, res) => {
    const { sessionId } = req.query;

    db.collection('messages').find({ sessionId }).toArray((err, messages) => {
        if (err) {
            res.status(500).json({ error: 'Failed to get messages' });
            return;
        }
        res.status(200).json({ messages });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});



