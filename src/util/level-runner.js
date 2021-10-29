const POLL_INTERVAL = 1000;

const _addRoleToUser = async function () {};

const runJobs = async function () {
  // 1. connect to db
  // 2. get all items in queue with unique user id
  // 3. update each item
  // 4. handle errors
  // 5. disconnect from db
};

const initLevelRunner = async function () {
  console.log('Level Queue Runner Initialized');
  setInterval(runJobs, POLL_INTERVAL);
};

module.exports = {
  initLevelRunner,
};
