const app = require("./../server").app ;

app.get("/" , (req , res)=>{
    res.render("login") ;
}) ;
app.post("/game" , (req , res)=>{
    res.render("game", req.body) ;
})