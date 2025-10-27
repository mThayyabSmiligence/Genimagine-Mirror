const getLanguageLabel = (languageCode) => {
    const labels = {
        'en': 'English',
        'es': 'Spanish (Español)',
        'hi': 'Hindi (हिंदी)',
        'fr': 'French (Français)',
        'de': 'German (Deutsch)',
        'ja': 'Japanese (日本語)',
        'zh-cn': 'Chinese (中文)',
        'pt': 'Portuguese (Português)',
        'ar': 'Arabic (العربية)',
        'ta': 'Tamil (தமிழ்)',
        'te': 'Telugu (తెలుగు)'
    };
    return labels[languageCode] || languageCode;
};

module.exports = { getLanguageLabel };