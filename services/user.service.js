import fs from 'fs'
import Cryptr from 'cryptr'
import { utilService } from './util.service.js'

const cryptr = new Cryptr('secret-puk-1234')

const users = utilService.readJsonFile('data/user.json')

export const userService = {
    query,
    get,
    remove,
    save,
    checkLogin,
    getLoginToken,
    validateToken
}


function getLoginToken(user) {
    const str = JSON.stringify(user)
    const encryptedStr = cryptr.encrypt(str)
    return encryptedStr
}

function validateToken(token) {
    if (!token) return null
    const str = cryptr.decrypt(token)
    const user = JSON.parse(str)
    return user
}


function checkLogin({ username, password }) {
    var user = users.find(user => user.username === username)
    if (user) {
        user = {
            _id: user._id,
            fullname: user.fullname,
            isAdmin: user.isAdmin,
        }
        console.log('user back:', user)
        return Promise.resolve(user)
    }
    else return Promise.reject('Invalid login')

}


function query() {
    return Promise.resolve(users)
}

function get(userId, loggedinUser) {
    console.log('hiiiiiii');
    const user = users.find(user => user._id === userId)
    if (!user) return Promise.reject('User not found!')
    if (!loggedinUser.isAdmin && user._id !== loggedinUser._id)
        return Promise.reject('Not you')
    const miniUser = {
        _id: user._id,
        fullname: user.fullname,
        isAdmin: user.isAdmin,
    }
    console.log('miniUser:', miniUser)
    return Promise.resolve(miniUser)
}

function remove(userId) {
    users = users.filter(user => user._id !== userId)
    return _saveUsersToFile()
}

function save({ username, password, fullname }) {
    const userToAdd = {
        _id: utilService.makeId(),
        todos: [],
        prefs: { color: '#111', backgroundColor: '#fff' },
        fullname,
        username,
        password
    }
    users.push(userToAdd)
    return _saveUsersToFile().then(() => userToAdd)
}

// function put(todo) {
//     if (todo._id) {
//         const idx = todos.findIndex(currTodo => currTodo._id === todo._id)
//         if (idx === -1) throw new Error('No such todo')
//         // if (!loggedinUser.isAdmin && todos[idx].owner._id !== loggedinUser._id)
//         //     return Promise.reject('Not your todo')
//         todos[idx] = todo
//     } else {
//         todo._id = utilService.makeId()
//         todo.at = Date.now()
//         // todo.owner = loggedinUser
//         todos.unshift(todo)
//     }

//     return _saveTodosToFile().then(() => todo)

// }


function _saveUsersToFile() {
    return new Promise((resolve, reject) => {

        const usersStr = JSON.stringify(users, null, 2)
        fs.writeFile('data/user.json', usersStr, (err) => {
            if (err) {
                return console.log(err);
            }
            resolve()
        })
    })
}