const chalk = require("chalk");

function validateApiKey(apiKey) {
  if (!apiKey) {
    console.error(
      chalk.redBright(`API Key for Github service has not been set up yet.`)
    );
    console.warn(
      `Please use command ${chalk.greenBright(
        "githib config --apiKey"
      )} to save your API key.
        `
    );
    return false;
  }
  return true;
}

module.exports = {
  validateApiKey
};
