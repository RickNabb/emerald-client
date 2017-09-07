requirejs.config({
  baseUrl: 'emerald/lib',
  paths: {
    app: '../app'
  }
})

requirejs(['app/emerald'])
