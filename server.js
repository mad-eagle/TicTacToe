const http = require("http") ;
const express = require("express") ;
const info = require("./src/config.cfg") ;

console.clear() ;

const app = express() ;
const server = http.createServer(app) ;
module.exports = { server , app } ;
const port = process.env.PORT || info.port ;
const hostname = info.host ;
const link = `http://${hostname}:${port}` ;

app.use(express.static(__dirname + "/public")) ;
app.use(express.urlencoded({extended : false}));
app.set("view engine" , "pug") ;

require("./src/routes") ;
require("./src/socket.io") ;





server.listen( port, ()=>{
    console.log(`Server running on ${link}`) ;
})