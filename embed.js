(function() {
    // --- КОНФИГУРАЦИЯ ВСТРАИВАЕМОГО СКРИПТА ---
    const WIDGET_HOST_URL = 'http://localhost:1234'; // URL, где хостится widget-content (index.html)
    // Важно: Для реального использования замените localhost на URL вашего хостинга!
    const LAUNCHER_BG_COLOR = '#1f2937'; // Цвет кнопки-лаунчера (темно-серый из референса)
    const IFRAME_WIDTH = '350px';      
    const IFRAME_HEIGHT = '500px';     
    // --- КОНЕЦ КОНФИГУРАЦИИ ---

    let iframeVisible = false;
    let launcherButton = null;
    let widgetIframe = null;

    function createLauncherButton() {
        const button = document.createElement('button');
        button.id = 'vapi-widget-launcher';
        button.setAttribute('aria-label', 'Открыть чат');
        button.style.position = 'fixed';
        button.style.bottom = '20px';
        button.style.right = '20px';
        button.style.width = '56px';
        button.style.height = '56px';
        button.style.backgroundColor = LAUNCHER_BG_COLOR;
        button.style.border = 'none';
        button.style.borderRadius = '50%'; 
        button.style.color = 'white';
        button.style.cursor = 'pointer';
        button.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        button.style.zIndex = '99998';
        button.style.display = 'flex';
        button.style.justifyContent = 'center';
        button.style.alignItems = 'center';
        button.style.padding = '0'; // Убедимся, что нет лишних отступов
        button.style.overflow = 'hidden'; // Скроем все, что выходит за пределы
        
        // Иконка SVG чата (более стандартная)
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: white;">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
        `;
        button.addEventListener('click', toggleIframe);
        document.body.appendChild(button);
        launcherButton = button;
    }

    function createIframe() {
        const iframe = document.createElement('iframe');
        iframe.id = 'vapi-widget-iframe';
        iframe.allow = "microphone; autoplay";
        iframe.style.border = 'none';
        iframe.style.position = 'fixed';
        iframe.style.bottom = '90px'; 
        iframe.style.right = '20px'; 
        iframe.style.width = '370px'; 
        iframe.style.height = '500px'; 
        iframe.style.borderRadius = '0.5rem'; 
        iframe.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        iframe.style.overflow = 'hidden';
        iframe.style.opacity = '0'; // Начальная прозрачность для анимации
        iframe.style.transform = 'translateY(20px)'; // Начальное положение для анимации
        iframe.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
        iframe.style.zIndex = '9999';
        iframe.style.display = 'none'; // <-- Изначально скрываем iframe

        iframe.src = `${WIDGET_HOST_URL}/widget-content/index.html`;
        document.body.appendChild(iframe);
        widgetIframe = iframe;
    }

    function toggleIframe() {
        iframeVisible = !iframeVisible;
        if (iframeVisible) {
            widgetIframe.style.display = 'block'; // <-- Показываем перед анимацией
            // Небольшая задержка, чтобы браузер успел обработать display: block перед transition
            setTimeout(() => {
                widgetIframe.style.opacity = '1';
                widgetIframe.style.transform = 'translateY(0)';
            }, 10); 

            launcherButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: white;">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            `; 
        } else {
            widgetIframe.style.opacity = '0';
            widgetIframe.style.transform = 'translateY(20px)';
            // Скрываем display после завершения анимации
            setTimeout(() => {
                widgetIframe.style.display = 'none'; // <-- Скрываем после анимации
            }, 300); // Должно совпадать с длительностью transition

            launcherButton.innerHTML = `
                 <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: white;">
                     <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                 </svg>
            `; 
        }
    }

    // --- Инициализация при загрузке скрипта ---
    if (!document.getElementById('vapi-widget-launcher')) {
        createLauncherButton();
        createIframe();

        window.addEventListener('message', (event) => {
            if (event.origin !== new URL(WIDGET_HOST_URL).origin) { 
                return; 
            }
            if (event.data === 'vapi-widget-close') {
                if (iframeVisible) {
                    toggleIframe();
                }
            }
        });
    } else {
        console.warn('Vapi embed script loaded multiple times.');
    }

})(); 