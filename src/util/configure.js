var config = require('common-config')
const{ validateApiKey } = require('./validate');
const sudo = require('sudo-prompt');
const chalk = require("chalk");


const configKey = 'GITHUB_API_TOKEN';
const configValue = config.get(configKey)

async function configure(args) {
  let currentConfigObject = config.get(configKey);
  currentConfigObject = currentConfigObject || {};

  let apiKey = args.apiKey || args.apikey || args['api-key'] || args.key || args.k;

  if(!apiKey) apiKey = currentConfigObject.apiKey;
  console.log("API Key " + apiKey)

  if (!validateApiKey(apiKey)) {
    return;
  }

  config.set(configKey,apiKey);
}

function viewApiKey(args){
  const options = {
    name: 'View Github Key'
  };

  const input = {
    default: configKey
  }

  sudo.exec('echo hello', options,
    function(error, _, _) {
      if (error) {
        console.warn(
          chalk.redBright("Access Denied")
        )
        return
      };
      if(!validateApiKey(configValue)){
        return
      }
      console.log(
        'Your Github API key is: ' + chalk.magenta(configValue)
      );
    }
  );
}

module.exports = {
    configKey,
    configValue,
    configure,
    viewApiKey
}