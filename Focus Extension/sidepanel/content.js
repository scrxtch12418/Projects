chrome.storage.local.get(['removeJS'], (res) => {
    if (res.removeJS) {
        // Kill all current scripts
        window.stop();

        // Remove script tags from the DOM
        const scripts = document.querySelectorAll('script');
        scripts.forEach(s => s.remove());

        console.log("Aggressive Focus: Scripts Nuked.");
    }
});