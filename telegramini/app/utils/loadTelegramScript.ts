const loadTelegramScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.getElementById('telegram-web-app')) {
        resolve();
        return;
      }
  
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-web-app.js';
      script.id = 'telegram-web-app';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Telegram Web App script'));
  
      document.body.appendChild(script);
    });
  };
  
  export default loadTelegramScript;
  