module.exports = (debugFn, cb) => {
  return (err, result, stderr = false) => {
    if (err) {
      debugFn('error', err);
    }
    if (result) {
      debugFn('success', result);
    }
    if (stderr) {
      debugFn('stderr', stderr);
    }
    return cb(err, result);
  };
};
