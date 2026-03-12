chrome.storage.local.get(['removeJS'], (res) => {
    if (res.removeJS) {
        window.stop();

        const scripts = document.querySelectorAll('script');
        scripts.forEach(s => s.remove());

        console.log("Aggressive Focus: Scripts Nuked.");
    }
});