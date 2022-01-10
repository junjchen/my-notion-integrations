const { Client } = require("@notionhq/client");
const getRandomEmoji = require("../random-emojis");
const isWorkday = require("./is-workday");
const WORKLOG_LIST_DATABASE_ID = "a336f7bad4184447b3a36827aa1e4728";
const notion = new Client({ auth: process.env.NOTION_API_KEY });

const createPageForToday = (todoBlocks) => {
  console.log("creating new a page");
  notion.pages.create({
    parent: { database_id: WORKLOG_LIST_DATABASE_ID },
    properties: {
      title: [
        {
          text: {
            content: new Date().toISOString().split("T")[0],
          },
        },
      ],
    },
    icon: {
      type: "emoji",
      emoji: getRandomEmoji(),
    },
    children: todoBlocks,
  });
};

const getLastPage = async () => {
  console.log("getting todos from the last page");
  const resp = await notion.databases.query({
    database_id: WORKLOG_LIST_DATABASE_ID,
    sorts: [{ property: "Created", direction: "descending" }],
    page_size: 1,
  });
  return resp.results[0];
};

const copyTodosFromPage = async (page) => {
  if (!page) return [];
  console.log("copying todos from page");
  const resp = await notion.blocks.children.list({
    block_id: page.id,
    page_size: 100,
  });
  return resp.results
    .filter((x) => x.type === "to_do")
    .filter((x) => !x.to_do.checked)
    .map((x) => ({
      object: "block",
      type: "to_do",
      to_do: x.to_do,
    }));
};

module.exports = () => {
  if (!isWorkday()) {
    console.log("skipping weekend");
    return;
  }
  return getLastPage().then(copyTodosFromPage).then(createPageForToday);
};
