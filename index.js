//Load express module with `require` directive
const express = require('express')
const Userc = require('../app/models/User');
const app = express()
const bodyParser = require('body-parser');

const mongoose = require('mongoose')
const port = process.env.PORT || 8081;
const db_link = "mongodb://mongo:27017/helloworlddb";


//const db_link = 'mongodb://localhost:27017/labdocker';
//para poder manejar jsons, peticiones y respuestas 
app.use(bodyParser.json({limit: '50mb'}));
//se dice que no utilizamos peticiones directamente en formularios, sino que se procesa en formato json
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};
mongoose.connect(db_link, options).then(function () {
    console.log('MongoDB is connected');
})
    .catch(function (err) {
        console.log(err);
    });
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
// Extended: https://swagger.io/specification/#infoObject
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "HelloWorld API",
            description: "Hello World Class",
            contact: {
                name: "Pedro Rios"
            },
            servers: ["http://localhost:8081"]
        }
    },
    apis: ["index.js"]
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//Define request response in root URL (/)
app.get('/', function (req, res) {
    res.send('Hello World! :)')
})



//Launch listening server on port 8081
app.listen(port, function () {
    console.log('app listening on port 8081!')
})


/**
* @swagger
*  /users:
*    post:
*      summary: Creates a new user.
*      consumes:
*        - application/json
*      parameters:
*        - in: body
*          name: user
*          description: The user to create.
*          schema:
*            type: object
*            required:
*              - username
*              - dni_user
*            properties:
*              username:
*                type: string
*              dni_user:
*                type: string
*              age:
*                type: string
*              phone:
*                type: string
*      responses:
*        '201':
*          description: Created
*        '409':
*          description: User already exist
*/
app.post('/users', function (req, res) {
    let usuario = new Userc(req.body);
    usuario.save().then(user => {
        return res.status(201).send({ user, message: "El usuario fue creado exitosamente" });
    }).catch(error => res.status(409).send({ message: "El usuario ya existe", error }));
})

/**
* @swagger
*  /users:
*    get:
*      summary: Show all users.
*      consumes:
*        - application/json
*      responses:
*        '200':
*          description: All users where showed
*        '500':
*          description: Server error
*        '204':
*          description: No users founded
*/
app.get('/users', function (req, res) {
    // busco todos los users y si no da error me devuelve arreglo users
    Userc.find({}).then(users => {
        // si hay usuarios envio codigo de aceptacion y un cuerpo con los prdctos
        if (users.length) return res.status(200).send({ users });
        //en caso de que no hayan datos se manda un codigo y un mensaje xD
        return res.status(204).send({ message: 'NO CONTENT' });
    }).catch(error => res.status(500).send({ error }));
})

/**
* @swagger
*  /user:
*    delete:
*      summary: Delete one user.
*      consumes:
*        - application/json
*      parameters:
*        - in: body
*          name: user
*          description: Delete one user
*          schema:
*            type: object
*            required:
*              - username
*            properties:
*              username:
*                type: string
*      responses:
*        '200':
*          description: User deleted
*        '404':
*          description: User Not found
*        '500':
*          description: Server error
*/
app.delete('/user', function (req, res) {
    let query = {};
    query["username"] = req.body.username;
    Userc.find(query).then(users => {
        //si no existen users
        if (!users.length) return res.status(404).send({ message: 'NOT FOUND' });
        return users[0].remove().then(user => res.status(200).send({ message: "REMOVED", user })).catch(error => res.status(500).send({ error }));
    }).catch(error => {
        if (req.body.error) return res.status(500).send({ error });
    });

})

/**
* @swagger
*  /user:
*    put:
*      summary: Edit one user.
*      consumes:
*        - application/json
*      parameters:
*        - in: body
*          name: user
*          description: Edit one user.
*          schema:
*            type: object
*            required:
*              - usernameD
*            properties:
*              usernameD:
*                type: string
*              username:
*                type: string
*              dni_user:
*                type: string
*              age:
*                type: string
*              phone:
*                type: string
*      responses:
*        '200':
*          description: User Modified
*        '500':
*          description: Server Error Modifiying user
*        '400':
*          description: Bad Request
*/
app.put('/user', function (req, res) {
    let query = {};
    query["username"] = req.body.usernameD;
    Userc.find(query).then(users => {
        let ussuario = users[0];

        if (req.body.username == undefined || req.body.username == "" || req.body.username == null) {
            req.body.username = ussuario.username;
        }
        if (req.body.dni_user == undefined || req.body.dni_user == "" || req.body.dni_user == null) {
            req.body.dni_user = ussuario.dni_user;
        }
        if (req.body.age == undefined || req.body.age == "" || req.body.age == null) {
            req.body.age = ussuario.age;
        }
        if (req.body.phone == undefined || req.body.phone == "" || req.body.phone == null) {
            req.body.phone = ussuario.phone;
        }
        let update = {
            username: req.body.username,
            dni_user: req.body.dni_user,
            age: req.body.age,
            phone: req.body.phone
        };
        Userc.updateOne(query, update, (err, user) => {
            if (err) res.status(500).send({ message: `Error ${err}` })
            res.status(200).send({ message: "Actualizacion correcta" })
        });
    }).catch(error => {
        return res.status(400).send({ message: "Bad Request" });
    });
})



