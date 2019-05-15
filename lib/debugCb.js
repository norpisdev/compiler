module.exports = (debugFn, cb) => {
  return (err, stdout, stderr) => {
    if (err) {
      debugFn('error', err);
    }
    if (stdout) {
      debugFn('success', stdout);
    }
    if (stderr) {
      debugFn('stderr', stderr);
    }
    return cb(err, stdout);
  };
};
