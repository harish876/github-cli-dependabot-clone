const axios = require("axios");
var config = require("common-config");
const { configKey } = require("./configure");
const { graphqlHelper } = require("./update");
var Table = require("cli-table");

async function listRepos(args) {
  const input = {
    user: "harish876",
    pinned: 6,
    limit:5
  };

  if (args) {
    input.user = args.user ? args.user : input.user;
    input.pinned = args.pinned ? args.pinned : input.pinned;
    input.limit = args.limit ? args.limit : input.limit
  }

  try {
    const { limit } = input;
    const query1 =
      "query($limit: Int!) { viewer { repositories( first: $limit affiliations: [OWNER, COLLABORATOR, ORGANIZATION_MEMBER] orderBy: { field: CREATED_AT, direction: DESC } ) { nodes { name id description owner { login } url defaultBranchRef { name } createdAt } } }}";
    const variables1 = {
      limit,
    };
    const data = await graphqlHelper(query1, variables1);
    const result = data?.viewer?.repositories?.nodes.map((edge) => {
      const node = edge;
      return {
        id: node?.id,
        name: node?.name,
        url: node?.url,
        description: node?.description,
        defaultBranch: node?.defaultBranchRef?.name,
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
    head: ["Sr No", "Repo Id", "Name", "Url", "Default Branch"],
    colWidths: [5, 10, 30, 80, 20],
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
