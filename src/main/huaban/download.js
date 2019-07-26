const Board = require('huaban-dl')
const FAILED = -1
const PROCESSING = 0
const SUCCESS = 1

export async function download(boardId, callback) {

  const generateCallback = status => (msg, argsObj) => callback && callback({ status, msg, args: argsObj })
  const processingCallback = generateCallback(PROCESSING)
  const failedCallback = generateCallback(FAILED)
  const successCallback = generateCallback(SUCCESS)
  const board = new Board(boardId)
  console.log('初始化中……')
  let firstPageLinks
  try {
    const { links } = await board.init()
    firstPageLinks = links
  } catch (error) {
    failedCallback('初始化失败，请检查画板 ID 是否正确')
    return
  }
  processingCallback('初始化完成')
  console.log('初始化完成')
  console.log(`第 ${board.page} 页图片数量：${firstPageLinks.length}，该页所有链接：`)
  console.log(`${firstPageLinks.join('\n')}`)



  // 获取下一页数据
  const next = async () => {
    const data = await board.getNextPage()

    // 结束
    if (!data) {
      return
    }

    const { links } = data
    const page = board.page
    const len = links.length
    processingCallback(`获取第 ${page} 页完成`, { page, len })
    console.log(`第 ${page} 页图片数量：${len}，该页所有链接：`)
    console.log(`${links.join('\n')}`)

    // 递归
    await next()
  }

  // 递归获取下一页数据
  await next()

  console.log(`共有图片 ${board.page} 页，${board.amount} 张`)
  successCallback('获取完成', {
    page: board.page,
    amount: board.amount
  })

  // 下载
  // const { links } = board
  // for (let index = 0; index < links.length; index++) {
  //   const link = links[index];
  //   console.log(`下载图片: ${link}`)
  //   const { data } = await axios({
  //     method: 'GET',
  //     url: link,
  //     responseType: 'arraybuffer'
  //   })
  //   const directory = path.join(__dirname, '../../../download')
  //   fs.exists(directory, isExists => {
  //     if (!isExists) {
  //       console.log(`创建文件夹：${directory}`)
  //       fs.mkdir(directory, err => console.warn)
  //     }
  //     const imgPath = `${directory}/img${index}.jpeg`
  //     console.log(`写入路径：${imgPath}`)
  //     fs.writeFile(imgPath, data, err => { err && console.log(err) })
  //   })
  // }
  return
}