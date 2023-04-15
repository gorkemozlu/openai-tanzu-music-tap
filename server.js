require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http'); // import http module
const server = http.createServer(app); // create a new HTTP server instance
const io = require('socket.io')(server);
const axios = require('axios');
const port = process.env.PORT || 8080;
const { Configuration, OpenAIApi } = require('openai');
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use('/favicon.ico', express.static('/favicon.ico'));
app.use(express.json());

app.get('/', (req, res) => {
  res.render('index');
});

// handle socket.io connections
io.on('connection', (socket) => {
  // handle user selection
  socket.on('select', async (selection) => {
    // generate recommendations based on selection
    let recommendations = await generateRecommendations(selection);
    // send recommendations to all connected clients
    io.emit('recommendations', recommendations);
  });
});

async function generateRecommendations(selection) {
  try {
    
    const data = {
      model: 'text-davinci-003',
      prompt: `Act as API endpoint. Only return names, nothing else. No numbering bullets. Give me some music recommendations based my selection: ${selection.join(', ')}.`
    };

    let res = await axios.post('http://localhost:8080/openai/text', data, { headers: { 'Content-Type': 'application/json' }})
    
    let dataa = res.data.result;
    console.log(res.data.result)
    return dataa

  } catch (err) {
    console.error(err);
    return [];
  }
}

app.use('/openai', require('./routes/openAIRoutes'));

server.listen(8080, () => {
  console.log('Server listening on port 8080');
});