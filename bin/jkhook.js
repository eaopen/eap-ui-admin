require('dotenv').config();
const axios = require('axios');

hookUrl = `http://${process.env.JK_HOST}/buildByToken/build?job=${process.env.JK_JOB}&token=${process.env.JK_TOKEN}`;
axios.get(hookUrl)
    .then(response => {
        // handle success
        console.log(response.data);
    })
    .catch(error => {
        // handle error
        console.error(error);
    });
