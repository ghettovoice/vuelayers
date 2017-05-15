/* global PKG_FULLNAME, PKG_DESCRIPTION, PKG_KEYWORDS */
import * as pages from './pages'

const keywords = PKG_KEYWORDS.join(', ')

export default [ {
  path: '/',
  name: 'home',
  component: pages.Home,
  exact: true,
  meta: {
    title: PKG_FULLNAME + '.js',
    description: PKG_DESCRIPTION,
    keywords,
    category: 'General'
  },
  props: {
    title: 'Home'
  }
}, {
  path: '/installation',
  name: 'Installation',
  component: pages.Common,
  meta: {
    title: 'Installation',
    description: 'VueLayers.js installation guide',
    keywords,
    category: 'General'
  },
  props: {
    title: 'Installation',
    subtitle: 'Learn how to install'
  }
}, {
  path: '/components',
  name: 'components',
  component: pages.Common,
  meta: {
    title: 'Components',
    description: 'VueLayers components list',
    keywords,
    category: 'Components'
  },
  props: {
    title: 'Components',
    subtitle: 'List of VueLayers.js components',
    content: require('../pages/components.md')
  }
}, {
  path: '*',
  name: 'not-found',
  component: pages.NotFound,
  meta: {
    title: '404 Not Found',
    description: '404 Not Found',
    keywords
  }
} ]
