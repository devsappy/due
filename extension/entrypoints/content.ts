import { defineContentScript } from '#imports';

export default defineContentScript({
  matches: [
    'https://mail.google.com/*',
    'https://*.slack.com/*',
    'https://teams.microsoft.com/*',
    'https://*.teams.microsoft.com/*',
    'https://teams.live.com/v2*',
    'https://teams.live.com/*',
    'https://*.teams.live.com/*',
    'https://teams.cloud.microsoft/*',
    'https://*.teams.cloud.microsoft/*',
    'https://github.com/*',
    'https://*.github.com/*',
  ],

  main() {
    type OwedTask = {
      id: string;
      title: string;
      sourceUrl: string;
      createdAt: string;
      status: 'pending';
    };

    const DEBOUNCE_MS = 900;
    const MIN_TEXT_LENGTH = 12;
    const MAX_TEXT_LENGTH = 4000;

    const timers = new WeakMap<
      HTMLElement,
      ReturnType<typeof setTimeout>
    >();

    const lastPromptedText = new WeakMap<HTMLElement, string>();
    const dismissedText = new WeakMap<HTMLElement, string>();

    const savingEditors = new WeakSet<HTMLElement>();

    let activePrompt: HTMLElement | null = null;

    const editorSelector =
      'textarea, input, [contenteditable]:not([contenteditable="false"]), [role="textbox"]';

    function getEditor(
      target: EventTarget | null,
      path: EventTarget[] = [],
    ): HTMLElement | null {
      const candidates = [
        target,
        ...path,
      ];

      const editor = candidates.find(
        (candidate): candidate is HTMLElement =>
          candidate instanceof HTMLElement &&
          (candidate.matches(editorSelector) ||
            candidate.closest<HTMLElement>(editorSelector) !== null ||
            candidate.isContentEditable),
      );

      if (!editor) {
        return null;
      }

      const matchedEditor = editor.matches(editorSelector)
        ? editor
        : editor.closest<HTMLElement>(editorSelector) ??
          (editor.isContentEditable
            ? editor.closest<HTMLElement>('[contenteditable]') ?? editor
            : null);

      if (!matchedEditor || !matchedEditor.isConnected) {
        return null;
      }

      if (
        matchedEditor instanceof HTMLInputElement &&
        !['text', 'search', 'email'].includes(matchedEditor.type)
      ) {
        return null;
      }

      if (
        matchedEditor instanceof HTMLInputElement ||
        matchedEditor instanceof HTMLTextAreaElement
      ) {
        if (matchedEditor.disabled || matchedEditor.readOnly) {
          return null;
        }
      }

      if (matchedEditor.getAttribute('contenteditable') === 'false') {
        return null;
      }

      if (matchedEditor.closest('[data-owed-ui="true"]')) {
        return null;
      }

      return matchedEditor;
    }

    function readText(editor: HTMLElement): string {
      if (
        editor instanceof HTMLInputElement ||
        editor instanceof HTMLTextAreaElement
      ) {
        return editor.value;
      }

      return editor.innerText || editor.textContent || '';
    }

    function looksLikeCommitment(text: string): boolean {
      const patterns = [
        /\b(i['’]?ll|i will|we['’]?ll|we will|i promise(?:d)?|we promise(?:d)?|i committed to|we committed to)\b.{0,180}\b(send|share|finish|complete|deliver|fix|review|prepare|update|follow up|check|look into|handle|take care of|do|get|make sure|have)\b/i,
        /\b(i['’]?m going to|we['’]?re going to|i need to|i have to|i must|we need to|we have to)\b.{0,180}\b(send|share|finish|complete|deliver|fix|review|prepare|update|follow up|check|look into|handle|take care of|do|get|make sure)\b/i,
        /\b(please|can you|could you|you need to|remember to|don't forget to)\b.{0,180}\b(by tomorrow|tomorrow|today|tonight|this week|next week|by\s+\w+day|by\s+\w+)\b/i,
        /\b(i['’]?ll|i will|we['’]?ll|we will|i promise(?:d)?|we promise(?:d)?)\b.{0,180}\b(today|tomorrow|tonight|this week|next week|by\s+\w+day|by\s+\w+)\b/i,
      ];

      return patterns.some((pattern) => pattern.test(text));
    }

    function removePrompt(): void {
      activePrompt?.remove();
      activePrompt = null;
    }

    function buttonStyle(
      background: string,
      color: string,
    ): Partial<CSSStyleDeclaration> {
      return {
        background,
        color,
        border: '0',
        borderRadius: '9px',
        padding: '9px 12px',
        cursor: 'pointer',
        font: '600 13px system-ui, -apple-system, Segoe UI, sans-serif',
      };
    }

    function showPrompt(
      editor: HTMLElement,
      text: string,
    ): void {
      removePrompt();

      const panel = document.createElement('div');

      panel.dataset.owedUi = 'true';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-label', 'Possible commitment detected');

      Object.assign(panel.style, {
        position: 'fixed',
        right: '20px',
        bottom: '20px',
        zIndex: '2147483647',
        width: 'min(340px, calc(100vw - 40px))',
        boxSizing: 'border-box',
        padding: '16px',
        border: '1px solid #d1d5db',
        borderRadius: '14px',
        background: '#ffffff',
        color: '#111827',
        boxShadow: '0 10px 35px rgba(0,0,0,.18)',
        font: '14px/1.45 system-ui, -apple-system, Segoe UI, sans-serif',
      });

      const heading = document.createElement('div');
      heading.textContent = 'Possible commitment';

      Object.assign(heading.style, {
        fontWeight: '700',
        marginBottom: '6px',
      });

      const preview = document.createElement('div');

      preview.textContent =
        text.length > 180
          ? `${text.slice(0, 177)}...`
          : text;

      Object.assign(preview.style, {
        color: '#4b5563',
        marginBottom: '12px',
        overflowWrap: 'anywhere',
        maxHeight: '72px',
        overflow: 'hidden',
      });

      const actions = document.createElement('div');

      Object.assign(actions.style, {
        display: 'flex',
        gap: '8px',
      });

      const add = document.createElement('button');

      add.type = 'button';
      add.textContent = 'Add task';

      Object.assign(
        add.style,
        buttonStyle('#111827', '#ffffff'),
      );

      add.addEventListener('click', () => {
        if (savingEditors.has(editor)) {
          return;
        }

        savingEditors.add(editor);

        add.disabled = true;
        add.textContent = 'Saving...';

        const task: OwedTask = {
          id: crypto.randomUUID(),
          title: text.trim().replace(/\s+/g, ' ').slice(0, 240),

          // Remove query parameters and fragments to avoid saving
          // potentially sensitive information from the page URL.
          sourceUrl: `${location.origin}${location.pathname}`,

          createdAt: new Date().toISOString(),
          status: 'pending',
        };

        try {
          browser.runtime.sendMessage(
            {
              type: 'OWED_ADD_TASK',
              task,
            },
            (response) => {
              savingEditors.delete(editor);

              if (
                browser.runtime.lastError ||
                response?.success === false ||
                response?.success !== true
              ) {
                console.warn(
                  '[Due] Could not save task:',
                  browser.runtime.lastError?.message ??
                    response?.error ??
                    'Background script did not confirm the save.',
                );

                add.disabled = false;
                add.textContent = 'Retry saving';

                return;
              }

              lastPromptedText.set(editor, text);
              dismissedText.delete(editor);

              removePrompt();
            },
          );
        } catch (error) {
          savingEditors.delete(editor);

          console.error('[Due] Could not send task:', error);

          add.disabled = false;
          add.textContent = 'Retry saving';
        }
      });

      const dismiss = document.createElement('button');

      dismiss.type = 'button';
      dismiss.textContent = 'Dismiss';

      Object.assign(
        dismiss.style,
        buttonStyle('#f3f4f6', '#111827'),
      );

      dismiss.addEventListener('click', () => {
        dismissedText.set(editor, text);
        removePrompt();
      });

      actions.append(add, dismiss);
      panel.append(heading, preview, actions);

      document.documentElement.append(panel);

      activePrompt = panel;
    }

    function processEditor(editor: HTMLElement): void {
      const existing = timers.get(editor);

      if (existing) {
        clearTimeout(existing);
      }

      const timer = setTimeout(() => {
        if (!editor.isConnected) {
          return;
        }

        const text = readText(editor).trim();

        if (
          text.length < MIN_TEXT_LENGTH ||
          text.length > MAX_TEXT_LENGTH
        ) {
          return;
        }

        if (text === lastPromptedText.get(editor)) {
          return;
        }

        if (text === dismissedText.get(editor)) {
          return;
        }

        if (!looksLikeCommitment(text)) {
          return;
        }

        showPrompt(editor, text);
      }, DEBOUNCE_MS);

      timers.set(editor, timer);
    }

    // Detect editor changes.
    document.addEventListener(
      'input',
      (event) => {
        const editor = getEditor(event.target, event.composedPath());

        if (!editor) {
          return;
        }

        // Reset dismissal when the user edits the text.
        dismissedText.delete(editor);

        processEditor(editor);
      },
      true,
    );

    // Some rich editors do not consistently dispatch input events for
    // composition, paste, or framework-managed updates.
    document.addEventListener(
      'beforeinput',
      (event) => {
        const editor = getEditor(event.target, event.composedPath());

        if (editor) {
          dismissedText.delete(editor);
          processEditor(editor);
        }
      },
      true,
    );

    // Dismiss the prompt with Escape.
    document.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Escape') {
          removePrompt();
        }
      },
      true,
    );

    // Keep the prompt visible when interacting with its buttons.
    document.addEventListener(
      'focusin',
      (event) => {
        if (!activePrompt) {
          return;
        }

        const target = event.target;

        if (
          target instanceof Node &&
          activePrompt.contains(target)
        ) {
          return;
        }

        if (!getEditor(target, event.composedPath())) {
          removePrompt();
        }
      },
      true,
    );

    // Remove stale prompts when navigating between editors.
    document.addEventListener(
      'focusout',
      (event) => {
        const editor = getEditor(event.target, event.composedPath());

        if (!editor || !activePrompt) {
          return;
        }

        // Allow focus to move to the prompt itself.
        setTimeout(() => {
          if (!activePrompt) {
            return;
          }

          const focused = document.activeElement;

          if (
            focused instanceof Node &&
            activePrompt.contains(focused)
          ) {
            return;
          }

          if (focused !== editor && !editor.contains(focused)) {
            removePrompt();
          }
        }, 0);
      },
      true,
    );
  },
});
