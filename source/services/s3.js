const path = require('path')
const AWS = require('aws-sdk')

/*
*
* Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables
*
*/

function InterCDNClientS3() {
  this.intercdn = null
  this.client = null
  this.initiated = false
  this.validParams = [
    'Bucket', 'Key', 'ACL', 'Body', 'CacheControl', 'ContentDisposition',
    'ContentEncoding', 'ContentLanguage', 'ContentLength', 'ContentMD5',
    'ContentType', 'Expires', 'GrantFullControl', 'GrantRead', 'GrantReadACP',
    'GrantWriteACP', 'Metadata', 'ObjectLockLegalHoldStatus', 'ObjectLockMode',
    'ObjectLockRetainUntilDate', 'RequestPayer', 'SSECustomerAlgorithm',
    'SSECustomerKey', 'SSECustomerKeyMD5', 'SSEKMSEncryptionContext', 'SSEKMSKeyId',
    'ServerSideEncryption', 'StorageClass', 'Tagging', 'WebsiteRedirectLocation'
  ]
}

InterCDNClientS3.prototype.init = function init(client, callback) {
  if (this.initiated) return callback()

  this.intercdn = client
  this.client = new AWS.S3({
    apiVersion: '2006-03-01'
  })
  this.initiated = true
  return callback()
}

InterCDNClientS3.prototype.upload = function upload(filepath, opts, callback) {
  const self = this
  const objects = self.intercdn.readObjects(filepath, opts)
  if (self.intercdn.kit.isEmpty(objects)) return callback(new Error('NO_OBJECT_FOUND'))

  const jobs = objects.map(function(obj) {
    return new Promise(function(resolve, reject) {
      const params = Object.assign({}, {
        Body: obj.data,
        Bucket: opts.bucket,
        Key: obj.filepath
      }, self.intercdn.kit.getProp(opts, 's3', {}))

      self.client.putObject(params, function(err, data) {
        if (err) {
          return reject(err)
        }
        return resolve({
          raw: data,
          filepath: obj.filepath,
          id: data.VersionId || null,
          hash: data.ETag.slice(1, -1)
        })
      })
    })
  })

  Promise
    .all(jobs)
    .then(function(list) {
      return callback(null, list)
    })
    .catch(function(err) {
      return callback(err)
    })
}

InterCDNClientS3.prototype.getClient = function getClient() {
  return this.client
}

module.exports = new InterCDNClientS3
