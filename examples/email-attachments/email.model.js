const mongoose = require('mongoose')
const { Schema } = mongoose

const schema = new Schema({
  to: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  html: {
    type: String,
    required: true
  },
  attachments: [{
    type: Schema.Types.ObjectId,
    ref: 'Attachment'
  }]
})

module.exports = mongoose.model('Email', schema)
