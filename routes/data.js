const _ = require("lodash");
const express = require("express");
const router = express.Router();
const { Pool, Client } = require("pg");
const connectionString = "postgresql://stephen:stephen@localhost:5434/stephen";
// const d3 = require("d3");

//Get Author
router.get("/get_author", async (req, res) => {
  // Data is retrieved from the json web token
  console.log("Called Get Author");

  // Access the provided 'page' and 'limt' query parameters
  let author = req.query.author;
  const pool = new Pool({
    connectionString: connectionString
  });

  let result = await pool.query(
    `SELECT S.* FROM sma S, article_authors A WHERE S.id = A.article_id AND A.author_name LIKE '%${author}%' limit 10`
  );

  let articles = [];
  let links = [];
  for (var i = 0; i < result.rows.length; i++) {
    const article = result.rows[i];
    const article_id = article.id;

    articles.push(article_id);

    let cites = await pool.query(
      `SELECT S.* 
                  FROM sma S, 
                  (SELECT C.* FROM cited_by C WHERE C.article_id = ${article_id}) C 
                  WHERE S.id = C.cited_by_id`
    );

    for (var j = 0; j < cites.rows.length; j++) {
      const id = cites.rows[j].id;
      articles.push(id);
      links.push({ source: article_id, target: id });
    }
  }

  console.log("#Nodes: ", articles.length);
  console.log("#Links: ", links.length);

  res.send({ articles, links });
});

//Get articles within date
router.get("/get_date_range", async (req, res) => {
  // Data is retrieved from the json web token
  console.log("Called Get Date Range");

  // Access the provided 'page' and 'limt' query parameters
  let startDate = req.query.startDate;
  let endDate = req.query.endDate;

  const pool = new Pool({
    connectionString: connectionString
  });

  let result = await pool.query(
    `SELECT S.* FROM sma S WHERE S.publish_date BETWEEN '${startDate}' and '${endDate}' limit 10`
  );

  let articles = [];
  let links = [];
  for (var i = 0; i < result.rows.length; i++) {
    const article = result.rows[i];
    const article_id = article.id;

    articles.push(article_id);

    let cites = await pool.query(
      // `SELECT S.* FROM sma S, (SELECT C.* FROM cites C WHERE C.article_id = ${article_id}) C WHERE S.id = C.cites_article_id`
      `SELECT S.* 
                  FROM sma S, 
                  (SELECT C.* FROM cited_by C WHERE C.article_id = ${article_id}) C 
                  WHERE S.id = C.cited_by_id`
    );

    for (var j = 0; j < cites.rows.length; j++) {
      const id = cites.rows[j].id;
      articles.push(id);
      links.push({ source: article_id, target: id });
    }
  }

  console.log("#Nodes: ", articles.length);
  console.log("#Links: ", links.length);

  res.send({ articles, links });
});

//Get Articles by Keyword
router.get("/get_keyword", async (req, res) => {
  // Data is retrieved from the json web token
  console.log("Called Get Keyword");

  // Access the provided 'page' and 'limt' query parameters
  let keyword = req.query.keyword;

  const pool = new Pool({
    connectionString: connectionString
  });

  let result = await pool.query(
    `SELECT S.* FROM sma S WHERE S.abstract LIKE '%${keyword}%' limit 10`
  );

  let articles = [];
  let links = [];
  for (var i = 0; i < result.rows.length; i++) {
    const article = result.rows[i];
    const article_id = article.id;

    articles.push(article_id);

    let cites = await pool.query(
      // `SELECT S.* FROM sma S, (SELECT C.* FROM cites C WHERE C.article_id = ${article_id}) C WHERE S.id = C.cites_article_id`
      `SELECT S.* 
                  FROM sma S, 
                  (SELECT C.* FROM cited_by C WHERE C.article_id = ${article_id}) C 
                  WHERE S.id = C.cited_by_id LIMIT 10`
    );

    for (var j = 0; j < cites.rows.length; j++) {
      const id = cites.rows[j].id;
      articles.push(id);
      links.push({ source: article_id, target: id });
    }
  }

  console.log("#Nodes: ", articles.length);
  console.log("#Links: ", links.length);

  res.send({ articles, links });
});

module.exports = router;
