const db = require("../db/db");

const axios = require('axios');

const getSubject = async (req, res) => {
    // const getRandomInteger = () => {
    //     return Math.floor(Math.random() * 20) + 1;
    // };
    // const randomInteger = getRandomInteger();
    // res.status(200).json({
    //     data:randomInteger
    // })

    db.query('SELECT * FROM main_object', (error, results) => {
        if (error) {
            res.status(500).json({
                success:false,
                msg:"Error executing the query"
            })
        } else {
            var len = results.length;
            var random_int = Math.floor(Math.random() * len) + 1;
            db.query('SELECT main_object.id AS id, main_object.name AS subject_name, category.name AS category_name FROM main_object JOIN category ON main_object.category_id = category.id WHERE main_object.id = ' + random_int, (error, results) => {
                if(error) {
                    res.status(500).json({
                        success:false,
                        msg:"Error executing the query"
                    })
                } else {
                    res.status(200).json({
                        success: true,
                        results: results
                    })
                }
            })
            // res.status(200).json({
            //     success: true,
            //     message: results.length
            // })
        }
    });    
}

const asking = async (req, res) => { 
    // var subject = req.body.subject;
    // var question = req.body.question;
    // console.log(subject + "/" + question);

    const searchQueries = {
        openAI: 'OpenAI',
        apples: 'Apples',
        cats: 'Cats',
        // Add more search queries here
      };

    for (const key in searchQueries) {
        if (Object.hasOwnProperty.call(searchQueries, key)) {
            var searchQuery = searchQueries[key];
        }
    }

    console.log(searchQuery);


    const apiUrl = 'https://en.wikipedia.org/w/api.php';
    const params = {
      action: 'query',
      prop: 'extracts',
      format: 'json',
      titles: searchQuery
    };

    try {
        const response = await axios.get(apiUrl, { params });

        // Process the response data
        const pageId = Object.keys(response.data.query.pages)[0];
        const extract = response.data.query.pages[pageId].extract;
        console.log(extract);
    } catch (error) {
        console.error(error);
    }









    res.status(200).json({
        success:true,
        message: req.body
    })
}


module.exports = {
    getSubject,
    asking
}