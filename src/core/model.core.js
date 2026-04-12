import { PRISMA } from '../configs/db.config.js'

const DEFAULT_HIDDEN_FIELDS = ['PASSWORD', 'DELETED_AT']

function sanitize(data, hiddenFields) {
  if (Array.isArray(data)) {
    return data.map(item => sanitize(item, hiddenFields))
  }

  if (data instanceof Date) {
    return data
  }

  if (data && typeof data === 'object') {
    const result = {}

    for (const key in data) {
      if (hiddenFields.includes(key)) continue
      result[key] = sanitize(data[key], hiddenFields)
    }

    return result
  }

  return data
}

class ModelCore {
  constructor(modelName, defaultOrderBy = 'id', hiddenFields = []) {
    this.model = PRISMA[modelName]
    this.defaultOrderBy = defaultOrderBy
    this.hiddenFields = [...DEFAULT_HIDDEN_FIELDS, ...hiddenFields]
  }

  _sanitize(data) {
    return sanitize(data, this.hiddenFields)
  }

  async LISTALL() {
    const data = await this.model.findMany({
      orderBy: { [this.defaultOrderBy]: 'asc' }
    })
    return this._sanitize(data)
  }

  async LISTQUERY(options = {}) {
    const data = await this.model.findMany(options)
    return this._sanitize(data)
  }

  async FINDBYUNIQUE(id, idField) {
    const data = await this.model.findUnique({
      where: { [idField]: id }
    })
    return this._sanitize(data)
  }

  async DELETEBYID(id, idField) {
    const data = await this.model.delete({
      where: { [idField]: id }
    })
    return this._sanitize(data)
  }

  async FINDBYFIELD(value, fieldName) {
    const data = await this.model.findFirst({
      where: { [fieldName]: value }
    })
    return this._sanitize(data)
  }

  async FINDBYFIELD_WHERE(whereObj) {
    const data = await this.model.findFirst({ where: whereObj })
    return this._sanitize(data)
  }

  async CREATE(data) {
    const result = await this.model.create({ data })
    return this._sanitize(result)
  }

  async UPDATE(id, idField, updateData) {
    const result = await this.model.update({
      where: { [idField]: id },
      data: updateData
    })
    return this._sanitize(result)
  }
}

export default ModelCore