const express = require('express')
const cors = require('cors')
const app = express()
const authRoute = require('./routes/auth.route')

require('dotenv').config()

app.use(express.json())
app.use(cors())


app.use(authRoute)

app.get('/', (req, res) => {
    res.send('hello,world')
})

const port = process.env.PORT
app.listen(port, () => {
    console.log(`server starting at http://localhost:${port}`)
})