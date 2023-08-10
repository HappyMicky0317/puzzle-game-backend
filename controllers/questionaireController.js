const db = require("../db/db");

const axios = require("axios");

const { OPENAI_KEY } = require("./constants");

const initial = async (req, res) => {
  var clues_num = req.body.num;
  var return_val = {};

  db.query("SELECT * FROM main_object", (error, results) => {
    if (error) {
      res.status(500).json({
        success: false,
        msg: "Error executing the query",
      });
    } else {
      var len = results.length;
      var random_int = Math.floor(Math.random() * len) + 1;
      db.query(
        "SELECT main_object.id AS id, main_object.name AS subject_name, category.name AS category_name, category.id AS category_id FROM main_object JOIN category ON main_object.category_id = category.id WHERE main_object.id = " +
          random_int,
        (error, results) => {
          if (error) {
            res.status(500).json({
              success: false,
              msg: "Error executing the query",
            });
          } else {
            var subject = results[0].subject_name;
            var category = results[0].category_name;
            return_val.subject = subject;
            return_val.category = category;
            db.query(
              "SELECT * FROM bonus_clues WHERE category_id = " +
                results[0].category_id,
              async (error, results) => {
                if (error) {
                  res.status(500).json({
                    success: false,
                    msg: "Error executing the query",
                  });
                } else {
                  var query_length = results.length;
                  var random_quires = [];
                  for (var i = 0; i < clues_num; i++) {
                    if (i === 0) {
                      var temp_random =
                        Math.floor(Math.random() * query_length) + 1;
                      random_quires.push(temp_random);
                    } else {
                      while (random_quires.includes(temp_random)) {
                        var temp_random =
                          Math.floor(Math.random() * query_length) + 1;
                      }
                      random_quires.push(temp_random);
                    }
                  }
                  db.query(
                    `SELECT question FROM bonus_clues WHERE id IN (${random_quires.join(
                      ","
                    )})`,
                    async (error, results) => {
                      return_val.clues = [];
                      var wiki_data = await wikiFunc(subject);
                      for (var i = 0; i < results.length; i++) {
                        for (var k = 0; k < 50000; k++) {}
                        var question = results[i].question;
                        var answer = await gptFunc(
                          subject,
                          wiki_data.extract,
                          question
                        );
                        return_val.clues[i] = {};
                        return_val.clues[i].question = question;
                        return_val.clues[i].answer = answer.answer;
                      }
                      return_val.success = true;
                      console.log(return_val);
                      res.status(200).json(return_val);
                    }
                  );
                }
              }
            );
          }
        }
      );
      // res.status(200).json({
      //     success: true,
      //     message: results.length
      // })
    }
  });
};

const asking = async (req, res) => {
  const subject = req.body.subject;
  const question = req.body.question;
  const wiki_data = await wikiFunc(subject);
  const description = wiki_data.extract;

  var answer = await gptFunc(subject, description, question);

  if (answer.success === true) {
    res.status(200).json(answer.answer);
  } else {
    res.status(500).json(answer.message);
  }
};

const getDescription = async (req, res) => {
  var subject = req.body.subject;
  var val = await wikiFunc(subject);
  if (val.success === true) {
    res.status(200).json(val);
  } else {
    res.status(500).json(val);
  }
};

const insertResult = (req, res) => {
  var score = req.body.score;
  var email = req.body.email;
  var return_val = {};
  const currentTime = Date.now();
  db.query(
    'INSERT INTO history (user_id, time, score) SELECT id, "' +
      currentTime +
      '", "' +
      score +
      '" FROM user WHERE email = "' +
      email +
      '"',
    (error, results) => {
      if (error) {
        return_val.success = false;
        return_val.msg = error;
        res.status(500).json(return_val);
      } else {
        return_val.success = true;
        res.status(200).json(return_val);
      }
    }
  );
  console.log(score + "/" + email);
};

const wikiFunc = async (subject) => {
  var return_val = {};
  const apiUrl =
    "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=" +
    subject;
  try {
    return_val.success = true;
    const response = await axios.get(apiUrl, {
      headers: {
        "User-Agent": "Your User Agent",
        "Accept-Language": "en-US",
      },
    });

    // Process the response data
    return_val.pageId = Object.keys(response.data.query.pages)[0]; // wikipedia page ID
    return_val.extract = response.data.query.pages[return_val.pageId].extract; // wikipedia main description

    // process for getting profile image from wikipedia
    const imageUrl =
      "https://en.wikipedia.org/w/api.php?action=query&titles=" +
      subject +
      "&prop=pageimages&format=json&pithumbsize=1000";
    const imageResponse = await axios.get(imageUrl, {
      headers: {
        "User-Agent": "Your User Agent",
        "Accept-Language": "en-US",
      },
      // params : params
    });
    return_val.image =
      imageResponse.data.query.pages[return_val.pageId].thumbnail.source;
    return return_val;
  } catch (error) {
    return_val.success = false;
    return_val.message = error;
    return return_val;
  }
};

const gptFunc = async (subject, description, question) => {
  var return_val = {};
  try {
    const apiKey = OPENAI_KEY;

    const endpoint = "https://api.openai.com/v1/completions";

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };
    var prompt = `This is about ${subject}.
            ${description}

            ${question}
            Answer with yes or no.
        `;
    const data = {
      prompt: prompt,
      model: "gpt-3.5-turbo", // specify the model you want to use
    };
    var response = await axios.post(endpoint, data, { headers });
    var answer = response.data.choices[0].text;
    answer = answer.replaceAll("\n", "");
    answer = answer.replaceAll(".", "");
    return_val.success = true;
    return_val.answer = answer;
    return return_val;
  } catch (error) {
    return_val.success = false;
    return_val.message = error;
    return return_val;
  }
};

module.exports = {
  initial,
  asking,
  getDescription,
  insertResult,
};
