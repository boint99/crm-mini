import ip from 'ip'
import { v7 as uuidv7 } from 'uuid'
import { StatusCodes } from 'http-status-codes'

import { vlansModel } from './vlans.model.js'
import { ipsModel } from '../ips/ips.model.js'

import ApiError from '../../../utils/ApiError.js'
import { ALLOWED_STATUS_NETWORK, CHECK_ENUM } from '../../../utils/constants.js'
import ValidateCores from '../../../validates/index.js'

/**
 * Parse CIDR network
 */
function parseNetwork(cidr) {
  const sub = ip.cidrSubnet(cidr)

  return {
    subnetMaskLength: sub.subnetMaskLength,
    subnetMask: sub.subnetMask,
    firstAddress: sub.firstAddress,
    lastAddress: sub.lastAddress,
    ipRange: `${sub.firstAddress} - ${sub.lastAddress}`,
    networkAddress: sub.networkAddress
  }
}

class VlansService {
  async lists() {
    return await vlansModel.lists()
  }

  /**
   * CREATE
   */
  async create(data) {
    const vlanId = Number(data.vlanId)

    const vlanName = data.vlanName.trim()
    const network = data.network.trim()
    const defaultGateway = data.defaultGateway.trim()

    CHECK_ENUM(
      data.status,
      ALLOWED_STATUS_NETWORK,
      StatusCodes.BAD_REQUEST,
      'Invalid status!'
    )

    /**
     * UNIQUE CHECKS
     */
    const existingVlanId = await vlansModel.findByUnique(vlanId, 'vlanId')

    if (existingVlanId) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'Vlan ID already exists!'
      )
    }

    const existingName = await vlansModel.findByField(vlanName, 'vlanName')

    if (existingName) {
      throw new ApiError(StatusCodes.CONFLICT, 'Vlan name already exists!')
    }

    /**
     * NETWORK
     */
    const subnet = ValidateCores.parseSubnet(network)

    const netInfo = parseNetwork(network)

    const normalizedNetwork = `${netInfo.networkAddress}/${netInfo.subnetMaskLength}`

    const existingNetwork = await vlansModel.findByField(normalizedNetwork, 'network')

    if (existingNetwork) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'Network already exists!'
      )
    }

    /**
     * GATEWAY
     */
    const existingGateway = await vlansModel.findByField(defaultGateway, 'defaultGateway')

    if (existingGateway) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'Default gateway already exists!'
      )
    }

    ValidateCores.validateGatewayInSubnet(
      defaultGateway,
      subnet
    )

    /**
     * CREATE
     */
    return await vlansModel.create({
      id: uuidv7(),
      vlanId,
      vlanName,
      network: normalizedNetwork,
      defaultGateway,
      subnetMask: netInfo.subnetMask,
      ipRange: netInfo.ipRange,
      status: data.status || 'ACTIVE'
    })
  }

  /**
   * UPDATE
   */
  async update(data) {
    const { id, vlanId, ...payload } = data

    const existing = await vlansModel.findByUnique(id, 'id')

    if (!existing) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'VLAN not found!'
      )
    }

    const updateData = {}

    /**
     * VLAN NAME
     */
    if (payload.vlanName !== undefined) {
      const vlanName = payload.vlanName.trim()

      const existingName = await vlansModel.findByField(vlanName, 'vlanName')

      if (existingName && existingName.id !== id) {
        throw new ApiError(
          StatusCodes.CONFLICT,
          'Vlan name already exists!'
        )
      }

      updateData.vlanName = vlanName
    }

    /**
     * NETWORK
     */
    if (payload.network !== undefined) {
      const network = payload.network.trim()

      const netInfo = parseNetwork(network)

      const normalizedNetwork =
        `${netInfo.networkAddress}/${netInfo.subnetMaskLength}`

      const existingNetwork =
        await vlansModel.findByField(normalizedNetwork, 'network')

      if (existingNetwork && existingNetwork.id !== id) {
        throw new ApiError(
          StatusCodes.CONFLICT,
          'Network already exists!'
        )
      }

      updateData.network = normalizedNetwork
      updateData.subnetMask = netInfo.subnetMask
      updateData.ipRange = netInfo.ipRange
    }

    /**
     * DEFAULT GATEWAY
     */
    if (payload.defaultGateway !== undefined) {
      const gateway = payload.defaultGateway.trim()

      const existingGateway =
        await vlansModel.findByField(gateway, 'defaultGateway')

      if (existingGateway && existingGateway.id !== id) {
        throw new ApiError(
          StatusCodes.CONFLICT,
          'Default gateway already exists!'
        )
      }

      updateData.defaultGateway = gateway
    }

    /**
     * GATEWAY + SUBNET VALIDATION
     */
    if (
      updateData.network !== undefined ||
      updateData.defaultGateway !== undefined
    ) {
      const finalNetwork =
        updateData.network || existing.network

      const finalGateway =
        updateData.defaultGateway ||
        existing.defaultGateway

      const subnet =
        ValidateCores.parseSubnet(finalNetwork)

      ValidateCores.validateGatewayInSubnet(
        finalGateway,
        subnet
      )
    }

    /**
     * STATUS
     */
    if (payload.status !== undefined) {
      CHECK_ENUM(
        payload.status,
        ALLOWED_STATUS_NETWORK,
        StatusCodes.BAD_REQUEST,
        'Invalid status!'
      )

      updateData.status = payload.status
    }

    /**
     * EMPTY UPDATE
     */
    if (Object.keys(updateData).length === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'No data to update!'
      )
    }

    console.log('UPDATE DATA', updateData)
    return await vlansModel.updateById(id, updateData)
  }

  /**
   * DELETE
   */
  async delete(id) {
    console.log('🚀 ~ VlansService ~ delete ~ id:', id)
    const existing = await vlansModel.findByUnique(id, 'id')

    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'VLAN not found!')
    }

    const linkedIp = await ipsModel.findByField(existing.vlanId, 'vlanId')

    if (linkedIp) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        'Cannot delete VLAN because some IPs are still using it!'
      )
    }

    const payload = { deletedAt: new Date(), status: 'DISABLED' }
    return await vlansModel.updateById(id, payload)
  }
}

export const vlansService = new VlansService()