import fs from 'fs'
import { utilService } from './util.service.js'

export const toyService = {
    query,
    get,
    remove,
    save
}

const PAGE_SIZE = 4
const toys = utilService.readJsonFile('data/toy.json')

function query(filterBy) {


    const { sortDir, name, sortBy, pageIdx, stock, labels } = filterBy
    const regex = new RegExp(name, 'i')


    let filteredToys
    filteredToys = toys.filter(toy => regex.test(toy.name))
    filteredToys = filteredToys.filter(toy => (labels.length > 0) ? toy.labels.some(label => labels.includes(label)) : true)

    if (stock === 'yesStock') filteredToys = filteredToys.filter(toy => toy.inStock)
    else if (stock === 'noStock') filteredToys = filteredToys.filter(toy => !toy.inStock)

    // sorting
    if (sortBy === 'name') {
        filteredToys = filteredToys.sort((b1, b2) => b1.name.localeCompare(b2.name) * sortDir)
    } else if (sortBy === 'price') {
        filteredToys = filteredToys.sort((b1, b2) => (b1.price - b2.price) * sortDir)
    } else if (sortBy === 'created') {
        filteredToys = filteredToys.sort((b1, b2) => (b1.createdAt - b2.createdAt) * sortDir)
    }


    // pagination
    const maxPageCount = Math.ceil(filteredToys.length / PAGE_SIZE)
    if (pageIdx !== undefined) {
        const startPageIdx = pageIdx * PAGE_SIZE
        filteredToys = filteredToys.slice(startPageIdx, startPageIdx + PAGE_SIZE)
    }

    // chart data


    // var toyLabels = ['On wheels', 'Box game', 'Art', 'Baby', 'Doll', 'Puzzle', 'Outdoor', 'Battery powered']


    var chartData = toys.reduce((acc, toy) => {
            toy.labels.forEach(label => {
        
                if (!acc[label]) acc[label] = 0
                acc[label]++
            })
            
            return acc
        }, {})
console.log('chartData:', chartData)



    return Promise.resolve({ toys: filteredToys, maxPageCount, chartData })
    // return Promise.resolve( filteredToys)
}

function get(toyId) {
    const toy = toys.find(toy => toy._id === toyId)
    return Promise.resolve(toy)
}

function remove(toyId) {
    const toyIdx = toys.findIndex(toy => toy._id === toyId)
    if (toyIdx === -1) return Promise.reject('No such toy')
    const toy = toys[toyIdx]
    // if (!loggedinUser.isAdmin && toy.owner._id !== loggedinUser._id)
    //     return Promise.reject('Not your toy')
    toys.splice(toyIdx, 1)
    return _saveToysToFile()
}

function save(toy) {
    if (toy._id) {
        const idx = toys.findIndex(currToy => currToy._id === toy._id)
        if (idx === -1) throw new Error('No such toy')
        // if (!loggedinUser.isAdmin && toys[idx].owner._id !== loggedinUser._id)
        //     return Promise.reject('Not your toy')
        toys[idx] = toy
    } else {
        toy._id = utilService.makeId()
        toy.createdAt = Date.now()
        // toy.owner = loggedinUser
        toys.unshift(toy)
    }

    return _saveToysToFile().then(() => toy)

}

function _saveToysToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(toys, null, 2)
        fs.writeFile('data/toy.json', data, (err) => {
            if (err) {
                return reject(err)
            }
            resolve()
        })
    })
}