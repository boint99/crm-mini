import ip from 'ip'
import { StatusCodes } from 'http-status-codes'
import { vlansModel } from '../vlans/vlans.model.js'
import ApiError from '../../../utils/ApiError.js'
import { ALLOWED_STATUS_NETWORK, CHECK_ENUM } from '../../../utils/constants.js'
import { ipsModel } from './ips.model.js'
import { employeesModel } from '../../employees/employees.model.js'
import { v7 as uuidv7 } from 'uuid'

class IpsService {
  async lists() {
    return await ipsModel.lists()
  }

  async checkeHostForVlan(host, vlan) {
    const subnet = ip.cidrSubnet(vlan.network)

    if (vlan.defaultGateway === host) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'HOST cannot be the same as VLAN gateway!')
    }

    if (!subnet.contains(host)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'IP is not in VLAN network!')
    }

    if (host === subnet.networkAddress || host === subnet.broadcastAddress) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid IP (network/broadcast)')
    }

    if (vlan.ipRange) {
      const [start, end] = vlan.ipRange.split('-').map(item => item.trim())

      if (ip.toLong(host) < ip.toLong(start) || ip.toLong(host) > ip.toLong(end)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'IP is outside VLAN range!')
      }
    }
  }

  async checkEmployee(employeeId, currentIpId = null) {
    if (employeeId === undefined || employeeId === null) return

    const empId = Number(employeeId)
    const employee = await employeesModel.findById(empId)
    if (!employee) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid employeeId!')
    }

    const assignedIp = await ipsModel.findByField(empId, 'employeeId')
    if (assignedIp && assignedIp.ipId !== currentIpId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Employee already has an assigned IP!')
    }
  }

  async create(data) {
    const { host, vlanId, deviceType, employeeId, status } = data

    // 1. Validate HOST
    if (!host || !host.trim() || !ip.isV4Format(host)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'host must be a valid IPv4!')
    }

    // 2. Resolve VLAN
    const vlanIdNum = Number(vlanId)
    const findVlanId = await vlansModel.findByField(vlanIdNum, 'vlanId')
    if (!findVlanId || !findVlanId.vlanId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid vlanId!')
    }

    const hostTrim = host.trim()
    await this.checkeHostForVlan(hostTrim, findVlanId)

    // 3. Check duplicate IP
    const existed = await ipsModel.findByField(hostTrim, 'host')
    if (existed) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'IP already exists!')
    }

    await this.checkEmployee(employeeId)

    // 4. Check status enum
    CHECK_ENUM(status, ALLOWED_STATUS_NETWORK, StatusCodes.BAD_REQUEST, 'Invalid status!')

    // 5. Insert DB
    return await ipsModel.create({
      id: uuidv7(),
      host: hostTrim,
      vlanId: Number(vlanId),
      deviceType: deviceType?.trim() || null,
      employeeId: employeeId ? Number(employeeId) : null,
      status: status || 'INACTIVE'
    })
  }

  async update(data) {
    const { id, ...payload } = data

    const existing = await ipsModel.findByUnique(id, 'id')
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'IP not found!')
    }

    const updateData = {}

    // 1. If host changed
    if (payload.host !== undefined) {
      const trimmedHost = payload.host.trim()
      if (!trimmedHost || !ip.isV4Format(trimmedHost)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'host must be a valid IPv4!')
      }

      const existed = await ipsModel.findByField(trimmedHost, 'host')
      if (existed && existed.id !== id) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'IP already exists!')
      }

      updateData.host = trimmedHost
    }

    // 2. If vlanId changed
    if (payload.vlanId !== undefined) {
      const vlanIdNum = Number(payload.vlanId)
      if (isNaN(vlanIdNum) || vlanIdNum <= 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'vlanId must be a valid positive number!')
      }
      const vlan = await vlansModel.findByUnique(vlanIdNum, 'vlanId')
      if (!vlan) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid vlanId!')
      }
      updateData.vlanId = vlanIdNum
    }

    // 3. If deviceType changed
    if (payload.deviceType !== undefined) {
      updateData.deviceType = payload.deviceType ? String(payload.deviceType).trim() : null
    }

    // 4. If employeeId changed
    if (payload.employeeId !== undefined) {
      if (payload.employeeId === null) {
        updateData.employeeId = null
      } else {
        await this.checkEmployee(payload.employeeId, existing.ipId)
        updateData.employeeId = Number(payload.employeeId)
      }
    }

    // 5. Validate gateway/subnet constraint if host or vlanId changes
    const finalVlanId = updateData.vlanId ?? existing.vlanId
    const vlan = await vlansModel.findByUnique(Number(finalVlanId), 'vlanId')
    if (!vlan) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid vlanId!')
    }

    const finalHost = updateData.host || existing.host
    await this.checkeHostForVlan(finalHost, vlan)

    // 6. If status changed
    if (payload.status !== undefined) {
      CHECK_ENUM(payload.status, ALLOWED_STATUS_NETWORK, StatusCodes.BAD_REQUEST, 'Invalid status!')
      updateData.status = payload.status
    }

    if (Object.keys(updateData).length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'No data to update!')
    }

    return await ipsModel.updateById(existing.ipId, updateData)
  }

  async delete(id) {
    const existing = await ipsModel.findByUnique(id, 'id')
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'IP not found!')
    }
    return await ipsModel.deleteById(existing.ipId)
  }
}

export const ipsService = new IpsService()
