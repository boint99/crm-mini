import ip from 'ip'
import { StatusCodes } from 'http-status-codes'
import { vlansModel } from '../models/vlans.model.js'
import ApiError from '../utils/ApiError.js'
import { ALLOWED_STATUS_NETWORK, CHECK_ENUM } from '../utils/constants.js'
import { ipsModel } from '../models/ips.model.js'
import { employeesModel } from '../models/employees.model.js'


class IpsService {
  ipqueryBuilder(query) {
    const { vlan_id } = query

    const options = {
      where: vlan_id ? { VLAN_ID: Number(vlan_id) } : undefined,
      include: {
        EMPLOYEE: {
          select: {
            EMPLOYEE_ID: true,
            EMPLOYEE_CODE: true,
            FIRST_NAME: true,
            LAST_NAME: true,
            PHONE: true,
            EMAIL: true,
            STATUS: true
          }
        }
      },
      orderBy: { IP_ID: 'asc' }
    }

    return {
      lists: () => ipsModel.listQuery(options)
    }
  }
  async checkeHostForVlan(host, vlan) {
    const subnet = ip.cidrSubnet(vlan.NETWORK)

    if (vlan.DEFAULT_GATEWAY === host) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'HOST cannot be the same as VLAN gateway!')
    }

    if (!subnet.contains(host)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'IP is not in VLAN network!')
    }

    if (host === subnet.networkAddress || host === subnet.broadcastAddress) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid IP (network/broadcast)')
    }

    if (vlan.IP_RANGE) {
      const [start, end] = vlan.IP_RANGE.split('-').map(item => item.trim())

      if (ip.toLong(host) < ip.toLong(start) || ip.toLong(host) > ip.toLong(end)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'IP is outside VLAN range!')
      }
    }
  }

  async resolveEmployeeCode(code) {
    if (code === undefined || code === null || code === '') return null
    const employee = await employeesModel.findByCode(code.trim())
    if (!employee) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid EMPLOYEE_CODE!')
    }
    return employee.EMPLOYEE_ID
  }

  async checkEmployee(employeeId, currentIpId = null) {
    if (employeeId === undefined || employeeId === null) return

    const employee = await employeesModel.findById(employeeId)
    if (!employee) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid EMPLOYEE_ID!')
    }

    const assignedIp = await ipsModel.findByField(employeeId, 'EMPLOYEE_ID')
    if (assignedIp && assignedIp.IP_ID !== currentIpId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Employee already has an assigned IP!')
    }
  }

  async create(data) {
    const { HOST, VLAN_ID, DEVICE_TYPE, EMPLOYEE_CODE, STATUS } = data

    // 1. Validate HOST
    if (!HOST || !HOST.trim() || !ip.isV4Format(HOST)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'HOST must be a valid IPv4!')
    }

    // 2. Lấy VLAN
    const vlan = await vlansModel.findById(VLAN_ID)

    if (!vlan || !vlan.VLAN_ID) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid VLAN_ID!')
    }

    const host = HOST.trim()
    await this.checkeHostForVlan(host, vlan)

    // 7. Check duplicate IP
    const existed = await ipsModel.findByField(host, 'HOST')
    if (existed) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'IP already exists!')
    }

    const EMPLOYEE_ID = await this.resolveEmployeeCode(EMPLOYEE_CODE)
    await this.checkEmployee(EMPLOYEE_ID)

    // 8. Check status enum
    CHECK_ENUM(STATUS, ALLOWED_STATUS_NETWORK, StatusCodes.BAD_REQUEST, 'Invalid status!')
    // 8. Insert DB
    return await ipsModel.create({
      HOST: host,
      VLAN_ID,
      DEVICE_TYPE,
      EMPLOYEE_ID,
      STATUS
    })
  }

  async update(data) {
    const { IP_ID, ...payload } = data

    const existing = await ipsModel.findById(Number(IP_ID))
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'IP not found!')
    }

    const finalVlanId = payload.VLAN_ID ?? existing.VLAN_ID
    const vlan = await vlansModel.findById(finalVlanId)
    if (!vlan || !vlan.VLAN_ID) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid VLAN_ID!')
    }

    if (payload.HOST !== undefined) {
      if (!payload.HOST || !payload.HOST.trim() || !ip.isV4Format(payload.HOST.trim())) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'HOST must be a valid IPv4!')
      }

      const trimmedHost = payload.HOST.trim()
      const existed = await ipsModel.findByField(trimmedHost, 'HOST')
      if (existed && existed.IP_ID !== Number(IP_ID)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'IP already exists!')
      }

      payload.HOST = trimmedHost
    }

    const finalHost = payload.HOST || existing.HOST
    await this.checkeHostForVlan(finalHost, vlan)

    if (payload.DEVICE_TYPE !== undefined && payload.DEVICE_TYPE !== null) {
      payload.DEVICE_TYPE = String(payload.DEVICE_TYPE).trim()
    }

    if (payload.EMPLOYEE_CODE !== undefined) {
      const resolvedId = await this.resolveEmployeeCode(payload.EMPLOYEE_CODE)
      await this.checkEmployee(resolvedId, Number(IP_ID))
      payload.EMPLOYEE_ID = resolvedId
    }
    delete payload.EMPLOYEE_CODE

    CHECK_ENUM(payload.STATUS, ALLOWED_STATUS_NETWORK, StatusCodes.BAD_REQUEST, 'Invalid status!')

    return await ipsModel.updateById(Number(IP_ID), payload)
  }

  async delete(id) {
    const ipId = Number(id)
    if (Number.isNaN(ipId) || ipId <= 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'IP_ID is required!')
    }

    const existing = await ipsModel.findById(ipId)
    if (!existing) throw new ApiError(StatusCodes.NOT_FOUND, 'IP not found!')
    return await ipsModel.deleteById(ipId)
  }
}

export const ipsService = new IpsService()