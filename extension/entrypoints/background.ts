
type OwedTask = {
  id: string;
  title: string;
  sourceUrl: string;
  createdAt: string;
  status: 'pending';
};

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(
    (message, _sender, sendResponse) => {
      if (message?.type !== 'OWED_ADD_TASK') {
        return;
      }

      const task = message.task as OwedTask | undefined;

      // Validate the incoming task.
      if (
        !task ||
        typeof task.id !== 'string' ||
        typeof task.title !== 'string' ||
        typeof task.sourceUrl !== 'string' ||
        typeof task.createdAt !== 'string' ||
        task.status !== 'pending'
      ) {
        sendResponse({
          success: false,
          error: 'Invalid task data',
        });

        return;
      }

      browser.storage.local.get(
        { owedTasks: [] },
        (result) => {
          if (browser.runtime.lastError) {
            sendResponse({
              success: false,
              error: browser.runtime.lastError.message,
            });

            return;
          }

          const tasks = result.owedTasks as OwedTask[];

          // Avoid duplicate tasks with the same ID.
          if (tasks.some((existing) => existing.id === task.id)) {
            sendResponse({ success: true });
            return;
          }

          browser.storage.local.set(
            { owedTasks: [task, ...tasks] },
            () => {
              if (browser.runtime.lastError) {
                sendResponse({
                  success: false,
                  error: browser.runtime.lastError.message,
                });

                return;
              }

              sendResponse({ success: true });
            },
          );
        },
      );

      // Keep the message channel open for the asynchronous response.
      return true;
    },
  );
});

