const db = require("../db/db");

const axios = require("axios");

const { OPENAI_KEY } = require("./constants");

const initial = async (req, res) => {
  var clues_num = req.body.num;
  var email = req.body.email;
  var return_val = {};
  db.query(
    "SELECT id FROM user WHERE email = '" + email + "'",
    async (error, results) => {
      if (results.length !== 0) {
        var user_id = results[0].id;
        var subject_data = await getSubject(user_id);
        return_val.subject = subject_data.subject_name;
        return_val.category = subject_data.category_name;
        var category_id = subject_data.category_id;
        var bonusq_data = await getBonusq(user_id, category_id, clues_num,subject_data.subject_name);
        return_val.clues = bonusq_data;
        var userq_data = await getUserq(user_id);
        return_val.userq = userq_data;
        return_val.success = true;
        res.status(200).json(return_val);
      } else {
        return_val.success = false;
        return_val.msg = "Invalid user";
        res.status(200).json(return_val);
      }
    }
  );
};

const asking = async (req, res) => {
  const subject = req.body.subject;
  const question = req.body.question;
  const email = req.body.email;
  const wiki_data = await wikiFunc(subject);
  const description = wiki_data.extract;
  var answer = await gptFunc(subject, description, question);
  var temp = {};
  temp.question = question;
  temp.flag = answer.answer;
  var insert_val = [];
  var today = Date.now();

  if (answer.success === true) {
    db.query("SELECT id FROM user WHERE email = '" + email + "'", async (error, result) => {
      var user_id = result[0].id;
      console.log(user_id);
      var questionaire = await sqlQuery(
        "SELECT userq, time FROM previous_userq WHERE user_id = '" + user_id + "'"
      );
      questionaire = Object.values(JSON.parse(JSON.stringify(questionaire)));
      if(questionaire.length === 0) {
        insert_val.push(temp);
        const qeryResult =await sqlQuery(
          "INSERT INTO previous_userq (user_id, userq, time) VALUES ('" + user_id + "','" + JSON.stringify(insert_val) + "','" + today + "')"
        );
      } else {
        var previous_time = questionaire[0].time;
        var previous_day = new Date(parseInt(previous_time)).getDate();
        var today_day = new Date(parseInt(Date.now())).getDate();
        if (today_day - previous_day !== 0) {
          insert_val.push(temp);
          const qeryResult =await sqlQuery(
            "UPDATE previous_userq SET userq = '" + JSON.stringify(insert_val) + "', time = '" + today + "' WHERE user_id = '" + user_id + "'"
          );
        } else {
          var current_userq = await sqlQuery(
            "SELECT userq FROM previous_userq WHERE user_id = '" + user_id + "'"
          );
          current_userq = Object.values(JSON.parse(JSON.stringify(current_userq)));
          insert_val = JSON.parse(current_userq[0].userq);
          insert_val.push(temp);
          const qeryResult =await sqlQuery(
            "UPDATE previous_userq SET userq = '" + JSON.stringify(insert_val) + "', time = '" + today + "' WHERE user_id = '" + user_id + "'"
          );
        }
      }
      res.status(200).json(answer.answer);      
    })
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
};

const sqlQuery = (queryString) => {
  return new Promise((resolve, reject) => {
    db.query(queryString, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};
// get subject and category
const getSubject = async (user_id) => {
  const qeryResult =await sqlQuery(
    "SELECT previous_subject.time AS previous_time, main_object.id AS subject_id, main_object.name AS subject_name, main_object.category_id AS category_id FROM previous_subject JOIN main_object ON previous_subject.subject_id = main_object.id WHERE previous_subject.user_id = '" + user_id + "'"
  );
  const results = Object.values(JSON.parse(JSON.stringify(qeryResult)));
  if (results.length === 0) {
    return randomSubject(user_id);
  } else {
    var previous_time = results[0].previous_time;
    var previous_day = new Date(parseInt(previous_time)).getDate();
    var today_day = new Date(parseInt(Date.now())).getDate();
    if (today_day - previous_day !== 0) {
      return randomSubject(user_id);
    } else {
      var result = await
      sqlQuery(
        "SELECT main_object.id AS id, main_object.name AS subject_name, category.name AS category_name, category.id AS category_id FROM previous_subject JOIN main_object ON previous_subject.subject_id = main_object.id JOIN category ON main_object.category_id = category.id WHERE previous_subject.user_id = '"
         +
          user_id +
          "'");
        result = Object.values(JSON.parse(JSON.stringify(result)));
        return result[0];
    }
  }
};

// getting random subject and category
const randomSubject = async (user_id) => {
  var results = await sqlQuery("SELECT * FROM main_object");
  results = Object.values(JSON.parse(JSON.stringify(results)));
  var len = results.length;
  var random_int = Math.floor(Math.random() * len) + 1;
  var selected_val1 = await sqlQuery("SELECT main_object.id AS id, main_object.name AS subject_name, category.name AS category_name, category.id AS category_id FROM main_object JOIN category ON main_object.category_id = category.id");
  var selected_val = [];
  selected_val[0] = selected_val1[random_int - 1];
  selected_val = Object.values(JSON.parse(JSON.stringify(selected_val)));
  var subject_id = selected_val[0].id;
  var today = Date.now();

  results = await sqlQuery("SELECT * FROM previous_subject WHERE user_id = '" + user_id + "'");
  results = Object.values(JSON.parse(JSON.stringify(results)));

  if (results.length === 0) {
    var query =
      "INSERT INTO previous_subject (user_id, subject_id, time) VALUES ('" +
      user_id +
      "','" +
      subject_id +
      "', + '" +
      today +
      "')";
  } else {
    var query =
      "UPDATE previous_subject SET subject_id = '" +
      subject_id +
      "', time = '" +
      today +
      "' WHERE user_id = '" +
      user_id +
      "'";
  }
  await sqlQuery(query);
  return selected_val[0];
};

const getBonusq = async (user_id, category_id, clues_num,subject_name) => {
  const qeryResult =await sqlQuery(
    "SELECT previous_bonusq.time AS previous_time FROM previous_bonusq WHERE previous_bonusq.user_id = '" + user_id + "'");
  const results = Object.values(JSON.parse(JSON.stringify(qeryResult)));
  if (results.length === 0) {
    return randomBonusq(user_id, category_id, clues_num,subject_name);
  } else {
    var previous_time = results[0].previous_time;
    var previous_day = new Date(parseInt(previous_time)).getDate();
    var today_day = new Date(parseInt(Date.now())).getDate();
    if(today_day - previous_day !== 0) {
    return randomBonusq(user_id, category_id, clues_num,subject_name);
    } else {
      var result = await
      sqlQuery(
        "SELECT bonusq FROM previous_bonusq WHERE user_id = '" + user_id +
          "'");
      result = Object.values(JSON.parse(JSON.stringify(result)));
      return JSON.parse(result[0].bonusq);
    }
  }
}

const randomBonusq = async (user_id, category_id, cluse_num,subject_name) => {
  var qeryResult =await sqlQuery(
    "SELECT * FROM bonus_clues WHERE category_id = " + category_id);
  qeryResult = Object.values(JSON.parse(JSON.stringify(qeryResult)));
  var query_length = qeryResult.length;
  var random_quires = [];
  for (var i = 0; i < cluse_num; i++) {
    if (i === 0) {
      var temp_random =
        Math.floor(Math.random() * query_length) + 1;
      random_quires.push(temp_random);
    } else {
      while (random_quires.includes(temp_random)) {
        var temp_random =
          Math.floor(Math.random() * 10) + 1;
      }
      random_quires.push(temp_random);
    }
  }
  var results_data =await sqlQuery(
    `SELECT question FROM bonus_clues WHERE category_id = ` + category_id);
    var results = [];
  for(var i = 0; i < cluse_num ; i++) {
    results.push(results_data[random_quires[i] - 1]);
  }
  results = Object.values(JSON.parse(JSON.stringify(results)));

  var return_val = [];
  var wiki_data = await wikiFunc(subject_name);
  for (var i = 0; i < results.length; i++) {
    for (var k = 0; k < 50000; k++) {}
    var question = results[i].question;
    var answer = await gptFunc(
      subject_name,
      wiki_data.extract,
      question
    );
    return_val[i] = {};
    return_val[i].question = question;
    return_val[i].answer = answer.answer;
  }

  var today = Date.now();
  var check_results = await sqlQuery("SELECT * FROM previous_bonusq WHERE user_id = '" + user_id + "'");
  check_results = Object.values(JSON.parse(JSON.stringify(check_results)));
  if (check_results.length === 0) {
    var query =
      "INSERT INTO previous_bonusq (user_id, bonusq, time) VALUEs ('" +
      user_id +
      "','" +
      JSON.stringify(return_val) +
      "', + '" +
      today +
      "')";
  } else {
    var query =
      "UPDATE previous_bonusq SET bonusq = '" +
      JSON.stringify(return_val) +
      "', time = '" +
      today +
      "' WHERE user_id = '" +
      user_id +
      "'";
  }
  await sqlQuery(query);
  return return_val;
}

const getUserq = async (user_id) => {
  var return_val = [];
  var query_result = await sqlQuery("SELECT userq, time FROM previous_userq WHERE user_id = '" + user_id + "'");
  query_result = Object.values(JSON.parse(JSON.stringify(query_result)));
  if(query_result.length === 0) {
    return return_val;
  } else {
    var previous_time = query_result[0].time;
    var previous_day = new Date(parseInt(previous_time)).getDate();
    var today_day = new Date(parseInt(Date.now())).getDate();
    if(today_day - previous_day !== 0) {
      return return_val;
    } else {
      return_val = JSON.parse(query_result[0].userq);
      return return_val;
    }
  }
}

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
    var temp_imageurl =
      imageResponse.data.query.pages[return_val.pageId].thumbnail?.source;
    if(temp_imageurl){
      return_val.image = temp_imageurl
    } else {
      return_val.image = ""
    }
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

    const endpoint = "https://api.openai.com/v1/chat/completions";

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    };
    var prompt = `
            This is about ${subject}.
            ${description}
            
            Below question is about the subject in above description.
            ${question}
            Answer with Yes or No.
        `;
    const data = {
      "messages": [{
        "role": "user",
        "content": prompt
      }],
      model: "gpt-3.5-turbo", // specify the model you want to use,
      // model: "gpt-4", // specify the model you want to use,
    };
    var response = await axios.post(endpoint, data, { headers });
    var answer = response.data.choices[0].message.content;
    answer = answer.replaceAll("\n", "");
    answer = answer.replaceAll(".", "");
    answer = answer.replaceAll(" ", "");
    if(answer !== "Yes") {
      if(answer !== "No"){
        answer = "No"
      }
    }
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
