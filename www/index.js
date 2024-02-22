const express = require('express')
const mysql = require('mysql')
const qrcode = require('qrcode')

const app = express()

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({extended: false}))


//connecting database
const conn = mysql.createConnection({ //connecting parameters 
    host: "localhost",
    user: "root",
    database: "testnode",
    password: ""
})

function openConnection(){
    conn.connect(err => { //open connect
        if(err) {
            return err;
        }
        else {
            console.log('Database ----- ON')
        }
    })
}

function endConnection(){
    conn.end(err => { //end connect
        if(err) {
            return err;
        }
        else {
            console.log('Database ----- OFF')
        }
    })
}


app.get('/', (req, res) => {
    res.render('index')
})

app.get('/about', (req, res) => {
    res.render('about')
})

app.get('/users', (req, res) => {
    let query = "SELECT * FROM `User`"
    conn.query(query, (err, result, field) => {
        res.render('users', {result: result})
    })
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.get('/user/:id', (req, res) => {
    openConnection()
    let id = req.params.id
    let query = "SELECT * FROM `User` WHERE id = " + id //query
    conn.query(query, (err, result, field) => { //result
            data = {id: id, name: result[0]['Name'], surname: result[0]['Surname'], age: result[0]['Age'], dir: __dirname}
            res.render('user', data)
    })
})

app.get('/user/update/:id', (req, res) => {
    let id = req.params.id
    let query = `SELECT * FROM User WHERE id = ` + id
    conn.query(query, (err ,result, field) => {
        res.render('updateUser', {result: result})
    })
})

app.get('/user/delete/:id', (req, res) => {
    let id = req.params.id
    let query = `DELETE FROM User WHERE id = ` + id
    conn.query(query, (err, result, field) => {
        res.redirect('/users')
    })
})

app.post('/check-user', (req, res) => {
    let id = req.body.id
    if(id == "")
        return res.redirect('/')
    else
        return res.redirect('/user/' + id)
})

app.post('/create-user', (req, res) => {
    let query = `INSERT INTO User (Name, Surname, Age) VALUES ('${req.body.name}', '${req.body.surname}', ${req.body.age})`
    conn.query(query, (err, result, field) => {
        res.redirect('/')
    })
})

app.post('/update-user', (req, res) => {
    let query = `UPDATE User SET Name='${req.body.Name}', Surname='${req.body.Surname}', Age=${req.body.Age} WHERE id = ${req.body.id}`
    conn.query(query, (err, result, field) => {
        res.redirect('users')
    })
})

app.get('/generate/:id', async (req, res) => {
    let id = req.params.id
    const url = `http://localhost:3000/user/` + id;
    console.log(url)
    if (!url) {
        return res.status(400).send('URL не указан.');
    }
    qrcode.toFile(__dirname + '/public/qrcode/User' + id + 'qrcode.png', url);
    res.redirect('/')
});

app.get('/hospitalMap', (req, res) => {
    // const result = fetch('http://localhost:3001/api/v1/hospitalMapApi')
    //     .then((response) => response.text())
    //     .then((body) => {
    //         res.render('hospitalMap', {pacient: JSON.parse(body)})
    //     }); 
    let data = [
        ['1', 'Стерилизационная', 'pacient'],
        ['2', 'Стерилизационная', 'doctor'],
        ['3', 'Архив', 'pacient'],
        ['4', 'Главный врач', 'doctor'],
        ['9', 'Главный врач', 'doctor'],
        ['10', 'Главный врач', 'pacient']
    ]
    res.render('hospitalMap', {pacient: data})
})

//api
app.get("/api/v1/user/:id", (req, res) => {
    let id = req.params.id
    let query = "SELECT * FROM `User` WHERE id = " + id //query
    conn.query(query, (err, result, field) => { //result
            data = {id: id, name: result[0]['Name'], surname: result[0]['Surname'], age: result[0]['Age']}
            res.send(data)
    })
})

const PORT = 3000
app.listen(PORT, () => {
    console.log(`Server strated: http://localhost:${PORT}`)
})