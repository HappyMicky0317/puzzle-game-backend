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
    
    const apiUrl = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=Stack%20Overflow";
    try {
        const response = await axios.get(apiUrl, { 
            headers: {
                'User-Agent': 'Your User Agent',
                'Accept-Language': 'en-US',
            },
            // params : params
        });

        // Process the response data
        const pageId = Object.keys(response.data.query.pages)[0];
        const extract = response.data.query.pages[pageId].extract;

        // https://en.wikipedia.org/w/index.php?curid=21721040               url for visiting wikipedia site by using pageID

        // https://en.wikipedia.org/w/api.php?action=query&titles=Stack%20Overflow&prop=pageimages&format=json&pithumbsize=1000    url for getting representing images
          
        // process for getting profile image from wikipedia
        const imageUrl = "https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&format=json&iiprop=url&iiurlwidth=400&titles=Stack%20Overflow&generator=images"
        const imageResponse = await axios.get(imageUrl, { 
            headers: {
                'User-Agent': 'Your User Agent',
                'Accept-Language': 'en-US',
            },
            // params : params
        });
        console.log(JSON.stringify(imageResponse.data));


        res.status(500).json({
            success:true,
            data : response.data.query.pages
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
    asking
}