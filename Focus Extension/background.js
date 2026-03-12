let timerInterval = null;
let timeLeft = 25 * 60;
let isRunning = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'START_TIMER') {
        startTimer();
    } else if (message.type === 'STOP_TIMER') {
        stopTimer();
    } else if (message.type === 'GET_STATUS') {
        // Synchronous response, no "return true" needed here
        sendResponse({ timeLeft, isRunning });
    } else if (message.type === 'SET_TIME') {
        if (!isRunning) {
            timeLeft = message.time;
        }
    } else if (message.type === 'MEDIA_COMMAND') {
        executeMediaCommand(message.action);
    } else if (message.type === 'GET_MEDIA_INFO') {
        // Asynchronous response: we have to fetch the data first!
        fetchMediaInfo().then(info => sendResponse(info));

        return true;
    }
    if (message.type === 'UPDATE_BLOCK_SETTINGS') {
        updateBlockRules(message.blockAll, message.blockedSites);
    }
});

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                chrome.runtime.sendMessage({ type: 'TICK', timeLeft });
            } else {
                stopTimer();
                chrome.runtime.sendMessage({ type: 'TIMER_FINISHED' });
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon-128.png',
                    title: 'Time is up!',
                    message: 'Time to shift gears.'
                });
            }
        }, 1000);
    }
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
}

async function executeMediaCommand(action) {
    // 1. Try to find a tab making sound
    let tabs = await chrome.tabs.query({ audible: true });

    // 2. If nothing is playing sound (because it's paused!), look for media sites
    if (tabs.length === 0) {
        tabs = await chrome.tabs.query({ url: ["*://*.youtube.com/*", "*://*.spotify.com/*"] });
    }

    if (tabs.length === 0) return;

    const targetTab = tabs[0];

    chrome.scripting.executeScript({
        target: { tabId: targetTab.id },
        func: (cmd) => {
            const host = window.location.hostname;

            // --- SPOTIFY LOGIC ---
            if (host.includes('spotify.com')) {
                if (cmd === 'playpause') document.querySelector('[data-testid="control-button-playpause"]')?.click();
                if (cmd === 'next') document.querySelector('[data-testid="control-button-skip-forward"]')?.click();
                if (cmd === 'prev') document.querySelector('[data-testid="control-button-skip-back"]')?.click();
                return; // Exit out, we are done
            }

            // --- YOUTUBE / YOUTUBE MUSIC LOGIC ---
            if (host.includes('youtube.com')) {
                if (cmd === 'playpause') {
                    // Try YT Music first, then regular YT
                    const btn = document.querySelector('#play-pause-button') || document.querySelector('.ytp-play-button');
                    btn?.click();
                }
                if (cmd === 'next') {
                    const btn = document.querySelector('.next-button') || document.querySelector('.ytp-next-button');
                    btn?.click();
                }
                if (cmd === 'prev') {
                    const btn = document.querySelector('.previous-button') || document.querySelector('.ytp-prev-button');
                    btn?.click();
                }
                return; // Exit out, we are done
            }

            // --- GENERIC FALLBACK (For other random sites) ---
            const mediaElement = document.querySelector('video, audio');
            if (mediaElement) {
                if (cmd === 'playpause') {
                    mediaElement.paused ? mediaElement.play() : mediaElement.pause();
                } else if (cmd === 'next') {
                    mediaElement.currentTime = mediaElement.duration; // Scrub to end
                } else if (cmd === 'prev') {
                    mediaElement.currentTime = 0; // Scrub to start
                }
            }
        },
        args: [action]
    });
}

async function fetchMediaInfo() {
    let tabs = await chrome.tabs.query({ audible: true });

    if (tabs.length === 0) {
        tabs = await chrome.tabs.query({ url: ["*://*.youtube.com/*", "*://*.spotify.com/*"] });
    }

    if (tabs.length === 0) {
        return { title: 'No Media Detected', artist: 'Start playing music...', art: '' };
    }

    const targetTab = tabs[0];

    try {
        const [{ result }] = await chrome.scripting.executeScript({
            target: { tabId: targetTab.id },
            func: () => {
                // 1. Try the Media Session API (Best for Spotify/YouTube Music)
                if (navigator.mediaSession && navigator.mediaSession.metadata) {
                    const meta = navigator.mediaSession.metadata;
                    return {
                        title: meta.title || document.title,
                        artist: meta.artist || '',
                        // Grab the highest resolution artwork available
                        art: meta.artwork && meta.artwork.length > 0 ? meta.artwork[meta.artwork.length - 1].src : ''
                    };
                }

                // 2. Fallback for regular YouTube Videos
                let art = '';
                if (window.location.hostname.includes('youtube.com')) {
                    const ytVideoId = new URLSearchParams(window.location.search).get('v');
                    if (ytVideoId) art = `https://i.ytimg.com/vi/${ytVideoId}/maxresdefault.jpg`;
                }

                // Clean up notification numbers from tab titles e.g., "(2) Song Name" -> "Song Name"
                const cleanTitle = document.title.replace(/^\(\d+\)\s+/, '');

                return {
                    title: cleanTitle,
                    artist: window.location.hostname.replace('www.', ''),
                    art: art
                };
            }
        });
        return result;
    } catch (error) {
        return { title: 'No Media Detected', artist: 'Start playing music...', art: '' };
    }
}

async function updateBlockRules(isBlockingAll, blockedList) {
    // 1. Clear out old rules first
    const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
    const oldRuleIds = oldRules.map(rule => rule.id);

    let newRules = [];

    if (isBlockingAll) {
        // Rule to block EVERYTHING except the extension itself
        newRules.push({
            id: 1,
            priority: 1,
            action: { type: 'block' },
            condition: { urlFilter: '*', resourceTypes: ['main_frame'] }
        });
    } else if (blockedList.length > 0) {
        // Create a rule for each site in your list
        blockedList.forEach((site, index) => {
            if (site.trim().length > 0) {
                newRules.push({
                    id: index + 2, // IDs must be unique and > 0
                    priority: 1,
                    action: { type: 'block' },
                    condition: {
                        urlFilter: site.trim(),
                        resourceTypes: ['main_frame']
                    }
                });
            }
        });
    }

    // Apply the new rules
    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: oldRuleIds,
        addRules: newRules
    });
}