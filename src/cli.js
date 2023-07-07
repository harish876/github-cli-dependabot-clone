const minimist = require("minimist");
const { help } = require("./util/help");
const { version } = require("./util/version");
const { configure, configKey , viewApiKey } = require("./util/configure");
const { listRepos } = require("./util/list");
const { update: updateRepo } = require("./util/update");

async function cli(argsArray) {
  const args = minimist(argsArray.slice(2));
  let cmd = args._[0] || "help";

  if (args.version || args.v) {
    cmd = "version";
  }

  if (args.help || args.h) {
    cmd = "help";
  }

  if (args.configure || args.c || args.config) {
    cmd = "configure";
  }

  switch (cmd) {
    case "version":
      version(args);
      break;

    case "help":
      help(args);
      break;

    case "config":
      configure(args);
      break;

    case "view-config":
      viewApiKey(args);
      break;

    case "list":
      await listRepos(args);
      break;

    case "update":
      await updateRepo(args);
      break;

    default:
      console.error(`"${cmd}" is not a valid command!`);
      break;
  }
}

module.exports = {
  cli,
};
