module.exports = {
  apps: [
    {
      name: "website-rewrite",
      script: "yarn",
      interpreter: '/bin/bash',
      args: "start",
      kill_timeout: 3000,
      post_update: ["yarn install && yarn build"],
      max_restarts: 5,
      max_memory_restart: "250M",
      exp_backoff_restart_delay: 2500,
    },
  ],
};
