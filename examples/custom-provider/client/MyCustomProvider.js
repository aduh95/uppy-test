const { UIPlugin } = require('@uppy/core')
const { Provider } = require('@uppy/companion-client')
const { ProviderViews } = require('@uppy/provider-views')
const { h } = require('preact')

module.exports = class MyCustomProvider extends UIPlugin {
  constructor (uppy, opts) {
    super(uppy, opts)
    this.type = 'acquirer'
    this.id = this.opts.id || 'MyCustomProvider'
    Provider.initPlugin(this, opts)

    this.icon = () => (
      <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z" fill="#000000" fillRule="nonzero" />
      </svg>
    )

    this.provider = new Provider(uppy, {
      companionUrl: this.opts.companionUrl,
      companionHeaders: this.opts.companionHeaders,
      provider: 'myunsplash',
      pluginId: this.id,
    })

    this.defaultLocale = {
      strings: {
        pluginNameMyUnsplash: 'MyUnsplash',
      },
    }
    this.i18nInit()
    this.title = this.i18n('MyUnsplash')

    this.files = []
    this.onFirstRender = this.onFirstRender.bind(this)
    this.render = this.render.bind(this)

    // merge default options with the ones set by user
    this.opts = { ...opts }
  }

  install () {
    this.view = new ProviderViews(this, {
      provider: this.provider,
    })

    const { target } = this.opts
    if (target) {
      this.mount(target, this)
    }
  }

  uninstall () {
    this.view.tearDown()
    this.unmount()
  }

  onFirstRender () {
    return this.view.getFolder()
  }

  render (state) {
    return this.view.render(state)
  }
}
