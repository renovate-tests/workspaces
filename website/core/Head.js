/**
 * @providesModule Head
 * @jsx React.DOM
 */

const React = require('React');

const Head = React.createClass({
  render() {
    return (
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <title>
          {this.props.title}
        </title>
        <meta name="viewport" content="width=device-width" />
        <meta property="og:title" content={this.props.title} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={this.props.url} />
        <meta
          property="og:image"
          content="https://facebook.github.io/jest/img/opengraph.png"
        />
        <meta property="og:description" content={this.props.description} />

        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/jest/img/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/jest/img/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/jest/img/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/jest/img/favicon/manifest.json" />
        <link
          rel="mask-icon"
          href="/jest/img/favicon/safari-pinned-tab.svg"
          color="#5bbad5"
        />
        <link rel="shortcut icon" href="/jest/img/favicon/favicon.ico" />
        <meta
          name="msapplication-config"
          content="/jest/img/favicon/browserconfig.xml"
        />
        <meta name="theme-color" content="#99424f" />

        <link
          rel="alternate"
          type="application/atom+xml"
          href="/jest/blog/atom.xml"
          title="Jest Blog ATOM Feed"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          href="/jest/blog/feed.xml"
          title="Jest Blog RSS Feed"
        />
        <link rel="shortcut icon" href="/jest/img/favicon.png" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/docsearch.js/1/docsearch.min.css"
        />
        <link rel="stylesheet" href="/jest/css/jest.css?v=2" />
        <link
          rel="stylesheet"
          href="//cdn.jsdelivr.net/font-hack/2.020/css/hack.min.css"
        />

        <script type="text/javascript" src="//use.typekit.net/vqa1hcx.js" />
        <script type="text/javascript">
          {'try{Typekit.load();}catch(e){}'}
        </script>
      </head>
    );
  },
});

module.exports = Head;
