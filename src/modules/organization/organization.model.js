import ModelCore from '../../model/index.js'

class OrganizationModel extends ModelCore {
  constructor() {
    super('oRG_UNITS', 'orgUnitId')
  }

  // async lists() {
  //   return await this.model.findMany({
  //     where: { deletedAt: null },
  //     include: {
  //       company: { select: { id: true, companyName: true } },
  //       branch: { select: { id: true, branchName: true } },
  //       parentUnit: { select: { id: true, unitName: true } }
  //     }
  //   })
  // }

  async lists(option) {
    console.log('🚀 ~ OrganizationModel ~ lists ~ option:', option)
    const { companyId, branchId } = option || {}

    // Khởi tạo điều kiện bắt buộc: Phải thuộc Company và chưa bị xóa
    const whereCondition = {
      deletedAt: null,
      companyId: companyId
    }

    // Nếu có truyền branchId, áp dụng logic lấy Chi nhánh + Phòng ban dùng chung
    if (branchId) {
      whereCondition.OR = [
        { branchId: branchId },         // 1. Lấy chính bản ghi Chi nhánh (thay 'id' bằng 'unitId' nếu DB của bạn định nghĩa vậy)
        { branchId: null }        // 2. Lấy các phòng ban cùng cấp thuộc công ty (không nằm trong chi nhánh nào)
      ]
    }

    return await this.model.findMany({
      where: whereCondition
    })
  }
  async create(data) {
    return await super.CREATE(data)
  }

  async findByField(value, field) {
    return await super.FINDBYFIELD(value, field)
  }

  async updateById(id, updateData, field = 'orgUnitId') {
    return await super.UPDATE(id, field, updateData)
  }

  async findByUnique(fieldValue, fieldName = 'orgUnitId') {
    return await super.FINDBYUNIQUE(fieldValue, fieldName)
  }

  async deleteById(id) {
    return await super.DELETEBYID(id, 'orgUnitId')
  }
}

export const organizationModel = new OrganizationModel()
