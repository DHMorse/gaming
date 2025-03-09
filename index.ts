/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

// CSS for styling the "gaming" text
const style = document.createElement("style");
style.textContent = `
.vc-gaming-blue {
    color: #007bff !important;
    font-weight: bold;
}

/* Target Discord's message content directly */
.markup__75297 span:not(.vc-gaming-blue) {
    color: inherit;
}
`;

export default definePlugin({
    name: "GamingBlue",
    description: "Changes every instance of the word 'gaming' to blue",
    authors: [Devs.Ven],

    start() {
        // Add the CSS to the document
        document.head.appendChild(style);

        // Set up the observer to watch for new messages
        this.setupObserver();

        // Process existing messages
        this.processExistingMessages();
    },

    stop() {
        // Remove the CSS from the document
        style.remove();

        // Disconnect the observer if it exists
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        // Revert changes to existing messages
        this.revertChanges();
    },

    observer: null as MutationObserver | null,

    setupObserver() {
        // Create a MutationObserver to watch for changes to the DOM
        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.type === "childList") {
                    // Check for new message content elements
                    const messageContents = document.querySelectorAll(".markup__75297.messageContent_c19a55:not(.vc-gaming-processed)");

                    for (const messageContent of messageContents) {
                        this.processMessageContent(messageContent as HTMLElement);
                    }
                }
            }
        });

        // Start observing the document
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Store the observer so we can disconnect it later
        this.observer = observer;
    },

    processExistingMessages() {
        // Find all message content elements
        const messageContents = document.querySelectorAll(".markup__75297.messageContent_c19a55:not(.vc-gaming-processed)");

        for (const messageContent of messageContents) {
            this.processMessageContent(messageContent as HTMLElement);
        }
    },

    processMessageContent(element: HTMLElement) {
        // Mark this element as processed to avoid processing it again
        element.classList.add("vc-gaming-processed");

        // Get the HTML content
        const html = element.innerHTML;

        // Replace instances of "gaming" with styled spans
        // Using a regex with word boundaries to match whole words only
        const newHtml = html.replace(/\b(gaming)\b/gi, '<span class="vc-gaming-blue">$1</span>');

        // Only update if there was a change
        if (newHtml !== html) {
            element.innerHTML = newHtml;
        }
    },

    revertChanges() {
        // Find all processed message content elements
        const processedElements = document.querySelectorAll(".vc-gaming-processed");

        for (const element of processedElements) {
            // Remove the processed class
            element.classList.remove("vc-gaming-processed");

            // Find all blue gaming spans
            const blueSpans = element.querySelectorAll(".vc-gaming-blue");

            // Replace each span with its text content
            for (const span of blueSpans) {
                const text = span.textContent || "";
                const textNode = document.createTextNode(text);
                span.parentNode?.replaceChild(textNode, span);
            }
        }
    },

    // Patch the message content renderer to ensure we catch all messages
    patches: [
        {
            find: "#{intl::MESSAGE_EDITED}",
            replacement: {
                match: /(\)\("div",\{id:.+?children:\[)/,
                replace: "$1$self.patchMessageContent(arguments[0]),"
            }
        }
    ],

    // Function to ensure we process message content after it's rendered
    patchMessageContent(props: any) {
        if (!props || !props.message) return null;

        // Use setTimeout to ensure the message is rendered before we process it
        setTimeout(() => {
            const messageId = props.message.id;
            if (!messageId) return;

            const messageContent = document.querySelector(`#message-content-${messageId}`);
            if (messageContent && !messageContent.classList.contains("vc-gaming-processed")) {
                this.processMessageContent(messageContent as HTMLElement);
            }
        }, 0);

        return null;
    }
});
