import { PRISMA } from '../configs/db.config.js'

class ModelCore {
  constructor(modelName, defaultOrderBy = 'id') {
    this.model = PRISMA[modelName]
    this.defaultOrderBy = defaultOrderBy
  }

  _buildWhere(where = null, includeDeleted = false) {
    const safeWhere = { ...where }
    delete safeWhere.DELETED_AT
    return {
      ...(where || {}),
      ...(includeDeleted ? {} : { DELETED_AT: null })
    }
  }

  // 🔥 build query options
  _buildQuery(options = {}, includeDeleted = false) {
    return {
      ...options,
      where: this._buildWhere(options.where, includeDeleted),
      orderBy: options.orderBy || { [this.defaultOrderBy]: 'asc' }
    }
  }

  async LISTALL(includeDeleted = false) {
    return await this.model.findMany(
      this._buildQuery({}, includeDeleted)
    )
  }

  async LISTQUERY(options = {}, includeDeleted = false) {
    return await this.model.findMany(
      this._buildQuery(options, includeDeleted)
    )
  }

  async FINDBYUNIQUE(id, idField, includeDeleted = false) {
    const data = await this.model.findUnique({
      where: { [idField]: id }
    })

    // filter soft delete thủ công
    if (!includeDeleted && data?.DELETED_AT) return null

    return data
  }

  async FINDBYFIELD(value, fieldName, includeDeleted = false) {
    return await this.model.findFirst({
      where: this._buildWhere({ [fieldName]: value }, includeDeleted)
    })
  }

  async FINDBYFIELD_WHERE(whereObj = {}, includeDeleted = false) {
    return await this.model.findFirst({
      where: this._buildWhere(whereObj, includeDeleted)
    })
  }

  async CREATE(data) {
    return await this.model.create({ data })
  }

  async UPDATE(id, updateData, idField) {
    return await this.model.update({
      where: { [idField]: id },
      data: updateData
    })
  }

  async DELETEBYID(id, idField) {
    return await this.model.delete({
      where: { [idField]: id }
    })
  }

  // soft delete
  async SOFT_DELETE(id, idField) {
    return await this.UPDATE(id, idField, {
      DELETED_AT: new Date()
    })
  }

  // restore data
  async RESTORE(id, idField) {
    return await this.UPDATE(id, idField, {
      DELETED_AT: null
    })
  }
}

export default ModelCore