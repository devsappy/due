import './style.css';

type OwedTask = {
  id: string;
  title: string;
  sourceUrl: string;
  createdAt: string;
  status: 'pending';
};

const app = document.querySelector<HTMLDivElement>('#app')!;

function render(tasks: OwedTask[]) {
  app.replaceChildren();
  const title = document.createElement('h1');
  title.textContent = 'Due';
  const subtitle = document.createElement('p');
  subtitle.className = 'subtitle';
  subtitle.textContent = `${tasks.length} captured task${tasks.length === 1 ? '' : 's'}`;
  app.append(title, subtitle);

  if (!tasks.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'No tasks yet. Write a commitment in a webpage editor to test capture.';
    app.append(empty);
    return;
  }

  const list = document.createElement('ul');
  for (const task of tasks) {
    const item = document.createElement('li');
    const taskTitle = document.createElement('div');
    taskTitle.className = 'task-title';
    taskTitle.textContent = task.title;
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `${new URL(task.sourceUrl).hostname} · ${new Date(task.createdAt).toLocaleString()}`;
    item.append(taskTitle, meta);
    list.append(item);
  }
  app.append(list);
}

browser.storage.local.get({ owedTasks: [] }, (result) => render(result.owedTasks as OwedTask[]));
browser.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.owedTasks) render(changes.owedTasks.newValue as OwedTask[]);
});
