import React, { useState, useRef } from "react";
import toast from "react-hot-toast";
import axios from "axios";

/**
 * VoiceRecorder Component
 * Allows users to record audio, transcribe it using AI, and populate the message input
 *
 * Features:
 * - Start/stop recording manually
 * - Visual feedback during recording
 * - Transcription via Gemini API
 * - Editable transcription before sending
 * - Error handling and recovery
 */
const VoiceRecorder = ({ onTranscription }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  /**
   * Start recording audio
   */
  const startRecording = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create MediaRecorder instance
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Collect audio data chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      toast.success("🎤 Recording started");
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast.error("Failed to access microphone. Please check permissions.");
    }
  };

  /**
   * Stop recording and transcribe
   */
  const stopRecording = () => {
    if (
      !mediaRecorderRef.current ||
      mediaRecorderRef.current.state === "inactive"
    ) {
      return;
    }

    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;

      mediaRecorder.onstop = async () => {
        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        // Stop all audio tracks
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());

        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result;

          // Transcribe the audio
          await transcribeAudio(base64Audio);
          resolve();
        };

        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.stop();
      setIsRecording(false);
    });
  };

  /**
   * Send audio to backend for transcription
   */
  const transcribeAudio = async (base64Audio) => {
    setIsTranscribing(true);

    try {
      const response = await axios.post("/api/ai/transcribe", {
        audioData: base64Audio,
        mimeType: "audio/webm",
      });

      if (response.data.success) {
        const transcription = response.data.transcription;

        // Check if this is a fallback/error message (contains emoji or specific error phrases)
        const isFallbackMessage =
          transcription.includes("🎤") ||
          transcription.toLowerCase().includes("not supported") ||
          transcription.toLowerCase().includes("failed") ||
          transcription.toLowerCase().includes("manually") ||
          transcription.toLowerCase().includes("coming soon") ||
          transcription.toLowerCase().includes("try again") ||
          transcription.toLowerCase().includes("speak clearly") ||
          transcription.toLowerCase().includes("transcription is not");

        if (isFallbackMessage) {
          // Show the message as a toast instead of filling the input
          toast.error(transcription, {
            duration: 4000,
          });
          // Don't fill the input with error message
          onTranscription("");
        } else {
          // This looks like actual transcribed text - populate the input
          onTranscription(transcription);
          toast.success("✅ Audio transcribed successfully!");
        }
      } else {
        throw new Error(response.data.message || "Transcription failed");
      }
    } catch (error) {
      console.error("Transcription error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to transcribe audio. Please try again.",
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  /**
   * Cancel recording
   */
  const cancelRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingTime(0);
    toast("Recording cancelled", { icon: "🚫" });
  };

  /**
   * Format recording time (seconds to MM:SS)
   */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2">
      {!isRecording && !isTranscribing ? (
        // Start Recording Button
        <button
          onClick={startRecording}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 transition-all duration-200 shadow-lg hover:shadow-purple-500/50"
          title="Record voice message"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
            />
          </svg>
        </button>
      ) : isRecording ? (
        // Recording Controls
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/20 border border-red-500/50 animate-pulse">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-white text-sm font-mono">
            {formatTime(recordingTime)}
          </span>
          <button
            onClick={stopRecording}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full px-3 py-1 text-xs"
            title="Stop and transcribe"
          >
            Stop
          </button>
          <button
            onClick={cancelRecording}
            className="bg-gray-600 hover:bg-gray-700 text-white rounded-full px-3 py-1 text-xs"
            title="Cancel recording"
          >
            Cancel
          </button>
        </div>
      ) : (
        // Transcribing Loader
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600/20 border border-purple-500/50">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
          <span className="text-white text-sm">Transcribing...</span>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
