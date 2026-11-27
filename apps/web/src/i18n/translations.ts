import type { SupportedLanguage } from '@chitthi/shared';

export interface UIStrings {
  appTitle: string;
  tagline: string;
  chooseLanguage: string;
  startWithDocument: string;
  trySampleDocument: string;
  uploadTitle: string;
  uploadSubtitle: string;
  takePhoto: string;
  chooseFile: string;
  acceptedTypes: string;
  privacyNote: string;
  processingSteps: [string, string, string];
  cancel: string;
  retry: string;
  reviewHeader: string;
  reviewSubheader: string;
  confirmAllAndContinue: string;
  statusFromDoc: string;
  statusPleaseCheck: string;
  statusNotFound: string;
  statusConfirmed: string;
  sourceLabel: string;
  pageLabel: string;
  fieldLabels: {
    medicineName: string;
    dosage: string;
    frequency: string;
    timing: string;
    duration: string;
    precautions: string;
    followUp: string;
  };
  voiceHeader: string;
  listen: string;
  replay: string;
  slower: string;
  pause: string;
  askQuestionTitle: string;
  holdToSpeak: string;
  recording: string;
  transcribingLabel: string;
  typeQuestionPlaceholder: string;
  send: string;
  suggestedQuestionsTitle: string;
  suggestedQuestions: string[];
  goToTeachBack: string;
  teachBackHeader: string;
  teachBackSubheader: string;
  answerPlaceholder: string;
  checkAnswer: string;
  nextQuestion: string;
  quickOptions: string[];
  goToCaregiver: string;
  caregiverHeader: string;
  caregiverConsentPrompt: string;
  grantConsentButton: string;
  denyConsentButton: string;
  consentDeniedNotice: string;
  copySummary: string;
  copied: string;
  deleteSession: string;
  demoModeBadge: string;
  back: string;
  largeTextToggle: string;
  micDeniedMsg: string;
  dashboardGreeting: string;
  dashboardSubgreeting: string;
  trySampleVoiceCta: string;
  robotHello: string;
  robotHelloSub: string;
  talkToChitthiTitle: string;
  talkToChitthiSubtitle: string;
  youAskedLabel: string;
  groundedStatus: string;
  needsClinicianStatus: string;
  askByVoiceBtn: string;
  reviewRobotMessage: string;
  reviewRobotSubmessageUnclear: string;
  reviewRobotSubmessageConfirmed: string;
  nav: {
    home: string;
    documents: string;
    review: string;
    explanation: string;
    assistant: string;
    teachback: string;
    caregiver: string;
  };
  transcriptionErrors: {
    emptyAudio: string;
    noSpeech: string;
    micDenied: string;
    micUnsupported: string;
    serverUnavailable: string;
    generic: string;
  };
  robotStatusLabels: {
    idle: string;
    greeting: string;
    listening: string;
    thinking: string;
    speaking: string;
    success: string;
    warning: string;
  };
}

export const TRANSLATIONS: Record<SupportedLanguage, UIStrings> = {
  'en-IN': {
    appTitle: 'Chitthi',
    tagline: 'Understand your care instructions',
    chooseLanguage: 'Choose your preferred language',
    startWithDocument: 'Start with a document',
    trySampleDocument: 'Try sample document',
    uploadTitle: 'Add your prescription or discharge summary',
    uploadSubtitle: 'We only explain what is written in your document.',
    takePhoto: 'Take a photo',
    chooseFile: 'Choose PDF or image',
    acceptedTypes: 'Accepted: PDF, JPG, PNG up to 10 MB',
    privacyNote: 'Your document is processed temporarily and deleted when you end your session.',
    processingSteps: [
      'Reading document',
      'Finding instructions',
      'Preparing explanation',
    ],
    cancel: 'Cancel',
    retry: 'Try again',
    reviewHeader: 'Please check these details',
    reviewSubheader: 'Confirm or edit each item before listening to your explanation.',
    confirmAllAndContinue: 'Confirm & hear explanation',
    statusFromDoc: 'From document',
    statusPleaseCheck: 'Please check',
    statusNotFound: 'Not found',
    statusConfirmed: 'Confirmed',
    sourceLabel: 'Source quote',
    pageLabel: 'Page',
    fieldLabels: {
      medicineName: 'Medicine',
      dosage: 'Dosage',
      frequency: 'How often',
      timing: 'When / Meal timing',
      duration: 'How long',
      precautions: 'Precautions',
      followUp: 'Follow-up',
    },
    voiceHeader: 'Your care instructions',
    listen: 'Listen',
    replay: 'Replay',
    slower: 'Slower',
    pause: 'Pause',
    askQuestionTitle: 'Ask a question about your document',
    holdToSpeak: 'Tap to speak',
    recording: 'Listening... Tap to stop',
    transcribingLabel: 'Transcribing speech...',
    typeQuestionPlaceholder: 'Or type your question here...',
    send: 'Ask',
    suggestedQuestionsTitle: 'Suggested questions',
    suggestedQuestions: [
      'When should I take Paracetamol?',
      'When should I take Azithromycin?',
      'When is my follow-up visit?',
    ],
    goToTeachBack: 'Quick check-in (Teach-back)',
    teachBackHeader: 'Let’s check what you understood.',
    teachBackSubheader: 'One simple question to make sure everything feels clear.',
    answerPlaceholder: 'Speak or type your answer...',
    checkAnswer: 'Check answer',
    nextQuestion: 'Ask another question',
    quickOptions: ['After food', 'Before food', '1 tablet', '5 days'],
    goToCaregiver: 'Caregiver summary',
    caregiverHeader: 'Caregiver summary',
    caregiverConsentPrompt:
      'Do you give permission to create a summary of your confirmed instructions for a family member or caregiver?',
    grantConsentButton: 'Yes, create summary',
    denyConsentButton: 'No, keep private',
    consentDeniedNotice: 'Summary not created. Your instructions remain private.',
    copySummary: 'Copy summary',
    copied: 'Copied!',
    deleteSession: 'Delete session & start over',
    demoModeBadge: 'Demo mode (synthetic sample)',
    back: 'Back',
    largeTextToggle: 'Large text',
    micDeniedMsg: 'Microphone access was denied. You can type your question below instead.',
    dashboardGreeting: 'Hello! Let’s understand your health instructions.',
    dashboardSubgreeting: 'I’m here to help you understand your medical documents.',
    trySampleVoiceCta: 'Try Sample & Start Voice',
    robotHello: 'Hi! I’m Chitthi.',
    robotHelloSub: 'Upload your document and I’ll help you understand it.',
    talkToChitthiTitle: 'Talk to Chitthi',
    talkToChitthiSubtitle: 'Ask me about your confirmed medical instructions in Tamil, English, or Hindi.',
    youAskedLabel: 'You asked',
    groundedStatus: 'Grounded in your document',
    needsClinicianStatus: 'Needs clinician confirmation',
    askByVoiceBtn: 'Ask Questions by Voice',
    reviewRobotMessage: 'Please review these instructions before I explain them.',
    reviewRobotSubmessageUnclear: 'Some fields are marked UNCLEAR. I will never guess missing values.',
    reviewRobotSubmessageConfirmed: 'Only confirmed details are used for explanations and Q&A.',
    nav: {
      home: 'Home',
      documents: 'My Documents',
      review: 'Review Details',
      explanation: 'AI Explanation',
      assistant: 'AI Assistant',
      teachback: 'Understanding Check',
      caregiver: 'Caregiver Summary',
    },
    transcriptionErrors: {
      emptyAudio: 'No speech was detected. Please tap the mic and speak clearly.',
      noSpeech: 'I did not hear any words. Please try speaking closer to the microphone.',
      micDenied: 'Microphone permission was denied. Please allow mic access or type below.',
      micUnsupported: 'Voice recording is not supported in this browser. Please type your question.',
      serverUnavailable: 'Speech transcription service could not process the audio. Please type your question or check your connection.',
      generic: 'Could not transcribe your speech. Please try again or type below.',
    },
    robotStatusLabels: {
      idle: 'Ready to help',
      greeting: 'Welcome',
      listening: 'Listening to you',
      thinking: 'Checking document',
      speaking: 'Speaking',
      success: 'Understood',
      warning: 'Needs attention',
    },
  },
  'ta-IN': {
    appTitle: 'சித்தி (Chitthi)',
    tagline: 'உங்கள் மருத்துவ வழிமுறைகளை எளிமையாகப் புரிந்துகொள்ளுங்கள்',
    chooseLanguage: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
    startWithDocument: 'ஆவணத்தைச் சேர்க்கவும்',
    trySampleDocument: 'மாதிரி ஆவணத்தை முயற்சிக்கவும்',
    uploadTitle: 'உங்கள் மருந்துச் சீட்டு அல்லது டிஸ்சார்ஜ் சுருக்கத்தைச் சேர்க்கவும்',
    uploadSubtitle: 'ஆவணத்தில் எழுதப்பட்டுள்ளதை மட்டுமே நாங்கள் விளக்குவோம்.',
    takePhoto: 'புகைப்படம் எடுக்கவும்',
    chooseFile: 'PDF அல்லது படத்தைத் தேர்ந்தெடுக்கவும்',
    acceptedTypes: 'ஏற்கப்படுபவை: PDF, JPG, PNG (அதிகபட்சம் 10 MB)',
    privacyNote: 'உங்கள் ஆவணம் தற்காலிகமாக மட்டுமே பயன்படுத்தப்படும்; அமர்வு முடிந்ததும் நீக்கப்படும்.',
    processingSteps: [
      'ஆவணத்தைப் படிக்கிறது',
      'வழிமுறைகளைக் கண்டறிகிறது',
      'விளக்கத்தைத் தயாரிக்கிறது',
    ],
    cancel: 'ரத்து செய்',
    retry: 'மீண்டும் முயற்சிக்கவும்',
    reviewHeader: 'இந்த விவரங்களைச் சரிபார்க்கவும்',
    reviewSubheader: 'விளக்கத்தைக் கேட்பதற்கு முன் ஒவ்வொரு தகவலையும் உறுதிப்படுத்தவும்.',
    confirmAllAndContinue: 'உறுதிப்படுத்தி விளக்கத்தைக் கேட்கவும்',
    statusFromDoc: 'ஆவணத்தில் உள்ளது',
    statusPleaseCheck: 'சரிபார்க்கவும்',
    statusNotFound: 'காணப்படவில்லை',
    statusConfirmed: 'உறுதிப்படுத்தப்பட்டது',
    sourceLabel: 'ஆதார வரி',
    pageLabel: 'பக்கம்',
    fieldLabels: {
      medicineName: 'மருந்து',
      dosage: 'அளவு',
      frequency: 'எத்தனை முறை',
      timing: 'எப்போது / உணவு நேரம்',
      duration: 'எத்தனை நாட்கள்',
      precautions: 'கவனிக்க வேண்டியவை',
      followUp: 'தொடர் பரிசோதனை',
    },
    voiceHeader: 'உங்கள் மருத்துவ வழிமுறைகள்',
    listen: 'கேட்கவும்',
    replay: 'மீண்டும் கேட்கவும்',
    slower: 'மெதுவாக',
    pause: 'நிறுத்து',
    askQuestionTitle: 'உங்கள் ஆவணம் பற்றி கேள்வி கேளுங்கள்',
    holdToSpeak: 'பேச தட்டவும்',
    recording: 'கேட்கிறது... நிறுத்த தட்டவும்',
    transcribingLabel: 'பேச்சை உரையாக மாற்றுகிறது...',
    typeQuestionPlaceholder: 'அல்லது உங்கள் கேள்வியை இங்கே தட்டச்சு செய்யவும்...',
    send: 'கேள்',
    suggestedQuestionsTitle: 'பரிந்துரைக்கப்பட்ட கேள்விகள்',
    suggestedQuestions: [
      'பாராசிட்டமால் மாத்திரை எப்போது சாப்பிட வேண்டும்?',
      'அசித்ரோமைசின் உணவு நேரத்தில் எப்போது எடுக்க வேண்டும்?',
      'அடுத்த மருத்துவமனை பரிசோதனை எப்போது?',
    ],
    goToTeachBack: 'சரிபார்ப்பு கேள்வி',
    teachBackHeader: 'நீங்கள் புரிந்துகொண்டதைச் சரிபார்ப்போம்.',
    teachBackSubheader: 'எல்லாம் தெளிவாக உள்ளதா எனப் பார்க்க ஒரு எளிய கேள்வி.',
    answerPlaceholder: 'பேசவும் அல்லது பதிலை தட்டச்சு செய்யவும்...',
    checkAnswer: 'பதிலைச் சரிபார்',
    nextQuestion: 'மற்றொரு கேள்வி',
    quickOptions: ['உணவுக்குப் பிறகு', 'உணவுக்கு முன்', '1 மாத்திரை', '5 நாட்கள்'],
    goToCaregiver: 'பராமரிப்பாளர் சுருக்கம்',
    caregiverHeader: 'பராமரிப்பாளர் சுருக்கம்',
    caregiverConsentPrompt:
      'நீங்கள் உறுதிப்படுத்திய வழிமுறைகளின் சுருக்கத்தை உங்கள் குடும்பத்தினர் அல்லது பராமரிப்பாளருக்காக உருவாக்க அனுமதி அளிக்கிறீர்களா?',
    grantConsentButton: 'ஆம், சுருக்கத்தை உருவாக்கு',
    denyConsentButton: 'வேண்டாம், தனிப்பட்டதாக இருக்கட்டும்',
    consentDeniedNotice: 'சுருக்கம் உருவாக்கப்படவில்லை. உங்கள் தகவல்கள் பாதுகாப்பாக உள்ளன.',
    copySummary: 'சுருக்கத்தை நகலெடு',
    copied: 'நகலெடுக்கப்பட்டது!',
    deleteSession: 'தகவல்களை நீக்கி மீண்டும் தொடங்கவும்',
    demoModeBadge: 'மாதிரி முறை (செயற்கை ஆவணம்)',
    back: 'பின்செல்',
    largeTextToggle: 'பெரிய எழுத்து',
    micDeniedMsg: 'மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டது. கீழே உங்கள் கேள்வியைத் தட்டச்சு செய்யலாம்.',
    dashboardGreeting: 'வணக்கம்! உங்கள் மருத்துவ வழிமுறைகளைப் புரிந்துகொள்வோம்.',
    dashboardSubgreeting: 'உங்கள் மருத்துவ ஆவணங்களை எளிமையாக விளக்க நான் உதவுவேன்.',
    trySampleVoiceCta: 'மாதிரி ஆவணத்துடன் பேசத் தொடங்குங்கள்',
    robotHello: 'வணக்கம்! நான் சித்தி.',
    robotHelloSub: 'உங்கள் ஆவணத்தைச் சேர்க்கவும், நான் எளிமையாக விளக்குகிறேன்.',
    talkToChitthiTitle: 'சித்தியுடன் பேசுங்கள்',
    talkToChitthiSubtitle: 'உங்கள் மருத்துவ வழிமுறைகள் பற்றி தமிழ், ஆங்கிலம் அல்லது இந்தியில் கேளுங்கள்.',
    youAskedLabel: 'நீங்கள் கேட்டது',
    groundedStatus: 'உங்கள் ஆவணத்திலிருந்து',
    needsClinicianStatus: 'மருத்துவர் உறுதிப்படுத்தல் தேவை',
    askByVoiceBtn: 'குரல் மூலம் கேள்வி கேட்கவும்',
    reviewRobotMessage: 'நான் விளக்குவதற்கு முன் இந்த விவரங்களைச் சரிபார்க்கவும்.',
    reviewRobotSubmessageUnclear: 'சில தகவல்கள் தெளிவாக இல்லை. தெரியாத விவரங்களை நான் யூகிக்க மாட்டேன்.',
    reviewRobotSubmessageConfirmed: 'உறுதிப்படுத்தப்பட்ட விவரங்கள் மட்டுமே விளக்கத்திற்குப் பயன்படுத்தப்படும்.',
    nav: {
      home: 'முகப்பு',
      documents: 'என் ஆவணங்கள்',
      review: 'விவரங்களைச் சரிபார்',
      explanation: 'AI விளக்கம்',
      assistant: 'குரல் உதவியாளர்',
      teachback: 'புரிதல் சரிபார்ப்பு',
      caregiver: 'பராமரிப்பாளர் சுருக்கம்',
    },
    transcriptionErrors: {
      emptyAudio: 'குரல் எதுவும் பதிவாகவில்லை. மைக் பட்டனைத் தட்டித் தெளிவாகப் பேசவும்.',
      noSpeech: 'பேச்சு எதுவும் கேட்கவில்லை. மைக்ரோஃபோனுக்கு அருகில் தெளிவாகப் பேசவும்.',
      micDenied: 'மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டது. அனுமதி வழங்கவும் அல்லது கீழே தட்டச்சு செய்யவும்.',
      micUnsupported: 'இந்த உலாவியில் குரல் பதிவு ஆதரிக்கப்படவில்லை. கீழே தட்டச்சு செய்யவும்.',
      serverUnavailable: 'குரலை உரையாக மாற்ற முடியவில்லை. தயவுசெய்து உங்கள் கேள்வியைத் தட்டச்சு செய்யவும்.',
      generic: 'பேச்சைப் புரிந்துகொள்ள முடியவில்லை. மீண்டும் முயற்சிக்கவும் அல்லது தட்டச்சு செய்யவும்.',
    },
    robotStatusLabels: {
      idle: 'உதவத் தயார்',
      greeting: 'வணக்கம்',
      listening: 'உங்கள் குரலைக் கேட்கிறது',
      thinking: 'ஆவணத்தைச் சரிபார்க்கிறது',
      speaking: 'பேசுகிறது',
      success: 'சரியாகப் புரிந்தது',
      warning: 'கவனம் தேவை',
    },
  },
  'hi-IN': {
    appTitle: 'चिट्ठी (Chitthi)',
    tagline: 'अपने इलाज के निर्देशों को आसानी से समझें',
    chooseLanguage: 'अपनी भाषा चुनें',
    startWithDocument: 'दस्तावेज़ से शुरू करें',
    trySampleDocument: 'नमूना दस्तावेज़ देखें',
    uploadTitle: 'अपना पर्चा या डिस्चार्ज सारांश जोड़ें',
    uploadSubtitle: 'हम केवल वही समझाते हैं जो आपके दस्तावेज़ में लिखा है।',
    takePhoto: 'फोटो खींचें',
    chooseFile: 'PDF या फोटो चुनें',
    acceptedTypes: 'स्वीकार्य: PDF, JPG, PNG (अधिकतम 10 MB)',
    privacyNote: 'आपका दस्तावेज़ अस्थायी रूप से प्रोसेस होता है और सत्र समाप्त होने पर हटा दिया जाता है।',
    processingSteps: [
      'दस्तावेज़ पढ़ा जा रहा है',
      'निर्देश खोजे जा रहे हैं',
      'सरल व्याख्या तैयार हो रही है',
    ],
    cancel: 'रद्द करें',
    retry: 'फिर से प्रयास करें',
    reviewHeader: 'कृपया इन विवरणों की जाँच करें',
    reviewSubheader: 'व्याख्या सुनने से पहले प्रत्येक जानकारी की पुष्टि या सुधार करें।',
    confirmAllAndContinue: 'पुष्टि करें और व्याख्या सुनें',
    statusFromDoc: 'दस्तावेज़ से',
    statusPleaseCheck: 'कृपया जाँचें',
    statusNotFound: 'नहीं मिला',
    statusConfirmed: 'पुष्टि की गई',
    sourceLabel: 'मूल पंक्ति',
    pageLabel: 'पृष्ठ',
    fieldLabels: {
      medicineName: 'दवा का नाम',
      dosage: 'खुराक (मात्रा)',
      frequency: 'कितनी बार',
      timing: 'कब / भोजन का समय',
      duration: 'कितने दिन',
      precautions: 'सावधानियाँ',
      followUp: 'अगली जाँच',
    },
    voiceHeader: 'आपके देखभाल निर्देश',
    listen: 'सुनें',
    replay: 'फिर से सुनें',
    slower: 'धीरे सुनें',
    pause: 'रोकें',
    askQuestionTitle: 'अपने दस्तावेज़ के बारे में प्रश्न पूछें',
    holdToSpeak: 'बोलने के लिए टैप करें',
    recording: 'सुन रहे हैं... रोकने के लिए टैप करें',
    transcribingLabel: 'आवाज़ को टेक्स्ट में बदला जा रहा है...',
    typeQuestionPlaceholder: 'या यहाँ अपना प्रश्न लिखें...',
    send: 'पूछें',
    suggestedQuestionsTitle: 'सुझाए गए प्रश्न',
    suggestedQuestions: [
      'मुझे पैरासिटामोल की गोली कब लेनी है?',
      'अज़िथ्रोमाइसिन खाने के बाद लेनी है या पहले?',
      'मेरी अगली अस्पताल जाँच कब है?',
    ],
    goToTeachBack: 'त्वरित जाँच (टीच-बैक)',
    teachBackHeader: 'आइए देखें आपने क्या समझा।',
    teachBackSubheader: 'सब कुछ स्पष्ट है या नहीं, यह देखने के लिए एक सरल प्रश्न।',
    answerPlaceholder: 'बोलें या अपना उत्तर लिखें...',
    checkAnswer: 'उत्तर जाँचें',
    nextQuestion: 'अगला प्रश्न',
    quickOptions: ['खाने के बाद', 'खाने से पहले', '1 गोली', '5 दिन'],
    goToCaregiver: 'देखभालकर्ता सारांश',
    caregiverHeader: 'देखभालकर्ता सारांश',
    caregiverConsentPrompt:
      'क्या आप परिवार के किसी सदस्य या देखभालकर्ता के लिए अपने पुष्टि किए गए निर्देशों का सारांश बनाने की अनुमति देते हैं?',
    grantConsentButton: 'हाँ, सारांश बनाएँ',
    denyConsentButton: 'नहीं, निजी रखें',
    consentDeniedNotice: 'सारांश नहीं बनाया गया। आपके निर्देश निजी हैं।',
    copySummary: 'सारांश कॉपी करें',
    copied: 'कॉपी हो गया!',
    deleteSession: 'सत्र हटाएँ और फिर शुरू करें',
    demoModeBadge: 'डेमो मोड (नमूना दस्तावेज़)',
    back: 'वापस',
    largeTextToggle: 'बड़ा टेक्स्ट',
    micDeniedMsg: 'माइक्रोफ़ोन की अनुमति नहीं मिली। आप नीचे अपना प्रश्न लिख सकते हैं।',
    dashboardGreeting: 'नमस्ते! आइए आपके इलाज के निर्देशों को समझें।',
    dashboardSubgreeting: 'मैं आपके मेडिकल दस्तावेज़ को आसान भाषा में समझाने के लिए यहाँ हूँ।',
    trySampleVoiceCta: 'नमूना देखें और आवाज़ से बात करें',
    robotHello: 'नमस्ते! मैं चिट्ठी हूँ।',
    robotHelloSub: 'अपना दस्तावेज़ अपलोड करें और मैं इसे आसानी से समझाऊँगा।',
    talkToChitthiTitle: 'चिट्ठी से बात करें',
    talkToChitthiSubtitle: 'अपने पुष्टि किए गए निर्देशों के बारे में तमिल, अंग्रेज़ी या हिंदी में पूछें।',
    youAskedLabel: 'आपने पूछा',
    groundedStatus: 'दस्तावेज़ पर आधारित',
    needsClinicianStatus: 'डॉक्टर से पुष्टि आवश्यक',
    askByVoiceBtn: 'आवाज़ से प्रश्न पूछें',
    reviewRobotMessage: 'मेरे समझाने से पहले कृपया इन निर्देशों की जाँच करें।',
    reviewRobotSubmessageUnclear: 'कुछ विवरण अस्पष्ट हैं। मैं कभी भी अधूरी जानकारी का अनुमान नहीं लगाऊँगा।',
    reviewRobotSubmessageConfirmed: 'केवल पुष्टि किए गए विवरण ही व्याख्या और प्रश्नोत्तर में उपयोग होते हैं।',
    nav: {
      home: 'होम',
      documents: 'मेरे दस्तावेज़',
      review: 'विवरण जाँचें',
      explanation: 'AI व्याख्या',
      assistant: 'AI सहायक',
      teachback: 'समझ की जाँच',
      caregiver: 'देखभालकर्ता सारांश',
    },
    transcriptionErrors: {
      emptyAudio: 'कोई आवाज़ रिकॉर्ड नहीं हुई। कृपया माइक दबाकर स्पष्ट रूप से बोलें।',
      noSpeech: 'कोई शब्द सुनाई नहीं दिया। कृपया माइक्रोफ़ोन के पास स्पष्ट बोलें।',
      micDenied: 'माइक्रोफ़ोन की अनुमति नहीं मिली। अनुमति दें या नीचे टाइप करें।',
      micUnsupported: 'इस ब्राउज़र में वॉइस रिकॉर्डिंग समर्थित नहीं है। कृपया नीचे अपना प्रश्न लिखें।',
      serverUnavailable: 'आवाज़ को टेक्स्ट में नहीं बदला जा सका। कृपया अपना प्रश्न टाइप करें।',
      generic: 'आपकी आवाज़ समझी नहीं जा सकी। कृपया फिर से बोलें या नीचे लिखें।',
    },
    robotStatusLabels: {
      idle: 'मदद के लिए तैयार',
      greeting: 'नमस्ते',
      listening: 'आपकी बात सुन रहा हूँ',
      thinking: 'दस्तावेज़ जाँच रहा हूँ',
      speaking: 'बोल रहा हूँ',
      success: 'सही समझा',
      warning: 'ध्यान आवश्यक',
    },
  },
};
