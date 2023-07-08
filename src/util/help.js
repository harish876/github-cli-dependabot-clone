const { greenBright, blueBright } = require("chalk");

const menus = {
  main: `
${greenBright("github [command] <options>")}

  ${blueBright("list")} ................ show all pinned repositories
  ${blueBright("update")} ................ create a PR for a package.json file in the root
  ${blueBright("config")}.............. set Github API key
  ${blueBright("view-config")}.............. view Github API key
  ${blueBright("version")} ............ show package version
  ${blueBright("help")} ............... show help menu for a command
`,

  list: `
${greenBright("github list <options>")}

  --user .......... set the github owner name.
  --pinned ........ set the number of pinned repositories to list.
`,

  update: `
${greenBright("github update <options>")}

  --user ........ [Required] set the github owner name.
  --name ........ [Required] set the github repository name
  --head ........ [Required] set the headRef to which the PR has to be created
  --file ........ [Optional] location of package.json. If present in folder use {folder}/package.json
`,

  config: `
  ${greenBright("github config <options>")}

  --api-key, -k ..... [Required] set the API Key for Github services.
`,

  "view-config": `
${greenBright("github view-config <options>")}

  --default ..... [Optional] View the Default Github API Key for Github services.
`,
};

async function help(args) {
  const subCmd = args._[0] === "help" ? args._[1] : args._[0];
  console.log(menus[subCmd] || menus.main);
}

module.exports = {
  help,
};

/* Edit as per needed */
