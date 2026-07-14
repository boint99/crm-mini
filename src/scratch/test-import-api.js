import { positionsServices } from '../modules/positions/positions.service.js'

async function test() {
  const csvText = `positionName,level,companyName,status
Trưởng phòng Hành chính,L3,Tổng công ty ACT,ENABLE
Nhân viên Kỹ thuật,L1,,ENABLE`

  try {
    const preview = await positionsServices.importPreview({ csvText })
    console.log('Preview results:')
    console.log(JSON.stringify(preview.summary, null, 2))
    console.log('First record:')
    console.log(JSON.stringify(preview.records[0], null, 2))

    const confirm = await positionsServices.importConfirm({ records: preview.records })
    console.log('Confirm results:')
    console.log(JSON.stringify(confirm, null, 2))
  } catch (error) {
    console.error('Test failed:', error)
  }
}

test()
