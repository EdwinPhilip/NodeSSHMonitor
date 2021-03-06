var os = require("os");
var hostname = os.hostname();
require('dotenv').config()


var AlphaServerHostName;
if(process.env.ALPHASERVER_PROTOCOL && process.env.ALPHASERVER_HOSTNAME && process.env.ALPHASERVER_PORT){
    AlphaServerHostName = process.env.ALPHASERVER_PROTOCOL+"://"+process.env.ALPHASERVER_HOSTNAME+":"+process.env.ALPHASERVER_PORT;
}else{
    AlphaServerHostName = "http://localhost:3000"
}
console.log("Trying to connect to server at "+ AlphaServerHostName)
const 
    io = require ("socket.io-client"),
    socket = io.connect( AlphaServerHostName );

socket.on("connect", () => {
    console.log("Connected")
    socket.emit('client connected', hostname);
    var prev_data = ''; 
    const fs = require('fs');
    const TailingReadableStream = require('tailing-stream');
    let numberOfAttpemts = 0;
    const stream = TailingReadableStream.createReadStream(process.env.AUTH_LOG_FILE, {timeout: 0});

    stream.on('data', buffer => {
  
        curr_data = buffer.toString();
        if (curr_data && !prev_data){
            prev_data = curr_data;
        }
        else{
        console.log(curr_data);
        if (prev_data.includes('Failed none') && curr_data.includes('Connection closed')){
            numberOfAttpemts = numberOfAttpemts + 1;
            socket.emit('attempts',hostname,numberOfAttpemts);
        }
        else if (prev_data.includes('Invalid user') && curr_data.includes('Connection closed')){
            numberOfAttpemts = numberOfAttpemts + 1;
            socket.emit('attempts',hostname,numberOfAttpemts);
        }
        else if (curr_data.includes('Failed password')){
            numberOfAttpemts = numberOfAttpemts + 1;
            socket.emit('attempts',hostname,numberOfAttpemts);
        }
        else if (curr_data.includes('error: Authentication key')){
            numberOfAttpemts = numberOfAttpemts + 1;
            socket.emit('attempts',hostname,numberOfAttpemts);
        }
        else if (curr_data.includes('Failed publickey')){
            numberOfAttpemts = numberOfAttpemts + 1;
            socket.emit('attempts',hostname,numberOfAttpemts);
        }
        prev_data = curr_data;
        }

    });
    stream.on('close', () => {
        console.log("close");
    });
});
