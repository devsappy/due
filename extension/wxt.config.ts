import { defineConfig } from 'wxt';

// See https://wxt.dev/api/reference/wxt/interfaces/inlineconfig.html
export default defineConfig({
  manifest: {
    name: 'Due - If it\'s due, it gets done',
    description:
      'Detect possible commitments in text editors and let you choose whether to save them.',
    version: '0.1.0',
    permissions: ['storage'],
    host_permissions: [
      'https://mail.google.com/*',
      'https://*.slack.com/*',
      'https://teams.microsoft.com/*',
      'https://*.teams.microsoft.com/*',
      'https://teams.live.com/*',
      'https://*.teams.live.com/*',
      'https://teams.cloud.microsoft/*',
      'https://*.teams.cloud.microsoft/*',
      'https://github.com/*',
      'https://*.github.com/*',
    ],
  },
});
