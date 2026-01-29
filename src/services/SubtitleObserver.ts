export type SubtitleCallback = (text: string, element: HTMLElement) => void;

export class SubtitleObserver {
    private observer: MutationObserver | null = null;
    private currentSubtitleElement: HTMLElement | null = null;
    private callback: SubtitleCallback;
    private intervalId: number | null = null;

    constructor(callback: SubtitleCallback) {
        this.callback = callback;
    }

    start() {
        this.stop();
        this.detectAndObserve();
        // Poll every second to handle page navigation or player reload
        this.intervalId = window.setInterval(() => this.detectAndObserve(), 1000);
    }

    stop() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.currentSubtitleElement = null;
    }

    private detectAndObserve() {
        // If we are already observing a valid element that is still in DOM, do nothing
        if (this.currentSubtitleElement && document.body.contains(this.currentSubtitleElement)) {
            return;
        }

        // Netflix selectors
        const selectors = [
            '.player-timedtext',
            '.player-timedtext-text-container',
            'div[data-uia="player-timedtext"]'
        ];

        let element: HTMLElement | null = null;
        for (const sel of selectors) {
            element = document.querySelector(sel) as HTMLElement;
            if (element) break;
        }

        if (element && element !== this.currentSubtitleElement) {
            console.log('Subtitle container found:', element);
            this.currentSubtitleElement = element;

            // Callback immediately with current text if any
            this.handleMutation();

            // Start observing
            this.observer = new MutationObserver(() => this.handleMutation());
            this.observer.observe(element, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }
    }

    private handleMutation() {
        if (!this.currentSubtitleElement) return;
        const text = this.currentSubtitleElement.innerText || this.currentSubtitleElement.textContent || '';
        // Basic sanitization
        const cleanText = text.replace(/[\n\r]+/g, ' ').trim();
        if (cleanText) {
            this.callback(cleanText, this.currentSubtitleElement);
        }
    }
}
