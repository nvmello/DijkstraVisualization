var PORT = process.env.PORT || 5000;
var express = require('express');
var app = express();

var http = require('http');
var server = http.Server(app);

app.use(express.static('dijkstra'));

server.listen(PORT, function() {
  console.log('Dijkstra Visualization Running');
});

if(process.env.NODE_ENV === 'production') {
    store = createStore(rootReducer, initialState, compose(
        applyMiddleware(...middleware)
    ));
} else {
    store = createStore(rootReducer, initialState, compose(
        applyMiddleware(...middleware),
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    ));
}