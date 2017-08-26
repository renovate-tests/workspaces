/**
 * @providesModule SideNav
 * @jsx React.DOM
 */

const React = require('React');
const classNames = require('classnames');

const siteConfig = require('../../siteConfig.js');

class SideNav extends React.Component {
  render() {
    return (
      <nav className="toc">
        <div className="toggleNav">
          <section className="navWrapper wrapper">
            <div className="navBreadcrumb wrapper">
              <div className="navToggle" id="navToggler">
                <i />
              </div>
              <h2>
                <i>›</i>
                <span>
                  {this.props.current.category}
                </span>
              </h2>
            </div>
            <div className="navGroups">
              {this.props.contents.map(this.renderCategory, this)}
            </div>
          </section>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
          var toggler = document.getElementById('navToggler');
          var nav = document.getElementById('docsNav');
          toggler.onclick = function() {
            nav.classList.toggle('docsSliderActive');
          };
        `,
          }}
        />
      </nav>
    );
  }
  renderCategory(category) {
    return (
      <div className="navGroup navGroupActive" key={category.name}>
        <h3>
          {this.getLocalizedCategoryString(category.name)}
        </h3>
        <ul>
          {category.links.map(this.renderItemLink, this)}
        </ul>
      </div>
    );
  }
  getLocalizedCategoryString(category) {
    let categoryString =
      siteConfig[this.props.language]['localized-strings'][category];
    if (typeof categoryString == 'undefined') {
      categoryString = category;
    }
    return categoryString;
  }
  getLocalizedString(metadata) {
    let localizedString = '';
    if (
      typeof metadata.localized_id == 'undefined' ||
      typeof siteConfig[this.props.language] == 'undefined' ||
      typeof siteConfig[this.props.language]['localized-strings'] == 'undefined'
    ) {
      localizedString = metadata.title;
    } else {
      localizedString =
        siteConfig[this.props.language]['localized-strings'][
          metadata.localized_id
        ];
    }
    return localizedString;
  }
  getLink(metadata) {
    if (metadata.permalink) {
      if (metadata.permalink.match(/^https?:/)) {
        return metadata.permalink;
      }
      return '/jest/' + metadata.permalink + '#content';
    }
    if (metadata.path) {
      return '/jest/blog/' + metadata.path;
    }
    return null;
  }
  renderItemLink(link) {
    const itemClasses = classNames('navListItem', {
      navListItemActive: link.id === this.props.current.id,
    });
    const linkClasses = classNames('navItem', {
      navItemActive: link.id === this.props.current.id,
    });
    return (
      <li className={itemClasses} key={link.id}>
        <a className={linkClasses} href={this.getLink(link)}>
          {this.getLocalizedString(link)}
        </a>
      </li>
    );
  }
}
SideNav.defaultProps = {
  contents: [],
};
module.exports = SideNav;
