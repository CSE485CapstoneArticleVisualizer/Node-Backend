const auth = require("../middleware/auth"); // authorization
const _ = require("lodash");
const { User, validate } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { Pool, Client } = require("pg");
const connectionString = "postgresql://stephen:stephen@localhost:5434/stephen";
const d3 = require("d3");

router.get("/get_author", async (req, res) => {
  // Data is retrieved from the json web token
  console.log("Called Get Author");

  const pool = new Pool({
    connectionString: connectionString
  });

  let result = await pool.query(
    "SELECT S.* FROM sma S, article_authors A WHERE S.id = A.article_id AND A.author_name LIKE '%Carlos Penilla%'"
  );

  let articles = [];
  let links = [];
  for (var i = 0; i < result.rows.length; i++) {
    const article = result.rows[i];
    const article_id = article.id;

    let cites = await pool.query(
      // `SELECT S.* FROM sma S, (SELECT C.* FROM cites C WHERE C.article_id = ${article_id}) C WHERE S.id = C.cites_article_id`
      `SELECT S.* 
                  FROM sma S, 
                  (SELECT C.* FROM cited_by C WHERE C.article_id = ${article_id}) C 
                  WHERE S.id = C.cited_by_id`
    );

    for (var j = 0; j < cites.rows.length; j++) {
      // {id, abstract, publish_date, title, journal_id, author} = cites[j];

      // let author = await pool.query(
      //   `SELECT S.*
      //             FROM sma S, article_authors A
      //             WHERE S.id = A.article_id
      //             AND A.author_name = %s`
      // );

      // citing_articles.push({
      //   id: id,
      //   title: title,
      //   author: "Alex Nou",
      //   abstract: abstract,
      //   publish_date: publish_date,
      //   journal_id: journal_id
      // })
      const id = cites.rows[j].id;
      articles.push(id);
      links.push({ source: article_id, target: id });
    }

    res.send({ articles, links });
  }

  // const client = new Client({
  //   connectionString: connectionString
  // });
  // client.connect();

  // client.query("SELECT NOW()", (err, res) => {
  //   console.log(err, res);
  //   client.end();
  // });

  // const user = await User.findById(req.user._id).select("-password"); // Exclude the password property
  // res.send(user);
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
