const db = require("../db/db");
const bcrypt = require("bcrypt");

const signin = async (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    var return_val = {}
    db.query('SELECT password, name, email FROM user WHERE email = "' + email + '"', (error, results) => {
        if(results.length === 0){
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
    })
}

const signup = async (req, res) => {
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var saltRounds = 10;
    var return_val = {};

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if(err) {
            return_val.success = false;
            return_val.msg = err;
            res.status(500).json(return_val);
        }
        db.query('INSERT INTO user (email, password, name) VALUES ("' + email + '", "' + hashedPassword + '", "' + name + '")', (error, results) => {
            if (error) {
                return_val.success = false;
                return_val.msg = error;
                res.status(500).json(return_val);
            } else { 
                return_val.success = true;
                return_val.name = name;
                return_val.id = email;
                res.status(200).json(return_val);
            }
        })
    })
}

module.exports = {
    signin,
    signup
}