const http = require('http')

const server = http.createServer((req,res)=>{
    console.log('In the server'+req.url);
    res.end('Hello world')
}).listen(8081)