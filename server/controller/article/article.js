const ArticleModel = require('../../models/article/article')
const UserModel = require('../../models/user')
const marked = require('../util/markdown')
const isAdmin = require('../util/is-admin')
const filter = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>~！@#￥……&*（）——|{}【】‘；：”“'。，、？]", 'g') // 过滤敏感字

const isBlank = str => {
  if (!str || str === '' || str === 'undefined' || str === 'null') {
    return true
  } else {
    return false
  }
}

class ArticleController {
  static constructor() {}

  // 检查并过滤字段
  // 首先进行非空检查，然后过滤字段
  // skips接受一个数组，用于指定不进行非空检查的字段
  static checkArticle(article, skips, ctx) {
    Object.keys(article).forEach(key => {
      if (
        skips.indexOf(key) == -1 
        && !Boolean(article[key])
      ) { // 非跳过字段且该字段键值为空
        ctx.throw(400, { 
          status: 'no', 
          message: `键${key}, ${req[key]}值不通过` 
        })
      }
    })
  }

  // 新增文章
  static async addArticle(ctx, next) {
    const req = ctx.request.body
    // 检查必须字段是否存在
    ['author', 'classify', 'content', 'desc', 'state', 'title'].map(key => {
      if (!req[key]) {
        ctx.throw(400, { message: '存在未填写字段' })
      }
    })

    ArticleController.checkArticle(req, ['cover'], ctx)

    const createdDate = new Date()
    
    const html = marked('<TOC/> \n\n' + '<!-- more --> \n\n' + req.content)
    const i = html.indexOf('<!-- more -->')
    const toc = html.slice(0, i)
    const htmlContent = html.slice(i + 13)

    const result = await ArticleModel.create({...req, htmlContent, toc, createdDate})
      .catch(e => ctx.throw(500))
    ctx.send({ status: 'ok', message: '新增文章成功' })
  }

  // 根据query参数获取文章
  // 形式上更像是 listArticles
  static async getArticle(ctx, next) {
    let { userId, classify, state, keyword, page = 1, pageSize = 20 } = ctx.query
    page = +page
    pageSize = +pageSize
    const query = {}
    !isBlank(classify) && (query.classify = classify)
    !isBlank(state) && (query.state = state)
    !isBlank(userId) && !await isAdmin(userId) && (query.author = userId)

    // 关键字查询(模糊查询)
    if (!!keyword) {
      keyword = keyword.replace(filter, '')
      const reg = new RegExp(keyword, 'i')
      query.$or = [
        { tags: { $regex: reg }},
        { title: { $regex: reg }},
        { desc: { $regex: reg }},
      ]
    }
    const skip = page === 0 ? 0 : (page - 1) * pageSize

    const articles = await ArticleModel
      .find(query)
      .limit(pageSize)
      .skip(skip)
      .populate({        // 连表查询作者信息
        path: 'author', 
        select: 'account avatar _id' 
      })
      .sort({ createdDate: -1 })
      .exec()
      .catch(e => ctx.throw(500))

    const total = await ArticleModel
      .find(query)
      .count()
      .catch(e => ctx.throw(500))

    ctx.send({ status: 'ok', message: '获取文章成功', data: {
        items: articles,
        total
      }
    })
  }

  // 获取指定Id的文章
  static async getArticleById(ctx, next) {
    const { id } = ctx.params
    const article = await ArticleModel
      .findById(id)
      .populate({        // 连表查询作者信息
        path: 'author', 
        select: 'account avatar' 
      })
      .exec()
      .catch(e => ctx.throw(500))
    
    if(!article) {
      ctx.send({ status: 'no', message: '该ID下暂无文章'})
    } else {
      ctx.send({ status: 'ok', message: '获取文章成功', data: { article }})
    }
  }

  // 获取指定Id的文章
  static async getRecentPublishedArticle(ctx, next) {
    const article = await ArticleModel
      .find({ state: 'publish' })
      .sort({ updatedDate: -1 })
      .populate({        // 连表查询作者信息
        path: 'author', 
        select: 'account avatar' 
      })
      .limit(10)
      .catch(e => ctx.throw(500))
   
    ctx.send({ status: 'ok', message: '获取文章成功', data: { article }})
  }

  // 更新指定Id的文章
  static async updateArticle(ctx, next) {
    const { id } = ctx.params
    const req = ctx.request.body
    const userId = req.userId
    const targetArticle = await ArticleModel.findById(id)

    if (
      !userId
      || targetArticle.author != userId
    ) {
      ctx.throw(400, { message: '非文章作者' })
    }

    ArticleController.checkArticle(req, ['cover'], ctx)

    const htmlContent = marked(req.content)
    
    const updatedDate = Date.now()
    const result = await ArticleModel.findByIdAndUpdate(id, {...req, htmlContent, updatedDate})
      .catch(e => ctx.throw(500))
    ctx.send({ status: 'ok', message: '更新文章成功' })
  }

  // 删除指定Id的文章
  static async deleteArticle(ctx, next) {
    const id = ctx.params.id
    const { userId } = ctx.request.body
    const targetArticle = await ArticleModel.findById(id)

    if (
      targetArticle.author == userId 
      || await isAdmin(userId)
    ) {
      const article = await ArticleModel.findByIdAndRemove(id)
        .catch(e => {
          if (e.name === 'CastError') {
            ctx.throw(400, { status: 'no', message: `文章不存在` })
          } else {
            ctx.throw(500)
          }
        })
      ctx.send({ status: 'ok', message: '删除文章成功'}) 
    } else {
      ctx.throw(403, { message: '没有权限删除' })
    }
  }
}

module.exports = ArticleController
