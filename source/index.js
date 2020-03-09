const path = require('path')
const fs = require('fs')
const kit = require('@basekits/core')

function InterCDNClient() {
  this.kit = kit
  this.kit.addKit( require('@basekits/kit-node-hashing') )
  this.kit.addKit( require('@basekits/kit-type') )
  this.kit.addKit( require('@basekits/kit-error') )
  this.kit.addKit( require('@basekits/kit-validator') )
  this.kit.addKit( require('@basekits/kit-object') )

  this.defaultUploadOpts = {
    hash: false,
    filenameHashLen: 12,
    target: '',
    exclude: ['.DS_Store', '.git', 'node_modules'],
    s3: {}
  }
  this.service = null
  this.services = {
    s3: require('./services/s3')
  }
}

InterCDNClient.prototype.init = function init(service, callback) {
  if (this.kit.isString(service) && this.services.hasOwnProperty(service)) {
    this.service = this.services[service]
    return this.service.init(this, callback)
  }
}

InterCDNClient.prototype.upload = require('./upload')

InterCDNClient.prototype.readObjects = function readObjects(filepath, opts) {
  const self = this
  const {exclude, target, filenameHashLen} = opts
  const result = []
  const isFolderUpload = path.extname(filepath) == ''
  if (isFolderUpload) {
    function recursiveRead(dir, parent = '') {
      const objects = fs.readdirSync(dir, {withFileTypes: true})
      for (let i = 0; i < objects.length; i++) {
        const obj = objects[i]
        if (exclude.indexOf(obj.name) !== -1) continue;
        if (obj.isFile()) {
          result.push( path.join(parent, obj.name) )
        }
        if (obj.isDirectory()) {
          recursiveRead( path.join(dir, obj.name), path.join(parent, obj.name) )
        }
      }
    }
    recursiveRead(filepath)
  }
  else {
    result.push(path.basename(filepath))
  }

  return result
    .map(function(item) {
      const p = isFolderUpload ? path.join(filepath, item) : filepath
      const bytes = fs.readFileSync(p)
      const hash = self.kit.hash(bytes, 'md5')
      const ext = path.extname(item)
      const fileFinalPath = opts.hash
        ? path.join(target, path.dirname(item), path.basename(item, ext) + '.' + hash.slice(0, filenameHashLen) + ext)
        : path.join(target, item)
      return {
        filepath: fileFinalPath,
        hash: hash,
        data: bytes
      }
    })
}

InterCDNClient.prototype.addService = function addService(name, object) {
  this.services[name] = object
}

InterCDNClient.prototype.getService = function getService(name) {
  return this.services[name]
}

module.exports = InterCDNClient
