import BaseModel from '../../../model/index.js'

class EmployeesViettelModel extends BaseModel {
  constructor() {
    super('vIETTEL_EMPLOYEES', 'viettelId')
  }

  async lists() {
    return await this.model.findMany({
      where: { deletedAt: null },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        viettelBranch: {
          select: {
            id: true,
            viettelBranchId: true,
            viettelBranchCode: true,
            viettelBranchName: true
          }
        }
      }
    })
  }

  async create(data) {
    return await this.model.create({
      data,
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    })
  }

  async findByField(value, field) {
    return await this.model.findFirst({
      where: { [field]: value, deletedAt: null },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    })
  }

  async updateById(id, updateData) {
    return await this.model.update({
      where: { viettelId: id },
      data: updateData,
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    })
  }

  async findByUnique(value, field = 'id') {
    return await this.model.findFirst({
      where: { [field]: value, deletedAt: null },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    })
  }

  async findById(id) {
    return await this.findByUnique(id, 'viettelId')
  }

  async findByName(name, field = 'viettelCode') {
    return await this.findByUnique(name, field)
  }

  async deleteById(id) {
    return await this.model.delete({
      where: { viettelId: id }
    })
  }
}

export const employeesViettelModel = new EmployeesViettelModel()
