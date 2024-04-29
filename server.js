const app = require("./app");
const connectDatabase = require("./db/Database");

//Handling uncaught Exception
process.on("uncaughtException", (err) => {
    console.log('Error: ${error.message');
    console.log("shutting down the server for handling ucaught exception");

})

//config
console.log("process.env.NODE_ENV ",process.env.NODE_ENV )
// if(process.env.NODE_ENV !== "PRODUCTION"){
    require("dotenv").config()
// }

//connect database
connectDatabase();

//create server
app.get("/",async(req,res)=>{
res.send("server live") 

})
const server = app.listen(process.env.PORT,() => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
})

//unhandled promise rejection
process.on("unhandledRejection", (err) => {
    console.log(err)
    console.log('shutting down the server for ${err.message}');
    console.log('shutting down the server for unhandle promise rejection');

    server.close(() => {
        process.exit(1);
    });

}); 