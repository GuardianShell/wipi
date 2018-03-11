import Document, { Head, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  render() {
    return (
      <html>
        <Head>
          <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
          <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no,viewport-fit=cover" />
          <link rel="stylesheet"
      href="//cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.12.0/build/styles/default.min.css" />
          <link href="https://cdn.bootcss.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />
          <link rel="stylesheet" href="/_next/static/style.css" />
          <link rel="stylesheet" href=" https://unpkg.com/nprogress@0.2.0/nprogress.css" />
        </Head>
        <body>
          <Main />
          <NextScript />
          <script type="text/javascript" src="http://v2.uyan.cc/code/uyan.js?uid=2146070"></script>
        </body>
      </html>
    )
  }
}