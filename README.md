## sitedesigns-manager

Work in progress...

Functionality:
* List site designs
* Edit site design
* Edit site scripts within the site design
* Delete site design
* List site scripts
* Filter site scripts
* Refresh site designs & site scripts
* etc...

### Building the code

```bash
git clone the repo
npm i
npm i -g gulp
gulp
```

This package produces the following:

* lib/* - intermediate-stage commonjs build artifacts
* dist/* - the bundled script, along with other resources
* deploy/* - all resources which should be uploaded to a CDN.

### Build options

gulp clean - TODO
gulp test - TODO
gulp serve - TODO
gulp bundle - TODO
gulp package-solution - TODO
