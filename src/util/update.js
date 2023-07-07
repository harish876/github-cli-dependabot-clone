const axios = require("axios");
var config = require("common-config");
const { configKey } = require("./configure");
const { createSpinner } = require("nanospinner");

/* Improve Error Handling */
async function update(args) {
  const spinner = createSpinner("Raising a PR ... \n");
  const input = {
    user: "harish876",
    name: "kick-store-next",
    head: "main",
    test: "false",
  };

  if (args) {
    input.name = args.name ? args.name : input.name;
    input.user = args.user ? args.user : input.user;
    input.head = args.head ? args.head : input.head;
  }

  const { user, name, head, test } = input;

  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.get(configKey)}`,
    };
    const query = {
      query:
        'query ($owner: String!, $repo: String!) { repository(owner: $owner, name: $repo) { id object(expression: "main:package.json") { ... on Blob { text } } }}',
      variables: {
        owner: user,
        repo: name,
      },
    };
    const { data: apiResponse } = await axios.post(
      "https://api.github.com/graphql",
      query,
      {
        headers,
      }
    );

    const packageJson = apiResponse?.data?.repository?.object?.text;
    const repositoryId = apiResponse?.data?.repository?.id;
    const old_package = packageJsonParse(packageJson);
    const new_package = await updateObjectBuilder(old_package, spinner, test);
    const updated_commit = JSON.stringify(new_package, null, 2).replace(
      /,/g,
      ", "
    );
    const encoded_commit = Buffer.from(updated_commit).toString("base64");

    const branch = await createBranch({
      user,
      repo: name,
      repositoryId,
      owner: user,
      branch: head,
    });

    await createCommit({
      user,
      repo: name,
      commit: encoded_commit,
      repositoryId,
      owner: user,
      branch,
    });

    const pullUrl = await createPullRequest({
      owner: user,
      repositoryId,
      head,
      name,
      branch,
    });

    spinner.stop({ text: pullUrl, mark: "Done PR: ", color: "magenta" });
  } catch (error) {
    console.warn(error.message);
  }
}

const packageJsonParse = (text) => {
  if (!text) {
    throw new Error("Cannot Retrive File");
  }
  let parsedText = JSON.parse(text);
  return parsedText;
};

const updateObjectBuilder = async (obj, spinner, flag) => {
  let d = {};
  let count = 0;
  let test = flag === "true",
    limit = 4;
  spinner.start();
  const { dependencies } = obj;
  for (let [key, value] of Object.entries(dependencies)) {
    count++;
    await axios
      .get(`https://registry.npmjs.org/${key}`)
      .then((response) => {
        const { data = {} } = response || {};
        const latestVersion = data["dist-tags"]?.latest || value;
        d[[key].toString()] = latestVersion;
      })
      .catch((error) => {
        console.error("Error fetching package information:", error);
        spinner.error({ text: "Error!", mark: ":(" });
      });
    if (test && count >= limit) break;
  }
  spinner.success();
  return {
    ...obj,
    dependencies: d,
  };
};

async function createBranch({ owner, repo, repositoryId, branch }) {
  const new_branch_name = generateAwesomeBranchName();
  const query =
    "mutation CreateBranch($input: CreateRefInput!) { createRef(input: $input) { ref { name } }}";
  const variables = {
    input: {
      repositoryId,
      name: `refs/heads/${new_branch_name}`,
      oid: await getOid({ user: owner, name: repo, branch }),
    },
  };
  try {
    const data = await graphqlHelper(query, variables);
    return data?.createRef?.ref?.name;
  } catch (error) {
    console.log(error);
    return "";
  }
}

async function createCommit({ repo, commit, owner, branch }) {
  const query =
    'mutation CreateCommit($repoWithName: String!, $branch: String!, $headline:String!, $commit:Base64String!, $oid:GitObjectID!) { createCommitOnBranch( input: { branch:{ repositoryNameWithOwner: $repoWithName, branchName: $branch, } message: { headline: $headline}, fileChanges: { additions:[{ path: "package.json", contents: $commit }] }, expectedHeadOid: $oid }, ) { commit { id oid, url } }}';
  const variables = {
    repoWithName: `${owner}/${repo}`,
    branch,
    headline: "Automated PR",
    commit,
    oid: await getOid({ user: owner, name: repo, branch }),
  };
  try {
    const data = await graphqlHelper(query, variables);
    return "";
  } catch (error) {
    console.log(error);
    return "";
  }
}

async function createPullRequest({
  branch,
  repositoryId,
  head,
  title = "Automated Dependency Commit",
  body = "Dependency Update",
}) {
  const query =
    "mutation CreatePullRequest($input: CreatePullRequestInput!) { createPullRequest(input: $input) { pullRequest { number title url } }}";
  const variables = {
    input: {
      repositoryId: repositoryId,
      baseRefName: head,
      headRefName: branch,
      title: title,
      body: body,
      maintainerCanModify: true,
    },
  };
  try {
    const data = await graphqlHelper(query, variables);
    return data?.createPullRequest?.pullRequest?.url;
  } catch (error) {
    console.log(error);
    return "";
  }
}

async function getOid({ user, name, branch }) {
  const query =
    " query ($owner: String!, $repo: String!, $ref: String!) { repository(owner: $owner, name: $repo) { ref(qualifiedName: $ref) { target { oid } } } }";
  const variables = {
    owner: user,
    repo: name,
    ref: branch,
  };
  try {
    const data = await graphqlHelper(query, variables);
    return data?.repository?.ref?.target?.oid;
  } catch (error) {
    console.log(error);
    return "";
  }
}

async function graphqlHelper(query, variables) {
  const apiUrl = "https://api.github.com/graphql";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.get(configKey)}`,
  };

  try {
    const { data } = await axios.post(
      apiUrl,
      {
        query,
        variables,
      },
      {
        headers,
      }
    );

    return data?.data;
  } catch (error) {
    console.log(error);
    return error;
  }
}

function generateAwesomeBranchName() {
  const adjectives = ["awesome", "fantastic", "amazing", "incredible", "epic"];
  const nouns = [
    "rhino",
    "tiger",
    "lion",
    "panther",
    "eagle",
    "ocean",
    "mountain",
    "sunset",
    "moon",
    "star",
  ];

  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${randomAdjective}-${randomNoun}`;
}

module.exports = {
  update,
};
