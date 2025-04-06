// Vapi Web Agent Logic will go here

import Vapi from '@vapi-ai/web';

// --- КОНФИГУРАЦИЯ --- 
// !!! ЗАМЕНИ 'YOUR_PUBLIC_API_KEY' НА СВОЙ ПУБЛИЧНЫЙ КЛЮЧ VAPI !!!
const VAPI_PUBLIC_KEY = 'd0d9e5e2-8e9e-438b-8ed7-80844675afce'; 
const VAPI_AGENT_ID = 'd6f72630-a173-4726-8797-38080c3140b6';
// --- КОНЕЦ КОНФИГУРАЦИИ ---

// Убираем statusElement, startButton, stopButton
// const startButton = document.getElementById('startButton');
// const stopButton = document.getElementById('stopButton');
// const statusElement = document.getElementById('status');
const callButton = document.getElementById('callButton'); // <-- Новая единая кнопка
const voiceCircle = document.getElementById('voice-circle');
const closeWidgetButton = document.getElementById('close-widget-button'); // <-- Кнопка закрытия

let vapi = null; // Инициализируем как null
let isCalling = false; // Флаг состояния звонка

// --- Константы для визуализатора ---
// Убираем константы, так как размер управляется CSS
// const MIN_CIRCLE_SIZE = 50; 
// const MAX_CIRCLE_SIZE = 80; 
// const CIRCLE_SIZE_RANGE = MAX_CIRCLE_SIZE - MIN_CIRCLE_SIZE;
// --- 

function setCallButtonState(calling) {
    isCalling = calling;
    if (callButton) {
        if (calling) {
            callButton.textContent = 'Закончить разговор';
            callButton.classList.remove('start');
            callButton.classList.add('stop');
            callButton.onclick = stopConversation; // Назначаем функцию остановки
        } else {
            callButton.textContent = 'Начать разговор';
            callButton.classList.remove('stop');
            callButton.classList.add('start');
            callButton.onclick = startConversation; // Назначаем функцию старта
        }
    }
}

function resetVisualizer() {
    if (voiceCircle) {
        voiceCircle.classList.remove('speaking');
        // Убираем установку размера через JS
        // voiceCircle.style.width = `${MIN_CIRCLE_SIZE}px`;
        // voiceCircle.style.height = `${MIN_CIRCLE_SIZE}px`;
        // Цвет и так сбросится при удалении класса speaking
        // voiceCircle.style.backgroundColor = '#007bff'; 
    }
}

// --- Функция для отправки сообщения родительскому окну ---
function postMessageToParent(message) {
    // Используем '*' для targetOrigin в localhost для простоты, 
    // но в продакшене лучше указать конкретный origin родителя!
    if (window.parent && window.parent !== window) { 
        window.parent.postMessage(message, '*'); 
    }
}

async function startConversation() {
    if (isCalling) return; // Не начинать, если уже звоним

    // updateStatus('Инициализация...');
    // Не меняем состояние кнопки сразу, ждем успеха

    try {
        vapi = new Vapi(VAPI_PUBLIC_KEY);

        // --- Обработчики событий Vapi --- 
        vapi.on('call-start', () => {
            // updateStatus('Звонок начался');
            console.log('Vapi Call Started');
            setCallButtonState(true); // <-- Меняем кнопку на "Закончить"
            if (voiceCircle) {
                // Можно добавить активное состояние для кружка при звонке
            }
        });

        vapi.on('call-end', () => {
            // updateStatus('Звонок завершен');
            console.log('Vapi Call Ended');
            setCallButtonState(false); // <-- Меняем кнопку на "Начать"
            resetVisualizer(); 
            vapi = null; 
        });

        vapi.on('speech-start', () => {
            console.log('User speech started');
            if (voiceCircle) {
                voiceCircle.classList.add('speaking');
            }
        });

        vapi.on('speech-end', () => {
            console.log('User speech ended');
             if (voiceCircle) {
                voiceCircle.classList.remove('speaking');
                 // Убираем установку размера через JS
                 // voiceCircle.style.width = `${MIN_CIRCLE_SIZE}px`;
                 // voiceCircle.style.height = `${MIN_CIRCLE_SIZE}px`;
            }
        });

        vapi.on('volume-level', (level) => {
           // console.log('Mic volume:', level);
        });

        vapi.on('message', (message) => {
            console.log('Assistant message:', message);
            // TODO: Отображать сообщения на странице?
        });

        vapi.on('error', (e) => {
            console.error('Vapi error:', e);
            // updateStatus(`Ошибка: ${e.message || 'Неизвестная ошибка'}`);
            alert(`Ошибка Vapi: ${e?.message || 'Неизвестная ошибка'}`); // Уведомляем пользователя
            setCallButtonState(false); // Сбрасываем кнопку
            resetVisualizer(); 
            vapi = null;
        });
        // --- Конец обработчиков --- 

        // updateStatus('Подключение...');
        console.log('Vapi connecting...');
        callButton.textContent = 'Подключение...'; // Временный статус на кнопке
        callButton.onclick = null; // Временно отключаем клики
        
        await vapi.start(VAPI_AGENT_ID); 
        
        // updateStatus('Подключено. Говорите.');
        // Состояние кнопки обновится в 'call-start'
        console.log('Vapi started successfully, waiting for call-start event.');

    } catch (error) {
        console.error('Failed to start Vapi conversation:', error);
        const errorMessage = error?.message || (typeof error === 'string' ? error : 'Неизвестная ошибка при запуске');
        // updateStatus(`Ошибка подключения: ${errorMessage}`);
        alert(`Ошибка подключения: ${errorMessage}`);
        setCallButtonState(false); // Сбрасываем кнопку
        if (vapi) {
            try { 
                await vapi.stop(); 
            } catch (stopError) { 
                console.error('Error stopping Vapi after failed start:', stopError); 
            } 
            vapi = null; 
        }
    }
}

async function stopConversation() {
    if (!isCalling || !vapi) return; // Не останавливать, если не звоним

    // updateStatus('Завершение...');
    console.log('Vapi stopping...');
    callButton.textContent = 'Завершение...'; // Временный статус
    callButton.onclick = null; // Временно отключаем клики

    try {
        await vapi.stop();
        // Состояние кнопки и vapi обновится в 'call-end'
        console.log('Vapi stop called, waiting for call-end event.');
    } catch (error) {
        console.error('Failed to stop Vapi conversation:', error);
        // updateStatus(`Ошибка завершения: ${error.message || 'Неизвестная ошибка'}`);
        alert(`Ошибка завершения: ${error.message || 'Неизвестная ошибка'}`);
        setCallButtonState(false); // Принудительно сбрасываем кнопку
        resetVisualizer(); 
        vapi = null;
    }
}

// --- Инициализация --- 
closeWidgetButton.addEventListener('click', () => {
    postMessageToParent('vapi-widget-close');
});

// Начальное состояние кнопки
setCallButtonState(false); 
resetVisualizer(); 

console.log('Vapi Web Agent initialized.');
console.log('Agent ID:', VAPI_AGENT_ID); 