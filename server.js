var express = require('express')
var bodyParser = require('body-parser')
var path = require('path')

var app = express()

app.use(bodyParser.json())
app.use('/api/rankings', require('./controllers/api/rankings'))
app.use(require('./controllers/static'))

app.use('/icons', express.static(path.join(__dirname, 'icons')))
app.use('/styles', express.static(path.join(__dirname, 'styles')))

var port = 80
app.listen(port, function() {
	console.log('Server:', port)
})

