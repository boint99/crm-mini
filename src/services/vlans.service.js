import ip from 'ip'
import { StatusCodes } from 'http-status-codes'
import { vlansModel } from '../models/vlans.model.js'
import ApiError from '../utils/ApiError.js'
import { ALLOWED_STATUS, ALLOWED_STATUS_NETWORK, CHECK_ENUM } from '../utils/constants.js'

/**
 * Parse a CIDR string (e.g. "192.168.1.0/24") and return subnet info.
 */
function parseNetwork(cidr) {
  const sub = ip.cidrSubnet(cidr)
  return {
    subnetMask: sub.subnetMaskLength,
    firstAddress: sub.firstAddress,
    lastAddress: sub.lastAddress,
    ipRange: `${sub.firstAddress} - ${sub.lastAddress}`,
    networkAddress: sub.networkAddress
  }
}

class VlansService {
  async create(data) {
    const { VLAN_CODE, VLAN_NAME, NETWORK, DEFAULT_GATEWAY, STATUS } = data

    // 1. Required fields
    if (!VLAN_CODE) throw new ApiError(StatusCodes.BAD_REQUEST, 'VLAN_CODE is required!')
    if (!VLAN_NAME || !VLAN_NAME.trim()) throw new ApiError(StatusCodes.BAD_REQUEST, 'VLAN_NAME is required!')
    if (!NETWORK || !NETWORK.trim()) throw new ApiError(StatusCodes.BAD_REQUEST, 'NETWORK (CIDR) is required!')
    if (!DEFAULT_GATEWAY || !DEFAULT_GATEWAY.trim()) throw new ApiError(StatusCodes.BAD_REQUEST, 'DEFAULT_GATEWAY is required!')

    // 2. Validate CIDR format & gateway is valid IP
    let netInfo
    try {
      netInfo = parseNetwork(NETWORK.trim())
    } catch {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'NETWORK must be a valid CIDR (e.g. 192.168.1.0/24)')
    }

    if (!ip.isV4Format(DEFAULT_GATEWAY.trim())) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'DEFAULT_GATEWAY must be a valid IPv4 address')
    }

    // 2b. Validate gateway is within the declared network
    if (!ip.cidrSubnet(NETWORK.trim()).contains(DEFAULT_GATEWAY.trim())) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Default gateway must be within the network range')
    }

    // 3. Check uniqueness
    const existingCode = await vlansModel.findByCode(Number(VLAN_CODE))
    if (existingCode) throw new ApiError(StatusCodes.CONFLICT, 'Vlan code already exists!')

    const existingName = await vlansModel.findByName(VLAN_NAME.trim())
    if (existingName) throw new ApiError(StatusCodes.CONFLICT, 'Vlan name already exists!')

    const existingNetwork = await vlansModel.findByNetwork(NETWORK.trim())
    if (existingNetwork) throw new ApiError(StatusCodes.CONFLICT, 'Network already exists!')

    const existingGateway = await vlansModel.findByGateway(DEFAULT_GATEWAY.trim())
    if (existingGateway) throw new ApiError(StatusCodes.CONFLICT, 'Default gateway already exists!')

    // 4. Check status enum
    CHECK_ENUM(STATUS, ALLOWED_STATUS_NETWORK, StatusCodes.BAD_REQUEST, 'Invalid status!')

    // 5. Auto-calculate from CIDR using ip lib
    const createData = {
      VLAN_CODE: Number(VLAN_CODE),
      VLAN_NAME: VLAN_NAME.trim(),
      NETWORK: NETWORK.trim(),
      DEFAULT_GATEWAY: DEFAULT_GATEWAY.trim(),
      SUBNET_MASK: String(netInfo.subnetMask),
      IP_RANGE: netInfo.ipRange,
      STATUS: STATUS || 'ENABLE'
    }

    return await vlansModel.create(createData)
  }

  async update(data) {
    const { VLAN_ID, ...payload } = data
    console.log('🚀 ~ VlansService ~ update ~ VLAN_ID:', VLAN_ID)

    // 1. Check exists
    const existing = await vlansModel.findById(VLAN_ID)
    console.log('🚀 ~ VlansService ~ update ~ existing:', existing)
    if (!existing) throw new ApiError(StatusCodes.NOT_FOUND, 'Vlan not found!')

    // 2. If VLAN_NAME changed, check unique
    if (payload.VLAN_NAME !== undefined) {
      const trimmedName = payload.VLAN_NAME.trim()
      if (!trimmedName) throw new ApiError(StatusCodes.BAD_REQUEST, 'Vlan name cannot be empty!')
      const nameExists = await vlansModel.findByName(trimmedName)
      if (nameExists && nameExists.VLAN_ID !== VLAN_ID) {
        throw new ApiError(StatusCodes.CONFLICT, 'Vlan name already taken by another Vlan!')
      }
      payload.VLAN_NAME = trimmedName
    }

    // 3. If NETWORK changed, recalculate subnet info
    if (payload.NETWORK !== undefined) {
      const trimmedNetwork = payload.NETWORK.trim()
      if (!trimmedNetwork) throw new ApiError(StatusCodes.BAD_REQUEST, 'Network cannot be empty!')

      let netInfo
      try {
        netInfo = parseNetwork(trimmedNetwork)
      } catch {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Network must be a valid CIDR (e.g. 192.168.1.0/24)')
      }

      const networkExists = await vlansModel.findByNetwork(trimmedNetwork)
      if (networkExists && networkExists.VLAN_ID !== VLAN_ID) {
        throw new ApiError(StatusCodes.CONFLICT, 'Network already taken by another Vlan!')
      }

      payload.NETWORK = trimmedNetwork
      payload.SUBNET_MASK = String(netInfo.subnetMask)
      payload.IP_RANGE = netInfo.ipRange
    }

    // 4. If DEFAULT_GATEWAY changed, check unique & valid IP
    if (payload.DEFAULT_GATEWAY !== undefined) {
      const trimmedGw = payload.DEFAULT_GATEWAY.trim()
      if (!ip.isV4Format(trimmedGw)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Default gateway must be a valid IPv4 address')
      }
      const gwExists = await vlansModel.findByGateway(trimmedGw)
      if (gwExists && gwExists.VLAN_ID !== VLAN_ID) {
        throw new ApiError(StatusCodes.CONFLICT, 'Default gateway already taken by another Vlan!')
      }
      payload.DEFAULT_GATEWAY = trimmedGw
    }

    // 4b. Validate gateway is within network
    const finalNetwork = payload.NETWORK || existing.NETWORK
    const finalGateway = payload.DEFAULT_GATEWAY || existing.DEFAULT_GATEWAY
    if (!ip.cidrSubnet(finalNetwork).contains(finalGateway)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Default gateway must be within the network range')
    }

    // 5. Check status enum
    CHECK_ENUM(payload.STATUS, ALLOWED_STATUS_NETWORK, StatusCodes.BAD_REQUEST, 'Invalid status!')

    return await vlansModel.updateById(VLAN_ID, payload)
  }

  async delete(id) {
    const existing = await vlansModel.findById(Number(id))
    if (!existing) throw new ApiError(StatusCodes.NOT_FOUND, 'VLAN not found!')
    return await vlansModel.deleteById(Number(id))
  }
}

export const vlansService = new VlansService()