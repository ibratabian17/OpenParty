var { main } = require('./var')
var fs = require("fs");  // require https module


function init(app, express) {
    const bodyParser = require("body-parser");
    app.use(express.json());
    app.use(bodyParser.raw());
    app.use((err, req, res, next) => {
        // shareLog('ERROR', `${err}`)
        res.status(500).send('Internal Server Error');
        //idk what happened
    });

    //initialize route module
    require('./route/rdefault').initroute(app);
    require('./route/account').initroute(app);
    require('./route/leaderboard').initroute(app);
    require('./route/ubiservices').initroute(app);
    require('./wdf/fakewdf').initroute(app);
    
    //hide error when prod 
    app.get('*', function(req, res){
     res.status(404).send({
       'error': 404,
       'message': 'Path Not Recognized'
     });
    });
}

module.exports = {
    main, init
}