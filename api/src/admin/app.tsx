import AuthLogo from './extensions/logo-won.svg';
import favicon from './extensions/favicon.png'

export default {
  config: {
    locales: ['pt-BR', 'en'],
    auth: {
      logo: AuthLogo
    },
    menu: {
      logo: AuthLogo
    },
    head: {
      favicon: favicon
    },
    tutorials: false,
    translations: {
      en: {
        "app.components.LeftMenu.navbrand.title": "Won Games",
        "app.components.LeftMenu.navbrand.workplace": "Admin Page"
      }
    }
  },
  bootstrap(app) {
    console.log(app);
  },
};
