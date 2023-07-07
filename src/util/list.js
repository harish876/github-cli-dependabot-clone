const axios = require("axios");
var config = require("common-config");
const { configKey } = require("./configure");
var Table = require("cli-table");

async function listRepos(args) {
  const input = {
    user: "harish876",
    pinned: 6,
  };

  if (args) {
    input.user = args.user ? args.user : input.user;
    input.pinned = args.pinned ? args.pinned : input.pinned;
  }

  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.get(configKey)}`,
    };
    const { user , pinned } = input
    const query = {
      query: `{\n  user(login: "${user}") {\n pinnedItems(first: ${pinned}, types: REPOSITORY) {\n nodes {\n ... on Repository {\n name\n \n id\n \n url\n \n description\n \n defaultBranchRef { name } \n }\n }\n }\n }\n}`,
    };
    const { data: apiResponse } = await axios.post(
      "https://api.github.com/graphql",
      query,
      {
        headers,
      }
    );
    const result = apiResponse?.data?.user?.pinnedItems?.nodes.map((edge) => {
      const node = edge;
      return {
        id: node?.id,
        name: node?.name,
        url: node?.url,
        description: node?.description,
        defaultBranch: node?.defaultBranchRef?.name
      };
    });

    const table = makeTable(result);
    console.log(table.toString());
  } catch (error) {
    console.log("");
  }
}

const makeTable = (result) => {
  const table = new Table({
    head: ["Sr No", "Repo Id", "Name", "Url","Default Branch"],
    colWidths: [5,15, 30, 40, 20],
    wordWrap: true,
  });
  result.map((r, i) => {
    table.push([i + 1, r?.id, r?.name, r?.url, r?.defaultBranch]);
  });

  return table;
};
module.exports = {
  listRepos,
};
