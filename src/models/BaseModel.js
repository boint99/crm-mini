import { PRISMA } from '../configs/db.config.js'

class BaseModel {
  constructor(modelName, defaultOrderBy = 'id') {
    this.model = PRISMA[modelName]
    this.defaultOrderBy = defaultOrderBy
  }

  async ListAll() {
    return await this.model.findMany({
      orderBy: { [this.defaultOrderBy]: 'asc' }
    })
  }

  async FindById(id, idField) {
    return await this.model.findUnique({
      where: { [idField]: id }
    })
  }

  async DeleteById(id, idField) {
    return await this.model.delete(
      {
        where: { [idField]: id }
      }
    )
  }

  async findByField(value, fieldName) {
    return await this.model.findFirst({
      where: {
        [fieldName]: value
      }
    })
  }

  async Create(data) {
    return await this.model.create({ data })
  }

  async Update(id, idField, data) {
    return await this.model.update(
      {
        where: { [idField]: id },
        data: data
      }
    )
  }
}

export default BaseModel