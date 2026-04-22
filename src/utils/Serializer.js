class Serializer {
  static sanitize(data, hiddenFields = ['PASSWORD', 'DELETED_AT']) {
    if (data === null || data === undefined) return data

    // Array
    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item, hiddenFields))
    }

    // Date
    if (data instanceof Date) {
      return data
    }

    // Object
    if (typeof data === 'object') {
      const result = {}

      for (const key of Object.keys(data)) {
        if (hiddenFields.includes(key)) continue

        result[key] = this.sanitize(data[key], hiddenFields)
      }

      return result
    }

    // Primitive
    return data
  }
}

export default Serializer