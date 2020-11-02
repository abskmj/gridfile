const { Schema, mongo } = require('mongoose')
const assert = require('assert')

const schemaOptions = {
  versionKey: false,
  collection: 'fs.files'
}

/**
 * Mongoose schema for MongoDB GridFS
 *
 * ```javascript
 * const mongoose = require('mongoose')
 * const schema = require('gridfile')
 *
 * const GridFile = mongoose.model('GridFile', schema)
 *
 * const gridFile = new GridFile()
 * ```
 * @namespace GridFile
 */

const schema = new Schema({
  /**
   * @member {Number} GridFile#length
   */
  length: { type: Number },
  /**
   * @member {Number} GridFile#chunkSize
   */
  chunkSize: { type: Number },
  /**
   * @member {Date} GridFile#uploadDate
   */
  uploadDate: { type: Date },
  /**
   * @member {String} GridFile#md5
   */
  md5: { type: String },
  /**
   * A MD5 hash is auto-generated when a file is uploaded
   * @member {String} GridFile#filename
   */
  filename: { type: String },
  /**
   * Value is be used as `contentType` option when opening an upload stream: [GridFSBucket#openUploadStream](https://mongodb.github.io/node-mongodb-native/3.6/api/GridFSBucket.html#openUploadStream)
   * @member {String} GridFile#contentType
   */
  contentType: { type: String },
  /**
   * Value is be used as `metadata` option when opening an upload stream: [GridFSBucket#openUploadStream](https://mongodb.github.io/node-mongodb-native/3.6/api/GridFSBucket.html#openUploadStream)
   * @member {Any} GridFile#metadata
   */
  metadata: { type: Schema.Types.Mixed },
  /**
   * Value is be used as `aliases` option when opening an upload stream: [GridFSBucket#openUploadStream](https://mongodb.github.io/node-mongodb-native/3.6/api/GridFSBucket.html#openUploadStream)
   * @member {[String]} GridFile#aliases
   */
  aliases: [{ type: String }]
}, schemaOptions)

/* Document Properties */

/**
 * Alias for GridFile#uploadDate
 * @member {Date} GridFile#createdAt
 */
schema.virtual('createdAt').get(function () { return this.uploadDate })

/**
 * @ignore
 */
schema.virtual('model').get(function () { return this.constructor })

/**
 * Value is be used as `chunkSizeBytes` option when opening an upload stream: [GridFSBucket#openUploadStream](https://mongodb.github.io/node-mongodb-native/3.6/api/GridFSBucket.html#openUploadStream)
 * @member {Number} GridFile#chunkSizeBytes
 */
schema.virtual('chunkSizeBytes')

/* Model Methods */

/**
 * Get the GridFS bucket created from the Mongoose connection
 * @member {Function} GridFile.getBucket
 * @returns {GridFSBucket} GridFS Bucket
 * @example
 * const bucket = GridFile.getBucket()
 */
schema.static('getBucket', function () {
  if (this.bucket) { } else {
    // check the collection name
    assert(this.collection.collectionName.endsWith('.files'), 'Collection Name doesn\'t end with .files')

    // initialize gridfs bucket
    const connection = this.db

    this.bucket = new mongo.GridFSBucket(connection.db, {
      bucketName: this.collection.collectionName.replace('.files', '')
    })
  }

  return this.bucket
})

/**
 * Delete a file from GridFS using [GridFSBucket#delete](https://mongodb.github.io/node-mongodb-native/3.6/api/GridFSBucket.html#delete)
 * @member {Function} GridFile.findOneAndDelete
 * @returns {Promise<GridFile>} Deleted GridFile as a Promise
 * @example
 * const deletedFile = await GridFile.findOneAndDelete({ filename: 'image.png' })
 */
schema.static('findOneAndDelete', async function (query) {
  const doc = await this.findOne(query)

  if (doc) await this.getBucket().delete(doc._id)

  return doc
})

/**
 * Delete a file from GridFS using [GridFSBucket#delete](https://mongodb.github.io/node-mongodb-native/3.6/api/GridFSBucket.html#delete)
 * @member {Function} GridFile.findByIdAndDelete
 * @returns {Promise<GridFile>} Deleted GridFile as a Promise
 * @example
 * const deletedFile = await GridFile.findByIdAndDelete('some-id')
 */
schema.static(`findByIdAndDelete`, function (id) {
  return this.findOneAndDelete({ _id: id })
})

/* Document Methods */

/**
 * Get a GridFS stream to upload a file
 * @member {Function} GridFile#getUploadStream
 * @returns {GridFSBucketWriteStream} Upload Stream
 * @example
 * const uploadStream = gridFile.getUploadStream()
 */
schema.method('getUploadStream', function () {
  const bucket = this.model.getBucket()

  // mongoose generates an id
  return bucket.openUploadStreamWithId(this._id, this.filename, {
    chunkSizeBytes: this.chunkSizeBytes,
    metadata: this.metadata,
    contentType: this.contentType,
    aliases: this.aliases
  })
})

/**
 * Get a GridFS stream to download a file
 * @member {Function} GridFile#getDownloadStream
 * @returns {GridFSBucketReadStream} Download Stream
 * @example
 * const downloadStream = gridFile.getDownloadStream()
 */
schema.method('getDownloadStream', function () {
  const bucket = this.model.getBucket()

  return bucket.openDownloadStream(this._id)
})

/**
 * Upload a file to GridFS
 * @member {Function} GridFile#uploadStream
 * @param {Stream} FileStream Read stream of file to upload
 * @returns {GridFSBucketWriteStream} Upload Stream
 * @example
 * const fs = require('fs')
 *
 * const fileStream = fs.createReadStream('/path/to/file')
 * const uploadStream = gridFile.uploadStream(fileStream)
 *
 * uploadStream.on('finish', (file) => {
 *  console.log(file)
 * })
 */
schema.method('uploadStream', function (stream) {
  const uploadStream = this.getUploadStream()

  stream.pipe(uploadStream)

  return uploadStream
})

/**
 * Download a file from GridFS
 * @member {Function} GridFile#downloadStream
 * @param {Stream} FileStream Write stream of file to download into
 * @returns {GridFSBucketWriteStream} Download Stream
 * @example
 * const fs = require('fs')
 *
 * const fileStream = fs.createWriteStream('/path/to/file')
 * const DownloadStream = gridFile.downloadStream(fileStream)
 *
 * fileStream.on('finish', () => {
 *  console.log('File downloaded successfully')
 * })
 */
schema.method('downloadStream', function (stream) {
  const downloadStream = this.getDownloadStream()

  downloadStream.pipe(stream)

  return downloadStream
})

/**
 * Upload a file to GridFS
 * @member {Function} GridFile#upload
 * @param {Stream} FileStream Read stream of file to upload
 * @param {Function} Callback Callback function
 * @returns {Promise<GridFile>} GridFile as a Promise
 * @example
 * const fs = require('fs')
 *
 * const fileStream = fs.createReadStream('/path/to/file')
 * const uploadedFile = await gridFile.upload(fileStream)
 * @example
 * // callback
 * gridFile.upload(filestream, (err, uploadedFile) => {
 *  if(err){
 *    console.error(err)
 *  } else {
 *    console.log(uploadedFile)
 *  }
 * })
 */
schema.method('upload', function (stream, callback) {
  return new Promise((resolve, reject) => {
    const uploadStream = this.uploadStream(stream)

    uploadStream.on('error', (error) => {
      reject(error)
      if (callback) callback(error)
    })

    uploadStream.on('finish', (file) => {
      const document = this.model.hydrate(file)

      resolve(document)
      if (callback) callback(null, document)
    })
  })
})

/**
 * Download a file from GridFS
 * @member {Function} GridFile#download
 * @param {Stream} FileStream Write stream of file to download into
 * @param {Function} Callback Callback function
 * @returns {Promise<Void>} Promise
 * @example
 * const fs = require('fs')
 *
 * const fileStream = fs.createWriteStream('/path/to/file')
 * await gridFile.download(fileStream)
 * @example
 * // callback
 * gridFile.download(fileStream, (err){
 *  if(err){
 *    console.error(err)
 *  } else {
 *    console.log('File downloaded successfully')
 *  }
 * })
 */
schema.method('download', function (stream, callback) {
  return new Promise((resolve, reject) => {
    this.downloadStream(stream)

    stream.on('error', (error) => {
      reject(error)
      if (callback) callback(error)
    })

    stream.on('finish', () => {
      resolve()
      if (callback) callback()
    })
  })
})

module.exports = schema
