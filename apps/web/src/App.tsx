import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import {
  SUPPORTED_LANGUAGES,
  type DocumentSummary,
  type ExplanationResponse,
  type InstructionUpdateInput,
  type SupportedLanguage,
  type TeachBackQuestionResponse,
  type TeachBackVerifyResponse,
} from '@chitthi/shared';
import { TRANSLATIONS } from './i18n/translations';
import { api } from './services/api';
import { useSpeech } from './hooks/useSpeech';
import { useVoiceInput } from './hooks/useVoiceInput';
import { AppShell } from './components/AppShell';
import { ProcessingTimeline } from './components/ProcessingTimeline';
import { VoiceAssistant } from './components/VoiceAssistant';
import { TeachBackQuestion } from './components/TeachBackQuestion';
import { CaregiverScreen } from './screens/CaregiverScreen';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ReviewPage } from './pages/ReviewPage';
import { ExplanationPage } from './pages/ExplanationPage';

function ChitthiAppRouter() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<SupportedLanguage>('en-IN');
  const [largeText, setLargeText] = useState(false);

  const [document, setDocument] = useState<DocumentSummary | null>(null);
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [processingStep, setProcessingStep] = useState(0);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [lastUploadArgs, setLastUploadArgs] = useState<{ file?: File; demoMode: boolean } | null>(
    null
  );

  // Teach-back state
  const [tbQuestion, setTbQuestion] = useState<TeachBackQuestionResponse | null>(null);
  const [tbAnswer, setTbAnswer] = useState('');
  const [tbResult, setTbResult] = useState<TeachBackVerifyResponse | null>(null);
  const [tbLoading, setTbLoading] = useState(false);
  const [tbError, setTbError] = useState<string | null>(null);

  const strings = TRANSLATIONS[language];
  const { isSpeaking, audioLevel: speechAudioLevel, audioBands: speechAudioBands, speak, stop } =
    useSpeech();

  const {
    isListening: tbIsListening,
    isTranscribing: tbIsTranscribing,
    audioLevel: tbMicLevel,
    audioBands: tbMicBands,
    error: tbTranscriptionError,
    clearError: clearTbTranscriptionError,
    startListening: startTbListening,
    stopListening: stopTbListening,
  } = useVoiceInput({
    language,
    strings,
    onLiveTranscript: (live) => {
      setTbAnswer(live);
    },
  });

  useEffect(() => {
    window.document.documentElement.lang = language;
  }, [language]);

  const loadTeachBack = useCallback(async (docId: string, lang: SupportedLanguage) => {
    setTbLoading(true);
    setTbError(null);
    setTbResult(null);
    setTbAnswer('');
    try {
      const q = await api.createTeachBackQuestion(docId, lang);
      setTbQuestion(q);
    } catch (err) {
      setTbError(err instanceof Error ? err.message : 'Unable to load teach-back question.');
    } finally {
      setTbLoading(false);
    }
  }, []);

  const handleLanguageChange = async (newLang: SupportedLanguage) => {
    if (newLang === language) return;
    stop();
    clearTbTranscriptionError();
    setLanguage(newLang);

    if (document && explanation) {
      const updatedExp = await api.getExplanation(document.id, newLang).catch(() => null);
      if (updatedExp) setExplanation(updatedExp);
      await loadTeachBack(document.id, newLang).catch(() => {});
    }
  };

  const runDocumentFlow = async (args: { file?: File; demoMode: boolean }) => {
    setLastUploadArgs(args);
    navigate('/app/processing');
    setProcessingError(null);
    setProcessingStep(0);

    try {
      const uploaded = await api.uploadDocument({
        file: args.file,
        language,
        demoMode: args.demoMode,
      });
      setProcessingStep(1);

      const processed = await api.processDocument(uploaded.documentId, language);
      setProcessingStep(3);
      setDocument(processed);

      setTimeout(() => {
        navigate('/app/review');
      }, 450);
    } catch (err) {
      setProcessingError(err instanceof Error ? err.message : 'Failed to process document.');
    }
  };

  const handleSaveReview = async (updates: InstructionUpdateInput[]) => {
    if (!document) return;
    const updated = await api.updateInstructions(document.id, updates);
    setDocument(updated);
    const exp = await api.getExplanation(updated.id, language);
    setExplanation(exp);
    navigate('/app/explanation');
  };

  useEffect(() => {
    if (document && explanation && !tbQuestion) {
      loadTeachBack(document.id, language).catch(() => {});
    }
  }, [document, explanation, language, loadTeachBack, tbQuestion]);

  const handleDeleteSession = async () => {
    stop();
    if (document) {
      await api.deleteDocument(document.id).catch(() => {});
    }
    setDocument(null);
    setExplanation(null);
    setTbQuestion(null);
    navigate('/app');
  };

  const playGreeting = () => {
    if (isSpeaking) {
      stop();
      return;
    }
    const greeting = SUPPORTED_LANGUAGES.find((l) => l.code === language)?.greeting ?? '';
    speak(greeting, language);
  };

  const tbActiveAudioLevel = tbIsListening ? tbMicLevel : isSpeaking ? speechAudioLevel : 0;
  const tbActiveAudioBands = tbIsListening
    ? tbMicBands
    : isSpeaking
    ? speechAudioBands
    : undefined;

  return (
    <Routes>
      <Route
        path="/"
        element={
          <LandingPage
            language={language}
            isSpeaking={isSpeaking}
            audioLevel={speechAudioLevel}
            audioBands={speechAudioBands}
            onSelectLanguage={handleLanguageChange}
            onStartApp={() => navigate('/app')}
            onTrySample={() => runDocumentFlow({ demoMode: true })}
            onPlayGreeting={playGreeting}
          />
        }
      />

      <Route
        path="/app/*"
        element={
          <AppShell
            language={language}
            strings={strings}
            onChangeLanguage={handleLanguageChange}
            largeText={largeText}
            onToggleLargeText={() => setLargeText((v) => !v)}
            hasDocument={Boolean(document)}
            hasExplanation={Boolean(explanation)}
            demoMode={document?.demoMode}
          >
            <Routes>
              <Route
                index
                element={
                  <DashboardPage
                    strings={strings}
                    isSpeaking={isSpeaking}
                    audioLevel={speechAudioLevel}
                    audioBands={speechAudioBands}
                    onUploadFile={(file) => runDocumentFlow({ file, demoMode: false })}
                    onTrySample={() => runDocumentFlow({ demoMode: true })}
                    onSpeakIntro={playGreeting}
                  />
                }
              />

              <Route
                path="processing"
                element={
                  <ProcessingTimeline
                    activeStep={processingStep}
                    error={processingError}
                    strings={strings}
                    onCancel={() => navigate('/app')}
                    onRetry={() => lastUploadArgs && runDocumentFlow(lastUploadArgs)}
                  />
                }
              />

              <Route
                path="review"
                element={
                  document ? (
                    <ReviewPage
                      document={document}
                      strings={strings}
                      isSpeaking={isSpeaking}
                      audioLevel={speechAudioLevel}
                      audioBands={speechAudioBands}
                      onSpeak={(text) => speak(text, language)}
                      onStopSpeaking={stop}
                      onSaveAndContinue={handleSaveReview}
                    />
                  ) : (
                    <Navigate to="/app" replace />
                  )
                }
              />

              <Route
                path="explanation"
                element={
                  document && explanation ? (
                    <ExplanationPage
                      document={document}
                      language={language}
                      explanation={explanation}
                      strings={strings}
                      isSpeaking={isSpeaking}
                      audioLevel={speechAudioLevel}
                      audioBands={speechAudioBands}
                      onChangeLanguage={handleLanguageChange}
                      onSpeak={(text, rate) => speak(text, language, rate)}
                      onStopSpeaking={stop}
                      onGoToAssistant={() => {
                        stop();
                        navigate('/app/assistant');
                      }}
                      onGoToTeachBack={() => {
                        stop();
                        loadTeachBack(document.id, language).catch(() => {});
                        navigate('/app/teachback');
                      }}
                    />
                  ) : (
                    <Navigate to="/app" replace />
                  )
                }
              />

              <Route
                path="assistant"
                element={
                  document ? (
                    <VoiceAssistant
                      documentId={document.id}
                      language={language}
                      strings={strings}
                      isSpeaking={isSpeaking}
                      speechAudioLevel={speechAudioLevel}
                      speechAudioBands={speechAudioBands}
                      onSpeak={(text) => speak(text, language)}
                      onStopSpeaking={stop}
                    />
                  ) : (
                    <Navigate to="/app" replace />
                  )
                }
              />

              <Route
                path="teachback"
                element={
                  document ? (
                    <TeachBackQuestion
                      question={tbQuestion}
                      answer={tbAnswer}
                      result={tbResult}
                      loading={tbLoading}
                      error={tbError}
                      isRecording={tbIsListening}
                      isTranscribing={tbIsTranscribing}
                      isSpeaking={isSpeaking}
                      audioLevel={tbActiveAudioLevel}
                      audioBands={tbActiveAudioBands}
                      transcriptionError={tbTranscriptionError}
                      strings={strings}
                      onChangeAnswer={setTbAnswer}
                      onSpeakQuestion={() => {
                        if (isSpeaking) {
                          stop();
                        } else if (tbQuestion) {
                          speak(tbQuestion.questionText, language);
                        }
                      }}
                      onToggleMic={async () => {
                        clearTbTranscriptionError();
                        if (tbIsListening) {
                          const transcript = await stopTbListening();
                          if (transcript) {
                            setTbAnswer(transcript);
                          }
                        } else {
                          stop();
                          await startTbListening();
                        }
                      }}
                      onVerify={async (override) => {
                        if (!tbQuestion) return;
                        const ans = (override ?? tbAnswer).trim();
                        if (!ans) return;
                        setTbError(null);
                        setTbLoading(true);
                        try {
                          const res = await api.verifyTeachBack(
                            tbQuestion.questionId,
                            ans,
                            language
                          );
                          setTbResult(res);
                          speak(res.feedback, language);
                        } catch (err) {
                          setTbError(
                            err instanceof Error ? err.message : strings.transcriptionErrors.generic
                          );
                        } finally {
                          setTbLoading(false);
                        }
                      }}
                      onNextQuestion={() => loadTeachBack(document.id, language)}
                      onGoToCaregiver={() => {
                        stop();
                        navigate('/app/caregiver');
                      }}
                    />
                  ) : (
                    <Navigate to="/app" replace />
                  )
                }
              />

              <Route
                path="caregiver"
                element={
                  document ? (
                    <CaregiverScreen
                      documentId={document.id}
                      language={language}
                      strings={strings}
                      onBack={() => navigate('/app/teachback')}
                      onDeleteSession={handleDeleteSession}
                    />
                  ) : (
                    <Navigate to="/app" replace />
                  )
                }
              />
            </Routes>
          </AppShell>
        }
      />
    </Routes>
  );
}

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <ChitthiAppRouter />
      </BrowserRouter>
    </MotionConfig>
  );
}

export default App;
