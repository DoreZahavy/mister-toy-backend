import mongodb from 'mongodb'
const { ObjectId } = mongodb

import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

const PAGE_SIZE = 4

async function query(filterBy) {
    try {
        const { sortDir, name, sortBy, pageIdx, stock, labels } = filterBy
        const criteria = {}

        criteria.name = { $regex: name, $options: 'i' }
        if (labels && labels.length > 0) criteria.labels = { $in: labels }

        if (stock && stock !== 'all') {
            criteria.inStock = (stock === 'yesStock') ? true : false
        }

        const collection = await dbService.getCollection('toy')
        var toys = await collection
            .find(criteria)
            .sort({ [sortBy]: sortDir })
            // .skip(pageIdx * PAGE_SIZE)
            // .limit(PAGE_SIZE)
            .toArray()

        var chartData = toys.reduce((acc, toy) => {
            toy.labels.forEach(label => {
                if (!acc[label]) acc[label] = 0
                acc[label]++
            })
            return acc
        }, {})

        const maxPageCount = Math.ceil(toys.length / PAGE_SIZE)
        if (pageIdx !== undefined) {
            const startPageIdx = pageIdx * PAGE_SIZE
            toys = toys.slice(startPageIdx, startPageIdx + PAGE_SIZE)
        }

        return { toys: toys, maxPageCount, chartData }

    } catch (err) {
        logger.error('cannot find toys', err)
        throw err
    }
}

async function getById(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        const toy = collection.findOne({ _id: new ObjectId(toyId) })
        return toy
    } catch (err) {
        logger.error(`while finding toy ${toyId}`, err)
        throw err
    }
}

async function remove(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.deleteOne({ _id: new ObjectId(toyId) })
    } catch (err) {
        logger.error(`cannot remove toy ${toyId}`, err)
        throw err
    }
}

async function add(toy) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.insertOne(toy)
        return toy
    } catch (err) {
        logger.error('cannot insert toy', err)
        throw err
    }
}

async function update(toy) {
    try {
        const toyToSave = {
            name: toy.name,
            price: toy.price,
            createdAt: Date.now(),
            labels: toy.labels,
            isStock: toy.isStock
        }
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: ObjectId(toy._id) }, { $set: toyToSave })
        return toy
    } catch (err) {
        logger.error(`cannot update toy ${toy._id}`, err)
        throw err
    }
}

async function addToyMsg(toyId, msg) {
    try {
        msg.id = utilService.makeId()
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: new ObjectId(toyId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        logger.error(`cannot add toy msg ${toyId}`, err)
        throw err
    }
}

async function removeToyMsg(toyId, msgId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: new ObjectId(toyId) }, { $pull: { msgs: { id: msgId } } })
        return msgId
    } catch (err) {
        logger.error(`cannot add toy msg ${toyId}`, err)
        throw err
    }
}

export const toyService = {
    remove,
    query,
    getById,
    add,
    update,
    addToyMsg,
    removeToyMsg
}
