// mixins used in multiple components
export default {
  methods: {
    openExternalLink(url) {
      // electron is set in index.html
      // this opens an url in the normal browser
      if (window.electron && window.electron.shell) {
        window.electron.shell.openExternal(url);
      }
    },
  },
};
