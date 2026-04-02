import ip from 'ip'
import { StatusCodes } from 'http-status-codes'
import { vlansModel } from '../models/vlans.model.js'
import ApiError from '../utils/ApiError.js'
import { ALLOWED_STATUS_NETWORK, CHECK_ENUM } from '../utils/constants.js'
import ValidateCores from '../core/validate.core.js'

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
  async lists(queryStatus, query) {
    const allowedFields = ['status', 'vlan_code']

    // Validate query params
    const queryKeys = Object.keys(query)

    // Only allow certain fields for filtering
    const invalidKeys = queryKeys.filter(
      key => !allowedFields.includes(key)
    )
    // If there are invalid query params, throw an error
    if (invalidKeys.length > 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Invalid query params: ${invalidKeys.join(', ')}`
      )
    }

    CHECK_ENUM(queryStatus, ALLOWED_STATUS_NETWORK, StatusCodes.BAD_REQUEST, 'Invalid status filter!')

    if (query.vlan_code) {
      const checkVlanCode =  await vlansModel.findByUnique(Number(query.vlan_code), 'VLAN_CODE')
      if (!checkVlanCode) {
        throw new ApiError(StatusCodes.BAD_REQUEST, `Vlan code ${query.vlan_code} does not exist!`)
      }
    }
    const data = {
      STATUS: queryStatus || undefined,
      VLAN_CODE: query.vlan_code ? Number(query.vlan_code) : undefined
    }
    return await vlansModel.listQuery(data)
  }
  async create(data) {
    const { VLAN_CODE, VLAN_NAME, NETWORK, DEFAULT_GATEWAY, STATUS } = data

    // 1. Required fields
    if (!VLAN_CODE) throw new ApiError(StatusCodes.BAD_REQUEST, 'VLAN_CODE is required!')
    if (!VLAN_NAME || !VLAN_NAME.trim()) throw new ApiError(StatusCodes.BAD_REQUEST, 'VLAN_NAME is required!')
    if (!NETWORK || !NETWORK.trim()) throw new ApiError(StatusCodes.BAD_REQUEST, 'NETWORK (CIDR) is required!')
    if (!DEFAULT_GATEWAY || !DEFAULT_GATEWAY.trim()) throw new ApiError(StatusCodes.BAD_REQUEST, 'DEFAULT_GATEWAY is required!')

    // 2. Validate CIDR format & gateway is valid IP
    let netInfo
    let subnet
    try {
      subnet = ValidateCores.parseSubnet(NETWORK.trim())
      if (!subnet) {
        throw new Error('Invalid subnet')
      }
      netInfo = parseNetwork(NETWORK.trim())
    } catch {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'NETWORK must be a valid CIDR (e.g. 192.168.1.0/24)')
    }

    ValidateCores.validateGatewayInSubnet(DEFAULT_GATEWAY, subnet)

    // 3. Check uniqueness
    const existingCode = await vlansModel.findByCode(Number(VLAN_CODE))
    if (existingCode) throw new ApiError(StatusCodes.CONFLICT, 'Vlan code already exists!')

    const existingName = await vlansModel.findByName(VLAN_NAME.trim())
    if (existingName) throw new ApiError(StatusCodes.CONFLICT, 'Vlan name already exists!')

    let networkFormat = `${netInfo.networkAddress}/${netInfo.subnetMask}`
    const existingNetwork = await vlansModel.findByNetwork(networkFormat)
    if (existingNetwork) throw new ApiError(StatusCodes.CONFLICT, 'Network already exists!')

    // 4. Check status enum
    CHECK_ENUM(STATUS, ALLOWED_STATUS_NETWORK, StatusCodes.BAD_REQUEST, 'Invalid status!')

    // 5. Auto-calculate from CIDR using ip lib
    const createData = {
      VLAN_CODE: Number(VLAN_CODE),
      VLAN_NAME: VLAN_NAME.trim(),
      NETWORK: networkFormat,
      DEFAULT_GATEWAY: DEFAULT_GATEWAY.trim(),
      SUBNET_MASK: String(netInfo.subnetMask),
      IP_RANGE: netInfo.ipRange,
      STATUS: data.STATUS
    }

    return await vlansModel.create(createData)
  }

  async update(data) {
    const { VLAN_ID, ...payload } = data
    // 1. Check exists
    const existing = await vlansModel.findById(VLAN_ID)
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

      const networkExists = await vlansModel.findByNetwork(String(netInfo.networkAddress))
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
    ValidateCores.validateGatewayInSubnet(finalGateway, finalNetwork)

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