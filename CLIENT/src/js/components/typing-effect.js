// client/src/js/components/typing-effect.js

/**
 * Aplica un efecte de màquina d'escriure a un element HTML.
 * @param {string} elementId L'ID de l'element on s'escriurà el text.
 * @param {string} textToType El text que es vol animar.
 * @param {function} onComplete Un callback opcional que s'executa en finalitzar l'animació.
 */
export function initTypingEffect(elementId, textToType, onComplete) {
    const targetElement = document.getElementById(elementId);
    
    if (!targetElement) {
        console.error(`Element with ID "${elementId}" not found for typing effect.`);
        return;
    }

    let i = 0;
    targetElement.innerHTML = ''; // Neteja el contingut inicial

    function typeWriter() {
        if (i < textToType.length) {
            targetElement.innerHTML += textToType.charAt(i);
            i++;
            setTimeout(typeWriter, 75);
        } else if (onComplete && typeof onComplete === 'function') {
            onComplete();
        }
    }

    typeWriter();
}