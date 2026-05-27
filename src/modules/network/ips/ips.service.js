import ip from 'ip'
import { StatusCodes } from 'http-status-codes'
import { vlansModel } from '../vlans/vlans.model.js'
import ApiError from '../../../utils/ApiError.js'
import { ALLOWED_STATUS_NETWORK, CHECK_ENUM } from '../../../utils/constants.js'
import { ipsModel } from './ips.model.js'
import { employeesModel } from '../../employees/employees.model.js'
import { v7 as uuidv7 } from 'uuid'

class IpsService {
  async lists(query) {
    if (!query || !query.vlanid) {
      return await ipsModel.lists()
    }
    else {
      const { vlanid } = query

      const findVlan = await vlansModel.findByUnique(vlanid, 'id')
      if (!findVlan) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid VLAN ID!')
      }
      if (findVlan.isDeleted) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'VLAN ID is deleted!')
      }

      const queryData = {
        vlanId: findVlan.vlanId,
        deletedAt: null
      }
      return await ipsModel.listQuery(queryData)
    }

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
    const { host, vlanId, deviceType, employeeCode, status } = data

    // 1. Validate HOST
    if (!host || !host.trim() || !ip.isV4Format(host)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'host must be a valid IPv4!')
    }

    // 2. VLAN
    const findVlanId = await vlansModel.findByUnique(vlanId, 'id')
    if (!findVlanId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid VLAN ID!')
    }
    if (findVlanId.isDeleted) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'VLAN ID is deleted!')
    }

    const hostTrim = host.trim()
    await this.checkeHostForVlan(hostTrim, findVlanId)

    // 3. Check duplicate IP
    const existed = await ipsModel.findByField(hostTrim, 'host')
    if (existed) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'IP already exists!')
    }

    let employee
    if (employeeCode) {
      const emp = await employeesModel.findByField(employeeCode.trim(), 'employeeCode')
      if (!emp) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Employee code not found!')
      }
      employee = emp
    }

    // 4. Check status enum
    CHECK_ENUM(status, ALLOWED_STATUS_NETWORK, StatusCodes.BAD_REQUEST, 'Invalid status!')

    // 5. Insert DB
    return await ipsModel.create({
      id: uuidv7(),
      host: hostTrim,
      vlanId: findVlanId.vlanId,
      deviceType: deviceType?.trim() || null,
      employeeId: employee?.employeeId || null,
      status: status || 'INACTIVE'
    })
  }

  async update(data) {
    const { id, ...payload } = data

    // 1. Find existing IP
    const existing = await ipsModel.findByUnique(id, 'id')

    if (!existing || existing.deletedAt) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'IP not found!'
      )
    }

    const updateData = {}

    // =========================================================
    // 2. Update host
    // =========================================================
    if (payload.host !== undefined) {
      const trimmedHost = String(payload.host).trim()

      if (!ip.isV4Format(trimmedHost)) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Host must be a valid IPv4!'
        )
      }

      const existedHost = await ipsModel.findByField(
        trimmedHost,
        'host'
      )

      if (
        existedHost &&
      existedHost.id !== existing.id &&
      !existedHost.deletedAt
      ) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'IP already exists!'
        )
      }

      updateData.host = trimmedHost
    }

    // =========================================================
    // 3. Update VLAN
    // =========================================================
    if (payload.vlanId !== undefined) {
      const vlan = await vlansModel.findByUnique(
        payload.vlanId,
        'id'
      )

      if (!vlan || vlan.deletedAt) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Invalid VLAN!'
        )
      }

      // lưu FK UUID
      updateData.vlanId = vlan.vlanId
    }

    // =========================================================
    // 4. Update device type
    // =========================================================
    if (payload.deviceType !== undefined) {
      updateData.deviceType = payload.deviceType
        ? String(payload.deviceType).trim()
        : null
    }

    // =========================================================
    // 5. Update employee
    // =========================================================
    if (payload.employeeCode !== undefined) {
    // remove employee
      if (
        payload.employeeCode === null || payload.employeeCode === '') {
        updateData.employeeId = null
      } else {
        const employee = await employeesModel.findByField(
          payload.employeeCode.trim(),
          'employeeCode'
        )

        if (!employee || employee.deletedAt) {
          throw new ApiError(
            StatusCodes.BAD_REQUEST,
            'Employee code not found!'
          )
        }

        updateData.employeeId = employee.employeeId
      }
    }

    // =========================================================
    // 6. Validate host with VLAN subnet
    // =========================================================
    const finalVlanId = updateData.vlanId ?? existing.vlanId

    const finalHost = updateData.host ?? existing.host

    const finalVlan = await vlansModel.findByUnique(
      finalVlanId,
      'vlanId'
    )

    if (!finalVlan || finalVlan.deletedAt) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Invalid VLAN!'
      )
    }

    updateData.vlanId = finalVlan.vlanId

    // =========================================================
    // 7. Update status
    // =========================================================
    if (payload.status !== undefined) {
      CHECK_ENUM(
        payload.status,
        ALLOWED_STATUS_NETWORK,
        StatusCodes.BAD_REQUEST,
        'Invalid status!'
      )

      updateData.status =
      payload.status.toUpperCase()
    }

    // =========================================================
    // 8. No update data
    // =========================================================
    if (Object.keys(updateData).length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'No data to update!'
      )
    }

    // =========================================================
    // 9. Update DB
    // =========================================================
    return await ipsModel.updateById(
      existing.ipId,
      updateData
    )
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
