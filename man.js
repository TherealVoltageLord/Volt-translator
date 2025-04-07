const languages = [
  { code: 'auto', name: 'Auto Detect', flag: '🌍' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  { code: 'pa', name: 'Punjabi', flag: '🇮🇳' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'yo', name: 'Yoruba', flag: '🇳🇬' }
];

// DOM Elements
const textInput = document.getElementById('text-input');
const outputDiv = document.getElementById('output');
const translateBtn = document.getElementById('translateBtn');
const speakBtn = document.getElementById('speakBtn');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const themeToggle = document.getElementById('themeToggle');
const inputBubblesContainer = document.querySelector('#input-bubbles .bubbles-container');
const outputBubblesContainer = document.querySelector('#output-bubbles .bubbles-container');

// State
let currentInputLang = 'auto';
let currentOutputLang = 'fr';
let translatedText = '';
let currentAudioBlob = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
  initializeParticles();
  initializeLanguageBubbles();
  initializeThemeToggle();
  initializeEventListeners();
});

function initializeParticles() {
  if (typeof particlesJS !== 'undefined') {
    particlesJS("particles-js", {
      particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: "#9c27b0" },
        shape: { type: "circle" },
        opacity: { value: 0.5, random: true },
        size: { value: 3, random: true },
        line_linked: { enable: true, distance: 150, color: "#9c27b0", opacity: 0.4, width: 1 },
        move: { enable: true, speed: 2, direction: "none", random: true, straight: false, out_mode: "out" }
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: { enable: true, mode: "repulse" },
          onclick: { enable: true, mode: "push" }
        }
      }
    });
  }
}

function initializeLanguageBubbles() {
  // Input language bubbles (exclude auto detect from output)
  languages.forEach(lang => {
    const bubble = createLanguageBubble(lang, 'input');
    inputBubblesContainer.appendChild(bubble);
    if (lang.code === 'auto') bubble.classList.add('active');
  });
  
  // Output language bubbles (exclude auto detect)
  languages.filter(lang => lang.code !== 'auto').forEach(lang => {
    const bubble = createLanguageBubble(lang, 'output');
    outputBubblesContainer.appendChild(bubble);
    if (lang.code === 'fr') bubble.classList.add('active');
  });
}

function createLanguageBubble(lang, type) {
  const bubble = document.createElement('div');
  bubble.className = 'language-bubble';
  bubble.dataset.langCode = lang.code;
  bubble.innerHTML = `${lang.flag} ${lang.name}`;
  
  bubble.addEventListener('click', () => {
    document.querySelectorAll(`#${type}-bubbles .language-bubble`).forEach(b => {
      b.classList.remove('active');
    });
    bubble.classList.add('active');
    
    if (type === 'input') {
      currentInputLang = lang.code;
    } else {
      currentOutputLang = lang.code;
    }
  });
  
  return bubble;
}

function initializeThemeToggle() {
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const icon = themeToggle.querySelector('i');
    const themeColor = document.body.classList.contains('light-mode') ? '#f5f5f5' : '#0f0c29';
    
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
    document.querySelector('meta[name="theme-color"]').setAttribute('content', themeColor);
    
    localStorage.setItem('themePreference', document.body.classList.contains('light-mode') ? 'light' : 'dark');
  });
  
  // Load saved theme preference
  if (localStorage.getItem('themePreference') === 'light') {
    document.body.classList.add('light-mode');
    themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    document.querySelector('meta[name="theme-color"]').setAttribute('content', '#f5f5f5');
  }
}

function initializeEventListeners() {
  translateBtn.addEventListener('click', translateText);
  speakBtn.addEventListener('click', speakText);
  copyBtn.addEventListener('click', copyText);
  downloadBtn.addEventListener('click', downloadAudio);
}

async function translateText() {
  const text = textInput.value.trim();
  if (!text) {
    showNotification('Please enter text to translate!', 'error');
    return;
  }
  
  translateBtn.disabled = true;
  translateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Translating...';
  
  try {
    const apiUrl = "https://voltagelord-volt-translator.hf.space/translate";
    const requestData = {
      text: text,
      target_lang: currentOutputLang
    };
    
    if (currentInputLang !== 'auto') {
      requestData.source_lang = currentInputLang;
    }
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) throw new Error(`Server responded with ${response.status}`);
    
    const data = await response.json();
    translatedText = data.translated_text || "Translation failed!";
    outputDiv.textContent = translatedText;
  } catch (error) {
    console.error("Translation error:", error);
    translatedText = "Translation failed!";
    outputDiv.textContent = translatedText;
    showNotification('Translation failed. Please try again.', 'error');
  } finally {
    translateBtn.disabled = false;
    translateBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Translate';
  }
}

async function speakText() {
  if (!translatedText || translatedText === "Translation failed!") {
    showNotification('No valid translation to speak!', 'error');
    return;
  }
  
  speakBtn.disabled = true;
  speakBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';
  
  try {
    const apiUrl = "https://voltagelord-volt-translator.hf.space/text-to-speech";
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: translatedText,
        lang: currentOutputLang
      })
    });
    
    if (!response.ok) throw new Error("TTS failed");
    
    currentAudioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(currentAudioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  } catch (error) {
    console.error("TTS error:", error);
    showNotification('Failed to generate speech!', 'error');
  } finally {
    speakBtn.disabled = false;
    speakBtn.innerHTML = '<i class="fas fa-volume-up"></i> Speak';
  }
}

function downloadAudio() {
  if (!currentAudioBlob) {
    showNotification('No audio to download! Generate speech first.', 'error');
    return;
  }
  
  // Generate random 6-digit number
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const fileName = `volt-trans${randomNum}.mp3`;
  
  const url = URL.createObjectURL(currentAudioBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function copyText() {
  if (!translatedText) {
    showNotification('No text to copy!', 'error');
    return;
  }
  
  navigator.clipboard.writeText(translatedText)
    .then(() => showNotification('Text copied to clipboard!', 'success'))
    .catch(err => {
      console.error('Copy failed:', err);
      showNotification('Failed to copy text!', 'error');
    });
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}
