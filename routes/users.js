const auth = require("../middleware/auth"); // authorization
const _ = require("lodash");
const { User, validate } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { Pool, Client } = require("pg");
const connectionString = "postgresql://stephen:stephen@localhost:5434/stephen";
const d3 = require("d3");

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
                  WHERE S.id = C.cited_by_id limit 10`
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

router.get("/get_article_by_id", async (req, res) => {
  // Data is retrieved from the json web token

  // Access the provided 'page' and 'limt' query parameters
  let articleID = req.query.article_id;

  const pool = new Pool({
    connectionString: connectionString
  });

  let result = await pool.query(
    `SELECT S.* FROM sma S WHERE S.id = '${articleID}'`
  );
  let title;
  let abstract;
  let published_date;
  let journal_id;

  for (var i = 0; i < result.rows.length; i++) {
    title = result.rows[i].title;
    abstract = result.rows[i].abstract;
    published_date = result.rows[i].publish_date;
    journal_id = result.rows[i].journal_id;
  }
  let journal = null;
  if (journal_id !== null) {
    let journalInfo = await pool.query(
      `SELECT J.name FROM journals J WHERE J.id = '${journal_id}'`
    );

    for (var i = 0; i < journalInfo.rows.length; i++) {
      journal = journalInfo.rows[i].name;
    }
  }

  let author = await pool.query(
    `SELECT A.author_name FROM article_authors A WHERE A.article_id = '${articleID}'`
  );

  authors = [];
  for (var i = 0; i < author.rows.length; i++) {
    let name = author.rows[i].author_name;
    authors.push(name);
  }

  let cited_by = await pool.query(
    `SELECT S.title 
                FROM sma S, 
                (SELECT C.* FROM cited_by C WHERE C.article_id = ${articleID}) C 
                WHERE S.id = C.cited_by_id`
  );

  citations = [];
  for (var i = 0; i < cited_by.rows.length; i++) {
    const citation = cited_by.rows[i].title;
    citations.push(citation);
  }


  let cites = await pool.query(
    `SELECT S.title 
                FROM sma S, 
                (SELECT C.* FROM cites C WHERE C.article_id = ${articleID}) C 
                WHERE S.id = C.cites_article_id`
  );

  references = [];
  for (var i = 0; i < cites.rows.length; i++) {
    const reference = cites.rows[i].title;
    references.push(reference);
  }

  let link = "http://google.com/search?q=" + title;


  // res.send({ title, abstract, authors, citations, references, date });
  res.send({ title, abstract, authors, citations, references, published_date, journal, link });
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

router.get("/me", async (req, res) => {
  // Data is retrieved from the json web token
  throw new Error("Failed at /me");
  const user = await User.findById(req.user._id).select("-password"); // Exclude the password property
  res.send(user);
});

router.post("/", async (req, res, next) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered");

  user = new User(_.pick(req.body, ["name", "email", "password"]));

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();
  const token = user.generateAuthToken();

  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(_.pick(user, ["_id", "name", "email"]));
});

module.exports = router;
