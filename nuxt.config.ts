// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  css: ["@/assets/css/global.css"],
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
    //...
  build: {
    transpile: ['vuetify'],
  },
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
    //...
          , '@nuxtjs/supabase',],
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
    
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      include: undefined,
      exclude: [],
      // cookieRedirect: false,
    },
  },
    
})
