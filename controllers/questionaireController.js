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
    const subject = req.body.subject;
    const question = req.body.question;
    console.log(subject + "/" + question);

    const apiKey = "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";

    const endpoint = 'https://api.openai.com/v1/completions';

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };

    var prompt = "This ia about " + subject + ".";
    prompt = prompt + question;
    prompt = prompt + "Answer with yes or no.";

    const data = {
        prompt: prompt,
        // max_tokens: 50,
        model: 'text-davinci-002' // specify the model you want to use
    };

    axios.post(endpoint, data, { headers })
    .then(response => {
        // handle the response
        console.log(response.data.choices[0].text);
        res.status(200).json({
            answer:response.data.choices[0].text
        })
    })
    .catch(error => {
        // handle the error
        console.error(error);
    });
    
}


const getDescription = async (req, res) => { 
    var subject = req.body.subject;

    const apiUrl = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=" + subject;
    try {
        const response = await axios.get(apiUrl, { 
            headers: {
                'User-Agent': 'Your User Agent',
                'Accept-Language': 'en-US',
            },
        });

        // Process the response data
        const return_val_pageId = Object.keys(response.data.query.pages)[0];
        const return_val_extract = response.data.query.pages[return_val_pageId].extract;

        // https://en.wikipedia.org/w/index.php?curid=21721040               url for visiting wikipedia site by using pageID

        // https://en.wikipedia.org/w/api.php?action=query&titles=Stack%20Overflow&prop=pageimages&format=json&pithumbsize=1000    url for getting representing images
          
        // process for getting profile image from wikipedia
        const imageUrl = "https://en.wikipedia.org/w/api.php?action=query&titles=" + subject + "&prop=pageimages&format=json&pithumbsize=1000";
        const imageResponse = await axios.get(imageUrl, { 
            headers: {
                'User-Agent': 'Your User Agent',
                'Accept-Language': 'en-US',
            },
            // params : params
        });
        var return_val_image = imageResponse.data.query.pages[return_val_pageId].thumbnail.source
        console.log(JSON.stringify(imageResponse.data.query.pages[return_val_pageId].thumbnail.source));


        res.status(200).json({
            success:true,
            data : {
                pageId : return_val_pageId,
                description: return_val_extract,
                image: return_val_image
            }
        })
    } catch (error) {
        console.log("Error:", error)
        res.status(500).json({
            success:false,
            msg:"Error executing the query"
        })
    }
}

module.exports = {
    getSubject,
    asking,
    getDescription
}