const _ = require('lodash');
const debug = require('debug')('push2cloud-compiler:prepare:getAppManifests');
const debugCb = require('./debugCb');
const async = require('async');
const join = require('path').join;
const repoHash = require('./repoHash');

const MANIFEST_NAME = process.env.MANIFEST_NAME || 'package.json';
const APP_PATH = '.';

module.exports = _.curry((
  plugins
, tmpDir
, releaseManifest
, done
) => {
  debug('starting...');

  const apps = releaseManifest.apps || [];
  const utilityApps = releaseManifest.utilityApps || [];
  const allApps = _.assign({}, apps, utilityApps);

  async.forEachOfSeries(allApps, (
      app
    , appName
    , cb
  ) => {
    const source = app.source || releaseManifest.source;
    const tmpDirHashed = join(tmpDir, repoHash(source));
    const packageJson = join(app.path || APP_PATH, app.manifest || MANIFEST_NAME);

    try {
      const cached = require(join(tmpDirHashed, packageJson));
      if (cached.version === app.version) return cb(null);
    } catch (e) {}

    var ctx = _.cloneDeep(source);
    ctx.target = tmpDirHashed;
    ctx.file = packageJson;

    const p = _.find(plugins, (p) => p.getFile && p.type === source.type);
    if (!p) {
      var err = new Error(`No plugin found that exposes getFile function for type: ${source.type}`);
      debug(err);
      return cb(err);
    }

    p.getFile(ctx)(debugCb(debug, (err, data) => {
      if (err) return cb(err);
      cb(null);
    }));
  }, (err) => {
    if (err) return done(err);
    done(null);
  });
}, 4);
