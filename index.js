require('dotenv').config();
const WebSocket = require('ws');
const { SpeechClient } = require('@google-cloud/speech');
const { PassThrough } = require('stream');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const speechClient = new SpeechClient(); // Uses GOOGLE_APPLICATION_CREDENTIALS automatically

wss.on('connection', (ws) => {
  console.log('🟢 Twilio MediaStream connected');

  const audioStream = new PassThrough();

  let lastWords = [];       // array of words from last transcript
  let lastEmittedIndex = -1; // index of last emitted word

  const recognizeStream = speechClient
    .streamingRecognize({
      config: {
        encoding: 'MULAW',
        sampleRateHertz: 8000,
        languageCode: 'en-US',
        enableWordTimeOffsets: false,
        interimResults: true,
      },
      interimResults: true,
    })
    .on('data', (data) => {
      const transcript = data.results[0]?.alternatives[0]?.transcript || '';
      if (!transcript) return;

      const currentWords = transcript.trim().split(/\s+/).filter(Boolean);

      // Find the last index of overlap between lastWords and currentWords
      let overlapIndex = -1;
      for (let i = 0; i < Math.min(lastWords.length, currentWords.length); i++) {
        if (lastWords[i] !== currentWords[i]) break;
        overlapIndex = i;
      }

      // Only emit words after overlapIndex that have not been emitted yet
      for (let i = lastEmittedIndex + 1; i < currentWords.length; i++) {
        // Emit only if word is new (beyond last emitted)
        if (i > overlapIndex) {
          console.log(`🗣️ New Word: ${currentWords[i]}`);
          lastEmittedIndex = i;
        }
      }

      lastWords = currentWords;
    })
    .on('error', (err) => {
      console.error('Google Speech error:', err);
    });

  audioStream.pipe(recognizeStream);

  ws.on('message', (message) => {
    const msg = JSON.parse(message);
    if (msg.event === 'media' && msg.media?.payload) {
      const audio = Buffer.from(msg.media.payload, 'base64');
      audioStream.write(audio);
    }
  });

  ws.on('close', () => {
    console.log('🔴 Twilio MediaStream disconnected');
    audioStream.end();
    recognizeStream.end();
  });
});

server.listen(3000, () => {
  console.log('🧠 Live transcription server listening on port 3000');
});
