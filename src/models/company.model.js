import { PRISMA } from '../configs/db.config.js'

export const companyModel = {
  create: async (data) => {
    return await PRISMA.cOMPANY.create({
      data: {
        COMPANY_NAME: data.COMPANY_NAME,
        STATUS: data.STATUS
      }
    })
  },

  listCompany: async () => {
    return await PRISMA.cOMPANY.findMany()
  },
  findById: async (id) => {
    return await PRISMA.cOMPANY.findUnique({
      where: { COMPANY_ID: id }
    })
  },

  findByName: async (data) => {
    console.log('🚀 ~ data:', data)
    return await PRISMA.cOMPANY.findFirst({
      where: {
        COMPANY_NAME: data
      }
    })
  },
  updateById: async (id, updateData) => {
    console.log('🚀 ~ updateData:', updateData)
    return await PRISMA.cOMPANY.update({
      where: { COMPANY_ID: id },
      data: updateData
    })
  },
  deleteById: async (id) => {
    return await PRISMA.cOMPANY.delete({
      where: { COMPANY_ID: id }
    })
  }
}

