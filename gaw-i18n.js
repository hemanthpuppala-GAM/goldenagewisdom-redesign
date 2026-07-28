/* Golden Age Wisdom — language layer.
   Interface strings only. Long teaching passages stay in English until a
   native speaker reviews them: a wrong word in a spiritual text is worse
   than an English one. Add translations here and they appear immediately. */
window.GAW_LANGS = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'hi', label: 'हिं', name: 'हिन्दी' },
  { code: 'te', label: 'తె', name: 'తెలుగు' },
  { code: 'kn', label: 'ಕ', name: 'ಕನ್ನಡ' },
  { code: 'ta', label: 'த', name: 'தமிழ்' },
];

window.GAW_STRINGS = {
  movement:  { en: 'A Spiritual Movement', hi: 'एक आध्यात्मिक आंदोलन', te: 'ఒక ఆధ్యాత్మిక ఉద్యమం', kn: 'ಒಂದು ಆಧ್ಯಾತ್ಮಿಕ ಆಂದೋಲನ', ta: 'ஒரு ஆன்மீக இயக்கம்' },
  signIn:    { en: 'Sign in', hi: 'प्रवेश करें', te: 'ప్రవేశించండి', kn: 'ಪ್ರವೇಶಿಸಿ', ta: 'உள்நுழைக' },
  beginHere: { en: 'Begin here', hi: 'यहाँ से आरंभ', te: 'ఇక్కడ ప్రారంభించండి', kn: 'ಇಲ್ಲಿಂದ ಪ್ರಾರಂಭಿಸಿ', ta: 'இங்கே தொடங்குங்கள்' },
  goBack:    { en: 'Go Back', hi: 'वापस', te: 'వెనుకకు', kn: 'ಹಿಂದೆ', ta: 'பின் செல்' },
  caption:   { en: 'Choose a path · the center breathes with you', hi: 'अपना मार्ग चुनें · केंद्र आपके साथ श्वास लेता है', te: 'మార్గాన్ని ఎంచుకోండి · కేంద్రం మీతో శ్వాసిస్తుంది', kn: 'ಮಾರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ · ಕೇಂದ್ರ ನಿಮ್ಮೊಂದಿಗೆ ಉಸಿರಾಡುತ್ತದೆ', ta: 'பாதையைத் தேர்ந்தெடுங்கள் · மையம் உங்களுடன் சுவாசிக்கிறது' },
  scanJoin:  { en: 'Scan to join', hi: 'जुड़ने के लिए स्कैन करें', te: 'చేరడానికి స్కాన్ చేయండి', kn: 'ಸೇರಲು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ', ta: 'இணைய ஸ்கேன் செய்யுங்கள்' },
  freeMember:{ en: 'Free membership · /join', hi: 'निःशुल्क सदस्यता · /join', te: 'ఉచిత సభ్యత్వం · /join', kn: 'ಉಚಿತ ಸದಸ್ಯತ್ವ · /join', ta: 'இலவச உறுப்பினர் · /join' },

  joinFree:  { en: 'Join free', hi: 'निःशुल्क जुड़ें', te: 'ఉచితంగా చేరండి', kn: 'ಉಚಿತವಾಗಿ ಸೇರಿ', ta: 'இலவசமாக இணையுங்கள்' },
  vpHead:    { en: 'Free live meditation, twice every day', hi: 'निःशुल्क सजीव ध्यान — प्रतिदिन दो बार', te: 'ఉచిత ప్రత్యక్ష ధ్యానం — ప్రతిరోజూ రెండుసార్లు', kn: 'ಉಚಿತ ನೇರ ಧ್ಯಾನ — ಪ್ರತಿದಿನ ಎರಡು ಬಾರಿ', ta: 'இலவச நேரடி தியானம் — தினமும் இருமுறை' },
  vpSub:     { en: 'Ancient wisdom explained with scientific clarity — by Dr Hari Krishna, MD, 25 years of practice. Free, forever.', hi: 'प्राचीन ज्ञान, वैज्ञानिक स्पष्टता के साथ — डॉ. हरि कृष्ण, एमडी, 25 वर्षों की साधना। सदा निःशुल्क।', te: 'ప్రాచీన జ్ఞానం, శాస్త్రీయ స్పష్టతతో — డా. హరి కృష్ణ, MD, 25 సంవత్సరాల సాధన. ఎప్పటికీ ఉచితం.', kn: 'ಪ್ರಾಚೀನ ಜ್ಞಾನ, ವೈಜ್ಞಾನಿಕ ಸ್ಪಷ್ಟತೆಯೊಂದಿಗೆ — ಡಾ. ಹರಿ ಕೃಷ್ಣ, MD, 25 ವರ್ಷಗಳ ಸಾಧನೆ. ಎಂದೆಂದಿಗೂ ಉಚಿತ.', ta: 'பழமையான ஞானம், அறிவியல் தெளிவுடன் — டாக்டர் ஹரி கிருஷ்ணா, MD, 25 ஆண்டு சாதனை. எப்போதும் இலவசம்.' },
  vpCred:    { en: 'Dr Hari Krishna, MD · 25 years of practice · free, forever', hi: 'डॉ. हरि कृष्ण, एमडी · 25 वर्षों की साधना · सदा निःशुल्क', te: 'డా. హరి కృష్ణ, MD · 25 సంవత్సరాల సాధన · ఎప్పటికీ ఉచితం', kn: 'ಡಾ. ಹರಿ ಕೃಷ್ಣ, MD · 25 ವರ್ಷಗಳ ಸಾಧನೆ · ಎಂದೆಂದಿಗೂ ಉಚಿತ', ta: 'டாக்டர் ஹரி கிருஷ்ணா, MD · 25 ஆண்டு சாதனை · எப்போதும் இலவசம்' },
  liveNow:   { en: 'Live now — join the session', hi: 'अभी सजीव — सत्र में जुड़ें', te: 'ఇప్పుడు ప్రత్యక్షం — సెషన్‌లో చేరండి', kn: 'ಈಗ ನೇರ — ಸೆಷನ್‌ಗೆ ಸೇರಿ', ta: 'இப்போது நேரடி — அமர்வில் இணையுங்கள்' },
  liveIn:    { en: 'Next live session in', hi: 'अगला सजीव सत्र', te: 'తదుపరి ప్రత్యక్ష సెషన్', kn: 'ಮುಂದಿನ ನೇರ ಸೆಷನ್', ta: 'அடுத்த நேரடி அமர்வு' },
  liveRest:  { en: 'Sunday is rest · sit on your own', hi: 'रविवार विश्राम · स्वयं बैठें', te: 'ఆదివారం విశ్రాంతి · మీ స్వంతంగా కూర్చోండి', kn: 'ಭಾನುವಾರ ವಿಶ್ರಾಂತಿ · ನೀವೇ ಕೂರಿ', ta: 'ஞாயிறு ஓய்வு · நீங்களே அமருங்கள்' },
  nAbout:    { en: 'About Me', hi: 'परिचय', te: 'పరిచయం', kn: 'ಪರಿಚಯ', ta: 'அறிமுகம்' },
  nWisdom:   { en: 'Wisdom', hi: 'ज्ञान', te: 'జ్ఞానం', kn: 'ಜ್ಞಾನ', ta: 'ஞானம்' },
  nWellness: { en: 'Wellness', hi: 'स्वास्थ्य', te: 'ఆరోగ్యం', kn: 'ಆರೋಗ್ಯ', ta: 'நலம்' },
  nMeditate: { en: 'Meditation', hi: 'ध्यान', te: 'ధ్యానం', kn: 'ಧ್ಯಾನ', ta: 'தியானம்' },
  nEvents:   { en: 'Events', hi: 'कार्यक्रम', te: 'కార్యక్రమాలు', kn: 'ಕಾರ್ಯಕ್ರಮಗಳು', ta: 'நிகழ்வுகள்' },
  nMission:  { en: 'Our Mission', hi: 'हमारा लक्ष्य', te: 'మా లక్ష్యం', kn: 'ನಮ್ಮ ಗುರಿ', ta: 'எங்கள் நோக்கம்' },

  medEyebrow:{ en: 'The Path · Meditation 101', hi: 'साधना · ध्यान 101', te: 'సాధన · ధ్యానం 101', kn: 'ಸಾಧನೆ · ಧ್ಯಾನ 101', ta: 'சாதனை · தியானம் 101' },
  medTitle:  { en: 'Explained simply — and scientifically', hi: 'सरल भाषा में — और वैज्ञानिक ढंग से', te: 'సరళంగా — శాస్త్రీయంగా', kn: 'ಸರಳವಾಗಿ — ಮತ್ತು ವೈಜ್ಞಾನಿಕವಾಗಿ', ta: 'எளிமையாக — அறிவியல் முறையில்' },
  medSub:    { en: "You don't do meditation. You sit, you surrender, and it happens.", hi: 'ध्यान किया नहीं जाता। आप बैठते हैं, समर्पण करते हैं — और वह स्वयं घटित होता है।', te: 'ధ్యానం మీరు చేయరు. కూర్చోండి, సమర్పించండి — అది తనంతట తానే జరుగుతుంది.', kn: 'ಧ್ಯಾನವನ್ನು ನೀವು ಮಾಡುವುದಿಲ್ಲ. ಕೂರಿ, ಶರಣಾಗಿ — ಅದು ತಾನೇ ಘಟಿಸುತ್ತದೆ.', ta: 'தியானத்தை நீங்கள் செய்வதில்லை. அமருங்கள், சரணடையுங்கள் — அது தானே நிகழும்.' },
  challenge: { en: 'Take the 41-day challenge', hi: '41 दिन की साधना आरंभ करें', te: '41 రోజుల సాధన ప్రారంభించండి', kn: '41 ದಿನಗಳ ಸಾಧನೆ ಪ್ರಾರಂಭಿಸಿ', ta: '41 நாள் சாதனையைத் தொடங்குங்கள்' },
  privacy:   { en: 'Privacy', hi: 'गोपनीयता', te: 'గోప్యత', kn: 'ಗೌಪ್ಯತೆ', ta: 'தனியுரிமை' },
  nonProfit: { en: 'A registered non-profit · © 2026', hi: 'एक पंजीकृत गैर-लाभकारी संस्था · © 2026', te: 'నమోదిత లాభాపేక్ష రహిత సంస్థ · © 2026', kn: 'ನೋಂದಾಯಿತ ಲಾಭರಹಿತ ಸಂಸ್ಥೆ · © 2026', ta: 'பதிவுசெய்யப்பட்ட லாப நோக்கமற்ற அமைப்பு · © 2026' },
};

// English is the default. A language is only used if the visitor chose it —
// never guessed from the browser.
window.GAW_LANG = (function () {
  try {
    const saved = localStorage.getItem('gaw_lang');
    if (saved && window.GAW_LANGS.some(l => l.code === saved)) return saved;
  } catch (e) {}
  return 'en';
})();

window.GAW_T = function (key, lang) {
  const s = window.GAW_STRINGS[key];
  if (!s) return key;
  const l = lang || window.GAW_LANG;
  return s[l] || s.en;
};

window.GAW_SET_LANG = function (code) {
  try { localStorage.setItem('gaw_lang', code); } catch (e) {}
  window.GAW_LANG = code;
  try { document.documentElement.lang = code; } catch (e) {}
};
