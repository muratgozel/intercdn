module.exports = function upload(filepath, optsOrBucketOrCallback = {}, possibleCallback = null) {
  const opts = this.kit.isObject(optsOrBucketOrCallback)
    ? Object.assign({}, this.defaultUploadOpts, optsOrBucketOrCallback)
    : this.kit.isString(optsOrBucketOrCallback)
      ? Object.assign({}, this.defaultUploadOpts, {bucket: optsOrBucketOrCallback})
      : this.defaultUploadOpts

  const callback = this.kit.isFunction(possibleCallback)
    ? possibleCallback
    : this.kit.isFunction(optsOrBucketOrCallback)
      ? optsOrBucketOrCallback
      : function() {}

  return this.service.upload(filepath, opts, callback)
}
