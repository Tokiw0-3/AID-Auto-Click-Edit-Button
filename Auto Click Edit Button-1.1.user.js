// ==UserScript==
// @name         Auto Click Edit Button
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Automatically clicks the Edit button
// @author       Tokiw0_3
// @match        https://play.aidungeon.com/*
// @match        https://beta.aidungeon.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const PLAY_PAGE_REGEX = /\/adventure\/[^/]+\/[^/]+\/play/;

    let lastUrl = location.href;
    let observer = null;

    function clickEditButton() {
        const editButton = Array.from(document.querySelectorAll('[role="button"]'))
            .find(button => {
                const span = button.querySelector('.is_ButtonText');
                return span && span.innerText.trim().toLowerCase() === 'edit';
            });

        if (editButton) {
            editButton.click();
            console.log("[Tampermonkey] Edit button clicked.");
        }
    }

    // Create and start a MutationObserver
    function startObserver() {
        if (observer) observer.disconnect();

        observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length) {
                    const popUpMenu = document.querySelector('div.css-175oi2r');
                    if (popUpMenu) {
                        clickEditButton();
                    }
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        console.log("[Tampermonkey] MutationObserver started.");
    }

    // Run script if URL matches
    function checkAndRun() {
        const currentUrl = location.href;
        if (PLAY_PAGE_REGEX.test(currentUrl)) {
            console.log("[Tampermonkey] Matching play URL detected:", currentUrl);
            startObserver();
        } else {
            if (observer) {
                observer.disconnect();
                observer = null;
                console.log("[Tampermonkey] Observer stopped — not on play page.");
            }
        }
    }

    function interceptNavigation() {
        const pushState = history.pushState;
        history.pushState = function () {
            pushState.apply(this, arguments);
            setTimeout(() => {
                if (location.href !== lastUrl) {
                    lastUrl = location.href;
                    checkAndRun();
                }
            }, 100);
        };

        window.addEventListener('popstate', () => {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                checkAndRun();
            }
        });
    }

    function init() {
        interceptNavigation();
        checkAndRun();
    }

    init();
})();
