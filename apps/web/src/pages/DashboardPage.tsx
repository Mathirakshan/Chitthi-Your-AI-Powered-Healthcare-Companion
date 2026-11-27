import { Mic } from 'lucide-react';
import type { UIStrings } from '../i18n/translations';
import { DocumentUploader } from '../components/DocumentUploader';
import { ChitthiRobot } from '../components/ChitthiRobot';
import { RobotSpeechBubble } from '../components/RobotSpeechBubble';
import { VoiceVisualizer } from '../components/VoiceVisualizer';

interface DashboardPageProps {
  strings: UIStrings;
  isSpeaking: boolean;
  audioLevel?: number;
  audioBands?: number[];
  onUploadFile: (file: File) => void;
  onTrySample: () => void;
  onSpeakIntro: () => void;
}

export function DashboardPage({
  strings,
  isSpeaking,
  audioLevel = 0,
  audioBands,
  onUploadFile,
  onTrySample,
  onSpeakIntro,
}: DashboardPageProps) {
  const robotState = isSpeaking ? 'speaking' : 'greeting';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          {strings.dashboardGreeting}
        </h1>
        <p className="mt-1.5 text-base text-muted">{strings.dashboardSubgreeting}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <DocumentUploader
            strings={strings}
            onUploadFile={onUploadFile}
            onTrySample={onTrySample}
          />
        </div>

        {/* Compact AI Robot Card */}
        <div className="flex flex-col items-center justify-between rounded-card border border-stroke bg-white p-5 text-center shadow-soft sm:p-6">
          <ChitthiRobot
            state={robotState}
            size="md"
            audioLevel={audioLevel}
            audioBands={audioBands}
            statusLabel={strings.robotStatusLabels[robotState]}
            onClick={onSpeakIntro}
          />

          <div className="mt-1">
            <VoiceVisualizer
              active={isSpeaking}
              mode="speaking"
              audioLevel={audioLevel}
              audioBands={audioBands}
            />
          </div>

          <div className="mt-3 w-full">
            <RobotSpeechBubble
              message={strings.robotHello}
              submessage={strings.robotHelloSub}
              onListen={onSpeakIntro}
              listenLabel={strings.listen}
            />
          </div>

          <button
            type="button"
            onClick={onTrySample}
            className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 text-sm font-semibold text-primary hover:bg-primary/10"
          >
            <Mic className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{strings.trySampleVoiceCta}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
