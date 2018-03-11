import { Component } from 'react'
import ArticleService from '../service/article'
import Layout from '../components/common/layout'
import Backtop from '../components/common/backtop'
import Cover from '../components/article/cover'
import Author from '../components/article/author'
import Markdown from '../components/article/markdown'
import Tags from '../components/article/tags'
import Comment from '../components/article/comment'

class Article extends Component {
  static async getInitialProps({ query }) {
    const articleId = query.id
    const article = await ArticleService.fetchArticleById(articleId)
    // 更新文章阅读量
    await ArticleService.updateArticleREadingQuantity(articleId)
    return { article }
  }

  render() {
    const { article } = this.props

    return(
      <Layout>
        <div className="container">
          <h1>{ article.title }</h1>
          <Author author={{
            avatar: article.author.avatar,
            account: article.author.account,
            createdDate: article.createdDate,
            readingQuantity: article.readingQuantity,
          }} />
          { article.cover ? <Cover cover={article.cover} />: ''}
          <Markdown content={article.htmlContent} />
          <Tags tags={article.tags} />
          <Comment />
        </div>
        <Backtop />
        <style jsx>{`
        .container {
          padding: 2rem 15px 3rem 15px;
        }

        h1 {
          word-break: break-all;
          font-family: -apple-system,SF UI Display,Arial,PingFang SC,Hiragino Sans GB,Microsoft YaHei,WenQuanYi Micro Hei,sans-serif;
          font-size: 1.6rem;
          font-weight: 700;
          line-height: 1.3;
        }
        `}</style>
      </Layout>
    )
  }
}

export default Article
