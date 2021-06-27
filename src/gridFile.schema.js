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
   * @ {Number} length
   * @memberof GridFile
   * @instance
   */
  length: { type: Number },
  /**
   * @property {Number} chunkSize
   * @memberof GridFile
   * @instance
   */
  chunkSize: { type: Number },
  /**
   * @property {Date} uploadDate
   * @memberof GridFile
   * @instance
   */
  uploadDate: { type: Date },
  /**
   * A MD5 hash is auto-generated when a file is uploaded
   * @property {String} md5
   * @memberof GridFile
   * @instance
   */
  md5: { type: String },
  /**
   * @property {String} filename
   * @memberof GridFile
   * @instance
   */
  filename: { type: String },
  /**
   * Value is be used as `contentType` option when opening an upload stream: [GridFSBucket#openUploadStream](https://mongodb.github.io/node-mongodb-native/3.6/api/GridFSBucket.html#openUploadStream)
   * @property {String} contentType
   * @memberof GridFile
   * @instance
   */
  contentType: { type: String },
  /**
   * Value is be used as `metadata` option when opening an upload stream: [GridFSBucket#openUploadStream](https://mongodb.github.io/node-mongodb-native/3.6/api/GridFSBucket.html#openUploadStream)
   * @property {Any} metadata
   * @memberof GridFile
   * @instance
   */
  metadata: { type: Schema.Types.Mixed },
  /**
   * Value is be used as `aliases` option when opening an upload stream: [GridFSBucket#openUploadStream](https://mongodb.github.io/node-mongodb-native/3.6/api/GridFSBucket.html#openUploadStream)
   * @property {[String]} aliases
   * @memberof GridFile
   * @instance
   */
  aliases: [{ type: String }]
}, schemaOptions)

/* Document Properties */

/**
 * Alias for GridFile#uploadDate
 * @member {Date} createdAt
 * @memberof GridFile
 * @instance
 */
schema.virtual('createdAt').get(function () { return this.uploadDate })

/**
 * @ignore
 */
schema.virtual('model').get(function () { return this.constructor })

/**
 * Value is be used as `chunkSizeBytes` option when opening an upload stream: [GridFSBucket#openUploadStream](https://mongodb.github.io/node-mongodb-native/3.6/api/GridFSBucket.html#openUploadStream)
 * @member {Number} chunkSizeBytes
 * @memberof GridFile
 * @instance
 */
schema.virtual('chunkSizeBytes')

/* Model Methods */

/**
 * Get the GridFS bucket created from the Mongoose connection
 * @method getBucket
 * @memberof GridFile
 * @static
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
 * @function findOneAndDelete
 * @memberof GridFile
 * @static
 * @param {Object} query Mongoose query
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
 * @function findByIdAndDelete
 * @memberof GridFile
 * @static
 * @param {String} id Mongoose document id
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
 * @function getUploadStream
 * @memberof GridFile
 * @instance
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
 * @function getDownloadStream
 * @memberof GridFile
 * @instance
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
 * @function uploadStream
 * @memberof GridFile
 * @instance
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
 * @function downloadStream
 * @memberof GridFile
 * @instance
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
 * @function upload
 * @memberof GridFile
 * @instance
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
 * @function download
 * @memberof GridFile
 * @instance
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
