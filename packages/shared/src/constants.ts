import type { SupportedLanguage } from './types.js';

export const DESIGN_TOKENS = {
  background: '#FAFAF8',
  backgroundAlt: '#F8F9FC',
  textMain: '#171923',
  textSecondary: '#667085',
  primary: '#3157D5',
  success: '#16845B',
  warning: '#B7791F',
  error: '#C43D3D',
  card: '#FFFFFF',
  border: '#E6E8EF',
} as const;

export const SUPPORTED_LANGUAGES: Array<{
  code: SupportedLanguage;
  nativeLabel: string;
  englishLabel: string;
  greeting: string;
}> = [
  {
    code: 'en-IN',
    nativeLabel: 'English',
    englishLabel: 'English',
    greeting: 'Hello! I can help explain the instructions written in your medical document.',
  },
  {
    code: 'ta-IN',
    nativeLabel: 'தமிழ்',
    englishLabel: 'Tamil',
    greeting: 'வணக்கம்! உங்கள் மருத்துவ ஆவணத்தில் உள்ள வழிமுறைகளை எளிமையாக விளக்க நான் உதவுவேன்.',
  },
  {
    code: 'hi-IN',
    nativeLabel: 'हिंदी',
    englishLabel: 'Hindi',
    greeting: 'नमस्ते! मैं आपके मेडिकल दस्तावेज़ में लिखे निर्देशों को आसान भाषा में समझाने में मदद करूँगा।',
  },
];

export const SAFETY_FALLBACK_TEXT: Record<SupportedLanguage, string> = {
  'en-IN':
    'I can only explain what is written in this document. This information is not clear or is not included. Please contact your doctor or hospital to confirm.',
  'ta-IN':
    'இந்த ஆவணத்தில் எழுதப்பட்டிருப்பதை மட்டுமே என்னால் விளக்க முடியும். இந்தத் தகவல் தெளிவாக இல்லை அல்லது இதில் சேர்க்கப்படவில்லை. உறுதிப்படுத்த உங்கள் மருத்துவர் அல்லது மருத்துவமனையைத் தொடர்பு கொள்ளவும்.',
  'hi-IN':
    'मैं केवल इस दस्तावेज़ में लिखी जानकारी ही समझा सकता हूँ। यह जानकारी स्पष्ट नहीं है या इसमें शामिल नहीं है। पुष्टि के लिए कृपया अपने डॉक्टर या अस्पताल से संपर्क करें।',
};

export const UI_NOTICE_TEXT: Record<SupportedLanguage, string> = {
  'en-IN':
    'Chitthi helps explain information written in your document. It does not replace advice from your doctor. Please confirm unclear instructions with your healthcare professional.',
  'ta-IN':
    'உங்கள் ஆவணத்தில் எழுதப்பட்ட தகவல்களைப் புரிந்துகொள்ள சித்தி உதவுகிறது. இது உங்கள் மருத்துவரின் ஆலோசனைக்கு மாற்றல்ல. தெளிவற்ற வழிமுறைகளை உங்கள் மருத்துவரிடம் உறுதிப்படுத்தவும்.',
  'hi-IN':
    'चिट्ठी आपके दस्तावेज़ में लिखी जानकारी को समझाने में मदद करती है। यह आपके डॉक्टर की सलाह का स्थान नहीं लेती। अस्पष्ट निर्देशों की पुष्टि अपने डॉक्टर से करें।',
};

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
] as const;

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
