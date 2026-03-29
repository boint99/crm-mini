import ip from 'ip'
import { StatusCodes } from 'http-status-codes'
import { vlansModel } from '../models/vlans.model.js'
import ApiError from '../utils/ApiError.js'
import { ALLOWED_STATUS_NETWORK, CHECK_ENUM } from '../utils/constants.js'
import { ipsModel } from '../models/ips.model.js'
import { employeesModel } from '../models/employees.model.js'


class IpsService {
  async create(data) {
    const { HOST, VLAN_ID, DEVICE_TYPE, EMPLOYEE_ID, STATUS } = data

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

    // 3. Check gateway
    if (vlan.DEFAULT_GATEWAY === host) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'HOST cannot be the same as VLAN gateway!')
    }

    // 4. Check subnet
    const subnet = ip.cidrSubnet(vlan.NETWORK)

    if (!subnet.contains(host)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'IP is not in VLAN network!')
    }

    // 5. Check network & broadcast
    if (
      host === subnet.networkAddress ||
    host === subnet.broadcastAddress
    ) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid IP (network/broadcast)')
    }

    // 6. Check IP_RANGE (nếu có)
    if (vlan.IP_RANGE) {
      const [start, end] = vlan.IP_RANGE.split('-').map(i => i.trim())

      if (
        ip.toLong(host) < ip.toLong(start) ||
      ip.toLong(host) > ip.toLong(end)
      ) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'IP is outside VLAN range!')
      }
    }

    // 7. Check duplicate IP
    const existed = await ipsModel.findByField(host, 'HOST')
    if (existed) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'IP already exists!')
    }

    if (EMPLOYEE_ID) {
      const existingEmp = await employeesModel.findById(EMPLOYEE_ID)
      if (existingEmp) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Employee already has an assigned IP!')
      }
    }

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

  async update() {
    //
  }

  async delete(id) {
    const existing = await ipsModel.findById(Number(id))
    if (!existing) throw new ApiError(StatusCodes.NOT_FOUND, 'IP not found!')
    return await ipsModel.deleteById(Number(id))
  }
}

export const ipsService = new IpsService()