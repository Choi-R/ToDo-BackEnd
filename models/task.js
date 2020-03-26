const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const Schema = mongoose.Schema

const taskSchema = new Schema({
    name: {
        type: 'string',
        required: true
    },
    description: {
        type: 'string',
        required: true
    },
    deadLine: {
        type: Date,
        required: true
    },
    importance: {
        type: 'boolean',
        default: false
    },
    completion: {
        type: 'boolean',
        default: false,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})
taskSchema.plugin(mongoosePaginate)
const Task = mongoose.model('Task', taskSchema);
module.exports = Task