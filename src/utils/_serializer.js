class _serializer {
  static sanitize(data, hiddenFields = []) {
    if (!data) return data

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

      for (const key in data) {
        if (hiddenFields.includes(key)) continue

        result[key] = this.sanitize(data[key], hiddenFields)
      }

      return result
    }

    // Primitive (string, number, boolean...)
    return data
  }
}

export default _serializer