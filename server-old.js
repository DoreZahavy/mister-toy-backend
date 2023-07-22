import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import { toyService } from './services/toy.service.js'
import { loggerService } from './services/logger.service.js'
import { userService } from './services/user.service.js'
import { utilService } from './services/util.service.js'

// if (process.env.NODE_ENV === 'production') {
//     app.use(express.static(path.resolve('public')))
// } else {

//     const corsOptions = {
//         origin: ['http://127.0.0.1:8080',
//             'http://localhost:8080',
//             'http://127.0.0.1:3000',
//             'http://localhost:5173',
//             'http://127.0.0.1:5173',
//             'http://localhost:3000'],
//         credentials: true
//     }
//     app.use(cors(corsOptions))
// }

const corsOptions = {
    origin: ['http://127.0.0.1:8080',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000'],
    credentials: true
    }

const app = express()


// Express Config:
app.use(express.json())
app.use(cookieParser())
app.use(express.static('public'))
app.use(cors(corsOptions))


// Get Toys (READ)
app.get('/api/toy', (req, res) => {
   
    const filterBy = {
        name: req.query.name || '',
        stock: req.query.stock || '',
        sortBy: req.query.sortBy || '',
        sortDir: req.query.sortDir || 1,
        labels: req.query.labels || [],
        pageIdx: req.query.pageIdx || 0,
    }
   

    toyService.query(filterBy)
        .then(toys => {
            
            res.send(toys)
        })
        .catch(err => {
            loggerService.error('Cannot get toys', err)
            res.status(400).send('Cannot get toys')
        })
})

// Save Toy (/UPDATE)
app.put('/api/toy/:toyId', (req, res) => {
    // const loggedinUser = userService.validateToken(req.cookies.loginToken)
    // if (!loggedinUser) return res.status(401).send('Cannot save toy')

    const { _id, name, createdAt , labels ,inStock , price } = req.body
    const toyToSave = {  _id, name, createdAt , labels ,inStock , price }

    toyService.save(toyToSave)
        .then(savedToy => {
            loggerService.info('Toy saved!', toyToSave)
            res.send(savedToy)
        })
        .catch((err) => {
            loggerService.error('Cannot save toy', err)
            res.status(400).send('Cannot save toy')
        })
})

// Save Toy (CREATE)
app.post('/api/toy/', (req, res) => {
    // const loggedinUser = userService.validateToken(req.cookies.loginToken)
    // if (!loggedinUser) return res.status(401).send('Cannot save toy')

    const {  name, createdAt , labels ,inStock , price } = req.body
    const toyToSave = {  name, createdAt , labels ,inStock , price }

    toyService.save(toyToSave)
        .then(savedToy => {
            loggerService.info('Toy saved!', toyToSave)
            res.send(savedToy)
        })
        .catch((err) => {
            loggerService.error('Cannot save toy', err)
            res.status(400).send('Cannot save toy')
        })
})

// Delete toy (DELETE)
app.delete('/api/toy/:toyId', (req, res) => {
    // const loggedinUser = userService.validateToken(req.cookies.loginToken)
    // if (!loggedinUser) return res.status(401).send('Cannot remove toy')

    const toyId = req.params.toyId
    toyService.remove(toyId)
        .then(toy => {
            loggerService.info(`Toy ${toyId} removed`)
            res.send(`Toy ${toyId} Removed`)
            // res.redirect('/api/toy')
        })
        .catch((err) => {
            loggerService.error('Cannot remove toy', err)
            res.status(400).send('Cannot remove toy')
        })
})

// Get Toy (READ)
app.get('/api/toy/:toyId', (req, res) => {

    const toyId = req.params.toyId
    toyService.get(toyId)
        .then(toy => {
            res.send(toy)

        })
        .catch((err) => {
            loggerService.error('Cannot get toy', err)
            res.status(400).send('Cannot get toy', err)
        })
})


// app.post('/api/auth/login', (req, res) => {
//     const credentials = req.body
//     userService.checkLogin(credentials)
//         .then(user => {
//             if (user) {
//                 const loginToken = userService.getLoginToken(user)
//                 res.cookie('loginToken', loginToken)
//                 res.send(user)
//             } else {
//                 res.status(401).send('Invalid Credentials')
//             }
//         })
//         .catch(err => {
//             console.log('Cannot login', err)
//             res.status(400).send('Cannot login')
//         })
// })

// app.post('/api/auth/signup', (req, res) => {
//     const credentials = req.body
//     userService.save(credentials)
//         .then(user => {
//             const loginToken = userService.getLoginToken(user)
//             res.cookie('loginToken', loginToken)
//             res.send(user)
//         })
//         .catch(err => {
//             console.log('Cannot signup', err)
//             res.status(400).send('Cannot signup')
//         })
// })

// app.post('/api/auth/logout', (req, res) => {
//     res.clearCookie('loginToken')
//     res.end()
// })


// // Get User (READ)
// app.get('/api/auth/:userId', (req, res) => {
//     const userId = req.params.userId

//     const loggedinUser = userService.validateToken(req.cookies.loginToken)
//     if (!loggedinUser) return res.status(401).send('Cannot get user')

//     userService.get(userId, loggedinUser)
//         .then(user => {
//             res.send(user)
//         })
//         .catch((err) => {
//             loggerService.error('Cannot get user', err)
//             res.status(400).send('Cannot get user', err)
//         })
// })


const port = process.env.PORT || 3033
app.listen(port, () =>
    loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
)

