import React, { Component } from 'react';
import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';
import axios from 'axios';
import '../App.css'; // Ensure Tailwind CSS is imported in this file

class SpeechText extends Component {
    constructor(props) {
        super(props);
        this.state = {
            displayText: 'Click the button and speak into your microphone...',
            recognizing: false,
            finalText: '',
            transcriptionData: null,
        };

        this.recognizer = null;
    }

    async sttFromMic() {
        console.log('Starting speech-to-text process...');
        try {
            const tokenObj = await this.getTokenOrRefresh();
            console.log('Token and region obtained:', tokenObj);

            const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.token, tokenObj.region);
            speechConfig.speechRecognitionLanguage = 'en-US';
            console.log('Speech configuration created.');

            const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
            console.log('Audio configuration created.');

            this.recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);
            console.log('Speech recognizer created.');

            this.recognizer.recognizing = (s, e) => {
                console.log(`RECOGNIZING: Text=${e.result.text}`);
                this.setState({
                    displayText: `Recognizing: ${e.result.text}`
                });
            };

            this.recognizer.recognized = (s, e) => {
                if (e.result.reason === speechsdk.ResultReason.RecognizedSpeech) {
                    console.log(`RECOGNIZED: Text=${e.result.text}`);
                    this.setState({
                        displayText: `Recognized: ${e.result.text}`,
                        finalText: e.result.text,
                    });
                } else if (e.result.reason === speechsdk.ResultReason.NoMatch) {
                    console.log('No speech could be recognized.');
                    this.setState({
                        displayText: 'No speech could be recognized.'
                    });
                }
            };

            this.recognizer.canceled = (s, e) => {
                console.error(`CANCELED: Reason=${e.reason}`);
                if (e.reason === speechsdk.CancellationReason.Error) {
                    console.error(`CANCELED: ErrorDetails=${e.errorDetails}`);
                }
                this.recognizer.stopContinuousRecognitionAsync();
                this.setState({
                    recognizing: false,
                    displayText: 'Speech recognition canceled.'
                });
            };

            this.recognizer.sessionStopped = (s, e) => {
                console.log('Session stopped.');
                this.recognizer.stopContinuousRecognitionAsync();
                this.setState({
                    recognizing: false,
                    displayText: 'Session stopped.'
                });
            };

            this.setState({
                recognizing: true,
                displayText: 'speak into your microphone...'
            });

            this.recognizer.startContinuousRecognitionAsync(
                () => console.log('Continuous recognition started.'),
                err => console.error('Error starting continuous recognition:', err)
            );
        } catch (error) {
            console.error('Error in sttFromMic:', error);
            this.setState({
                displayText: 'ERROR: Unable to initialize speech recognition. Check console for details.'
            });
            console.log('Error display text updated.');
        }
    }

    stopRecognition = async () => {
        if (this.recognizer) {
            this.recognizer.stopContinuousRecognitionAsync(
                async () => {
                    console.log('Continuous recognition stopped.');
                    this.setState({
                        recognizing: false,
                        displayText: 'Recognition stopped.'
                    });
                    await this.transcribeText(this.state.finalText);
                },
                err => console.error('Error stopping continuous recognition:', err)
            );
        }
    }

    async getTokenOrRefresh() {
        console.log('Retrieving token and region...');

        const url = 'https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/azure_speech_token/';
        const headers = {
            'accept': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI1MjMyMjg5LCJpYXQiOjE3MjI2NDAyODksImp0aSI6ImRkYjMxYzE5YTM5OTQ1NTQ4N2U4OTkyNzY4ZTNmYTVkIiwidXNlcl9pZCI6Mn0.aufC0O4xYcOn83QYENRPuzvGRIs--9tQVS19NRdSSAM',
            'X-CSRFToken': 'a7qpLMEgwohDQ81EcI69c8aiiAH0Zotm4WawpYdI55vz6mwIWWLWtW15GNrKomIr'
        };

        try {
            const response = await axios.get(url, { headers });
            return { token: response.data.token, region: response.data.region };
        } catch (err) {
            console.error('There was an error authorizing your speech key:', err);
            throw new Error('Error fetching token');
        }
    }

    async transcribeText(finalText) {
        console.log('Sending final text to transcription API...');
        const url = 'https://voiceamplifiedbackendserver.eastus.cloudapp.azure.com/transcribe/';
        const headers = {
            'accept': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI1MjMyMjg5LCJpYXQiOjE3MjI2NDAyODksImp0aSI6ImRkYjMxYzE5YTM5OTQ1NTQ4N2U4OTkyNzY4ZTNmYTVkIiwidXNlcl9pZCI6Mn0.aufC0O4xYcOn83QYENRPuzvGRIs--9tQVS19NRdSSAM',
            'Content-Type': 'multipart/form-data',
            'X-CSRFToken': 'a7qpLMEgwohDQ81EcI69c8aiiAH0Zotm4WawpYdI55vz6mwIWWLWtW15GNrKomIr'
        };
        const formData = new FormData();
        formData.append('transcription_text', finalText);

        try {
            const response = await axios.post(url, formData, { headers });
            this.setState({ transcriptionData: response.data });
            console.log('Transcription API response:', response.data);
        } catch (err) {
            console.error('There was an error sending the final text to the transcription API:', err);
        }
    }

    render() {
        const { recognizing, displayText, transcriptionData } = this.state;
        return (
            <div className="App min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
                <header className="App-header bg-black text-orange-500 p-6 rounded-lg shadow-lg">
                    <h1 className="text-3xl mb-4">Speech to Text - Streaming</h1>
                    <p className="mb-4">{displayText}</p>
                    <div className="mb-4">
                        <button
                            onClick={() => this.sttFromMic()}
                            disabled={recognizing}
                            className="bg-orange-500 text-white px-4 py-2 rounded mr-2 disabled:bg-gray-500"
                        >
                            Start Speaking
                        </button>
                        <button
                            onClick={this.stopRecognition}
                            disabled={!recognizing}
                            className="bg-orange-500 text-white px-4 py-2 rounded disabled:bg-gray-500"
                        >
                            Stop Speaking
                        </button>
                    </div>
                    {transcriptionData && (
                        <div className="transcription-result bg-white text-black p-4 rounded-lg shadow-lg mt-4 w-full max-w-md">
                            <h2 className="text-2xl mb-2 text-orange-500">Transcription Result</h2>
                            <div className="text-left">
                                <div className="mb-2">
                                    <span className="font-bold">ID:</span> {transcriptionData.SpeechThread.id}
                                </div>
                                <div className="mb-2">
                                    <span className="font-bold">Status:</span> {transcriptionData.SpeechThread.status}
                                </div>
                                <div className="mb-2">
                                    <span className="font-bold">Text:</span> {transcriptionData.SpeechThread.text}
                                </div>
                                <div className="mb-2">
                                    <span className="font-bold">Title:</span> {transcriptionData.SpeechThread.title}
                                </div>
                                <div className="mb-2">
                                    <span className="font-bold">Created At:</span> {new Date(transcriptionData.SpeechThread.created_at).toLocaleString()}
                                </div>
                                <div className="mb-2">
                                    <span className="font-bold">Updated At:</span> {new Date(transcriptionData.SpeechThread.updated_at).toLocaleString()}
                                </div>
                                {/* Add more fields as necessary */}
                            </div>
                        </div>
                    )}
                </header>
            </div>
        );
    }
}

export default SpeechText;
