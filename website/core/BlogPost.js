/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @providesModule BlogPost
 * @jsx React.DOM
 */

/* eslint-disable sort-keys */

const Marked = require('Marked');
const React = require('React');
const siteConfig = require('../siteConfig');

class BlogPost extends React.Component {
  renderContent() {
    let content = this.props.content;
    if (this.props.truncate) {
      content = content.split('<!--truncate-->')[0];
      return (
        <article className="post-content">
          <Marked>
            {content}
          </Marked>
          <div className="read-more">
            <a className="button" href={'/jest/blog/' + this.props.post.path}>
              Read More
            </a>
          </div>
        </article>
      );
    }
    return (
      <Marked>
        {content}
      </Marked>
    );
  }

  renderAuthorPhoto() {
    const post = this.props.post;
    if (post.authorFBID) {
      return (
        <div className="authorPhoto">
          <a href={post.authorURL} target="_blank">
            <img
              src={
                'https://graph.facebook.com/' +
                post.authorFBID +
                '/picture/?height=200&width=200'
              }
            />
          </a>
        </div>
      );
    } else {
      return null;
    }
  }

  renderTitle() {
    const post = this.props.post;
    return (
      <h1>
        <a href={'/jest/blog/' + post.path}>
          {post.title}
        </a>
      </h1>
    );
  }

  renderPostHeader() {
    const post = this.props.post;
    const match = post.path.match(/([0-9]+)\/([0-9]+)\/([0-9]+)/);
    // Because JavaScript sucks at date handling :(
    const year = match[1];
    const month = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ][parseInt(match[2], 10) - 1];
    const day = parseInt(match[3], 10);

    const githubButton = this.props.truncate
      ? null
      : <p className="post-meta">
          {siteConfig.githubButton}
        </p>;

    return (
      <header className="postHeader">
        {this.renderAuthorPhoto()}
        <p className="post-authorName">
          <a href={post.authorURL} target="_blank">
            {post.author}
          </a>
        </p>
        {this.renderTitle()}
        {githubButton}
        <p className="post-meta">
          {month} {day}, {year}
        </p>
      </header>
    );
  }

  render() {
    return (
      <div className="post">
        {this.renderPostHeader()}
        {this.renderContent()}
      </div>
    );
  }
}

module.exports = BlogPost;
