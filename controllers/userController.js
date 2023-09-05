const db = require("../db/db");
const bcrypt = require("bcrypt");

const signin = (req, res) => {
  var email = req.body.email;
  var password = req.body.password;
  var return_val = {};
  db.query(
    'SELECT password, name, email FROM user WHERE email = "' + email + '"',
    (error, results) => {
      if (results.length === 0) {
        return_val.success = false;
        return_val.msg = "Unregistered User!";
        res.status(200).json(return_val);
      } else {
        bcrypt.compare(password, results[0].password, (err, isMatch) => {
          if (err) {
            return_val.success = false;
            return_val.msg = err;
            res.status(500).json(return_val);
          }

          if (isMatch) {
            return_val.success = true;
            return_val.name = results[0].name;
            return_val.email = results[0].email;
            res.status(200).json(return_val);
          } else {
            return_val.success = false;
            return_val.msg = "Password incorrect!";
            res.status(200).json(return_val);
          }
        });
      }
    }
  );
};

const signup = (req, res) => {
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  var saltRounds = 10;
  var return_val = {};

  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      return_val.success = false;
      return_val.msg = err;
      res.status(500).json(return_val);
    }
    
    db.query("SELECT * FROM user WHERE email='" + email + "'" , (error, results) => {
      if (error) {
        return_val.success = false;
        return_val.msg = error;
        res.status(500).json(return_val);
      } else {
        if(results.length !== 0) {
          return_val,success = true;
          return_val.msg = "This email is already taken. Input another email";
          res.status(200).json(return_val);
        } else {
          db.query(
            'INSERT INTO user (email, password, name) VALUES ("' +
              email +
              '", "' +
              hashedPassword +
              '", "' +
              name +
              '")',
            (error, results) => {
              if (error) {
                return_val.success = false;
                return_val.msg = error;
                res.status(500).json(return_val);
              } else {
                return_val.success = true;
                return_val.name = name;
                return_val.email = email;
                res.status(200).json(return_val);
              }
            }
          );
        }
      }
    })
  });
};

const history = (req, res) => {
  var email = req.body.email;
  var return_val = {};
  db.query(
    'SELECT history.time, history.score FROM history JOIN user ON history.user_id = user.id WHERE user.email = "' +
      email +
      '"',
    (error, results) => {
      if (error) {
        return_val.success = false;
        return_val.msg = error;
        res.status(500).json(return_val);
      } else {
        let sum = 0;
        for (let i = 0; i < results.length; i++) {
          sum += results[i].score;
        }
        return_val.success = true;
        return_val.data = results;
        return_val.sum = sum;
        res.status(200).json(return_val);
      }
    }
  );
};

const checkAvailable = (req, res) => {
  var email = req.body.email;
  var return_val = {};
  db.query(
    'SELECT MAX(history.time) AS most_recent FROM history JOIN user ON history.user_id = user.id WHERE user.email = "' +
      email +
      '"',
    (error, results) => {
      if (error) {
        return_val.success = false;
        return_val.msg = error;
        res.status(500).json(return_val);
      } else {
        return_val.success = true;
        var previous = results[0].most_recent;
        var previous_day = new Date(parseInt(previous)).getDate();
        var today = Date.now();
        var today_day = new Date(parseInt(today)).getDate();
        if (today_day - previous_day !== 0) {
          return_val.play = true;
        } else {
          return_val.play = false;
        }
        res.status(200).json(return_val);
      }
    }
  );
};

const insertDiceVal = (req, res) => {
  var email = req.body.email;
  var result = req.body.result;
  const currentTime = Date.now();
  var inserting_val = String(result) + String(currentTime);
  var return_val = {};
  db.query(
    'UPDATE user SET last_dice = "' + inserting_val + '" WHERE email = "' + email + '"',
    (error, results) => {
      if (error) {
        return_val.success = false;
        return_val.msg = error;
        res.status(500).json(return_val);
      } else { 
        return_val.success = true;
      }
    })
}

const checkDiceAvailable = (req, res) => {
  var email = req.body.email;
  var return_val = {};
  db.query('SELECT last_dice FROM user WHERE email = "' + email + '"', (error, results) => {
    if(results.length === 0) {
      return_val.success = true;
      return_val.msg = "no user";
      res.status(200).json(return_val);
    }else {
      var data = results[0].last_dice;
      if(data === "0"){
        return_val.success = true;
        return_val.previous_val = 1;
      } else {
        var dice_result = data.slice(0,1);
        var timestamp = data.slice(1);
        var previous_day = new Date(parseInt(timestamp)).getDate();
        var today = new Date(parseInt(Date.now())).getDate();
        if(today - previous_day !== 0) {
          return_val.success = true;
          return_val.previous_val = 1;
        } else {
          return_val.success = false;
          return_val.previous_val = dice_result;
        }
      }
      res.status(200).json(return_val);
    }    
  })
}

module.exports = {
  signin,
  signup,
  history,
  checkAvailable,
  insertDiceVal,
  checkDiceAvailable
};
