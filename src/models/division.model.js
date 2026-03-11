import { PRISMA } from '../configs/db.config.js'

export const divisionModel = {
  create: async (data) => {
    return await PRISMA.dIVISIONS.create({
      data: {
        DIVISION_NAME: data.DIVISION_NAME,
        COMPANY_ID: data.COMPANY_ID,
        STATUS: data.STATUS
      }
    })
  },
  listAll: async () => {
    return await PRISMA.dIVISIONS.findMany({
      orderBy: {
        DIVISION_ID: 'asc'
      }
    })
  },
  findById: async (id) => {
    return await PRISMA.dIVISIONS.findUnique({
      where: { DIVISION_ID: id }
    })
  },

  findByName: async (data) => {
    return await PRISMA.dIVISIONS.findFirst({
      where: {
        DIVISION_NAME: data
      }
    })
  },
  updateById: async (id, updateData) => {
    return await PRISMA.dIVISIONS.update({
      where: { DIVISION_ID: id },
      data: updateData
    })
  },
  deleteById: async (id) => {
    return await PRISMA.dIVISIONS.delete({
      where: { DIVISION_ID: id }
    })
  }
}

