import { PRISMA } from '../configs/db.config.js'

class ModelCore {
  constructor(modelName, defaultOrderBy = 'id') {
    this.model = PRISMA[modelName]
    this.defaultOrderBy = defaultOrderBy
  }

  async LISTALL() {
    return await this.model.findMany({
      orderBy: { [this.defaultOrderBy]: 'asc' }
    })
  }

  async FINDBYUNIQUE(id, idField) {
    return await this.model.findUnique({
      where: { [idField]: id }
    })
  }

  async DELETEBYID(id, idField) {
    return await this.model.delete(
      {
        where: { [idField]: id }
      }
    )
  }

  async FINDBYFIELD(value, fieldName) {
    return await this.model.findFirst({
      where: {
        [fieldName]: value
      }
    })
  }

  async CREATE(data) {
    return await this.model.create({ data })
  }

  async UPDATE(id, idField, updateData) {
    return await this.model.update(
      {
        where: { [idField]: id },
        data: updateData
      }
    )
  }
}

export default ModelCore