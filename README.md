# Live Transcription with Twilio MediaStreams & Google Speech-to-Text

## Note from the Author

After extensive testing of various transcription solutions, including OpenAI's Whisper models and Deepgram's Nova 3 API, I found that this setup—using Google Cloud Speech-to-Text in combination with Twilio MediaStreams—delivers the best balance of real-time accuracy, reliability, and low latency.

For reference, the alternatives showed noticeable delays:  
- OpenAI Whisper typically requires around 9 to 11 seconds to upload the audio file via HTTP, process the transcription, and return the results.  
- Deepgram Nova 3 API takes approximately 6 to 7 seconds for a similar workflow.

These benchmarks highlight why the current approach was selected as the optimal solution for live phone call transcription.

---

## Overview

This project is a real-time voice transcription server that connects to Twilio’s MediaStreams API and streams live audio to Google Cloud Speech-to-Text (STT) API. It converts your phone call audio into live text transcripts displayed on the console, word by word.

---

## Features

- Connects to Twilio MediaStreams to capture live call audio in real-time.
- Streams audio to Google Cloud Speech-to-Text using streaming recognition.
- Outputs live interim transcripts and logs new words individually.
- Automatically handles connection, disconnection, and error logging.
- Uses Node.js and WebSocket for real-time streaming.

---

## Demo Output Example

```text
🟢 Twilio MediaStream connected
🗣️ New Word: Hello
🗣️ New Word: this
🗣️ New Word: is
🗣️ New Word: a
🗣️ New Word: test
🔴 Twilio MediaStream disconnected
```

---

## Requirements

- Node.js v16 or newer (this was tested on v22.15.1)
- Google Cloud account with Speech-to-Text API enabled
- Twilio account with a phone number that supports MediaStreams
- Internet connection (server must be reachable by Twilio)
- ngrok or similar tunneling service for local development (optional but recommended)

---

## Setup Instructions

1. Clone this repository
```bash
git clone https://github.com/2192008/twilio-live-transcription.git
```

2. Install dependencies
```bash
npm install
```

3. Google Cloud Speech-to-Text Setup
- Create or select a project at Google Cloud Console.
- Enable the Speech-to-Text API for your project:
https://console.cloud.google.com/apis/api/speech.googleapis.com/overview
- Create a service account with Speech-to-Text permissions.
- Download the JSON credentials file.
- Set the environment variable GOOGLE_APPLICATION_CREDENTIALS pointing to the JSON file path, e.g.:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/credentials.json"
```

Alternatively, create a .env file in the root and add:
```env
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/credentials.json
```

4. Twilio Setup
Buy a phone number with Voice capabilities in your Twilio console.

Set up a TwiML Bin with the following TwiML to enable MediaStreams on incoming calls:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Start>
    <Stream url="wss://your-server-address" />
  </Start>
  <Say>Starting live transcription now.</Say>
  <Pause length="3600" />
</Response>
```
Replace wss://your-server-address with your public WebSocket server URL (e.g., wss://yourdomain.com or your ngrok forwarding address).
In your Twilio phone number configuration, under Voice Configuration/A CALL COMES IN, select TwiML Bin and choose the TwiML Bin you created.

5. Run the server
Make sure your server is reachable publicly or tunneled (e.g., using ngrok):

```bash
node .
```

You should see:
```bash
🧠 Live transcription server listening on port 3000
```

---

## Usage
- Call your Twilio phone number from any phone.
- The server logs connection status and live transcription word by word.
- The transcription is shown in your server console in real time.

---

## ⚠️ Important Notes and Limitations

### Google Cloud Speech-to-Text Pricing

- Google Cloud Speech-to-Text is a paid service.
- New Google Cloud users get 60 minutes of free transcription per month under the free tier.
- Beyond that, pricing is based on the amount of audio processed. See full pricing here: https://cloud.google.com/speech-to-text/pricing
- Usage is metered in seconds of audio processed, so keep this in mind to avoid unexpected charges.

### Twilio MediaStreams Limits and Pricing

- Twilio charges for phone calls as usual.
- MediaStreams feature may have additional costs — check Twilio docs/pricing.
- MediaStreams requires a public WebSocket endpoint (ngrok recommended for dev).

---

## Troubleshooting

### Permission errors from Google Speech:
- Make sure your Google credentials JSON file path is correct and the Speech API is enabled in your Google Cloud project.

### Twilio connection errors:
- Verify your WebSocket server URL is publicly accessible and uses wss:// (secure WebSocket).

### Duplicate transcription words:
- This project already attempts to minimize duplicate words, but some jitter is normal in interim speech results. If you are forwarding the transcription to services like n8n, Zapier, or other platforms (i.e., not keeping it local), you can apply another AI model to clean up, decipher, and rewrite the text before sending it further.

---

# Contributing

- Feel free to open issues or submit pull requests!
- Suggestions for better deduplication, alternative speech APIs, or UI for live transcripts are welcome.




