const mongoose = require('mongoose')

const schema = require('../../src/gridFile.schema')

module.exports = mongoose.model('Attachment', schema, 'attachment.files')
