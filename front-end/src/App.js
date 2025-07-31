import React, { useState, useRef } from 'react'
import axios from 'axios'
import "./App.css";

const App = () => {
  const [audioFile, setAudioFile] = useState(null)
  const [transcript, setTranscript] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const handleUpload = async () => {
    if (!audioFile) return

    const formData = new FormData()
    formData.append('audio', audioFile)

  //Sending Request to Backend
  
    try {
      const res = await axios.post('http://localhost:5000/upload', formData)
      setTranscript(res.data.transcript)
    } catch (err) {
      console.error('Upload error:', err)
    }
  }

//Function to Start Recording Audio Using Mediarecorder
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    mediaRecorderRef.current = mediaRecorder
    audioChunksRef.current = []

    mediaRecorder.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data)
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      const file = new File([blob], 'recording.webm', { type: 'audio/webm' })
      setAudioFile(file)
    }

    mediaRecorder.start()
    setIsRecording(true)
  }

//Function for Stop Recording
  const stopRecording = () => {
    mediaRecorderRef.current.stop()
    setIsRecording(false)
  }

  return (
    <div className="text-center p-4 bg-red-200 min-h-screen">
      <h2 className="text-3xl sm:text-4xl font-bold text-blue-800 m-6">Speech-to-Text App</h2>

      
      <div className="flex flex-col items-center mt-6 w-full px-4">
        <div className="flex flex-col sm:flex-row justify-center items-center w-full max-w-2xl gap-4">
          <input
            type="file"
            accept="audio/*"
            className="border rounded border-blue-400 bg-blue-200 p-2 w-full sm:w-auto flex-grow"
            onChange={(e) => setAudioFile(e.target.files[0])}
          />
          
        </div>
        <p className="text-xs text-black-600 mt-2 text-left w-full max-w-2xl">Upload an audio file (suitable formats: mp3)</p>
      </div>

  
      <div className="mt-8 px-4">
        <h3 className="text-lg sm:text-xl text-blue-500 font-bold mb-4">
          Do you want to record your audio? Here you can try
        </h3>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={startRecording}
            disabled={isRecording}
            className="bg-white text-black hover:text-blue-500 px-4 py-2 rounded w-full sm:w-auto"
          >
            <strong>🎙️ Start</strong>
          </button>
          <button
            onClick={stopRecording}
            disabled={!isRecording}
            className="bg-white text-black hover:text-red-500 px-4 py-2 rounded w-full sm:w-auto"
          >
            <strong>🔇 Stop</strong>
          </button>
        </div>
        <button
            className="bg-blue-500 text-black hover:text-white px-4 py-2 rounded w-full sm:w-auto  mt-4"
            onClick={handleUpload}
          >
            Transcribe
          </button>
      </div>

      
      {transcript && (
        <div className="mx-auto mt-6 bg-gray-100 w-full max-w-md h-auto p-4 rounded shadow-sm">
          <h3 className="text-xl font-bold text-blue-400 text-left mb-2">Transcription:</h3>
          <p className="text-left break-words">{transcript}</p>
        </div>
      )}
    </div>
  )
}

export default App
