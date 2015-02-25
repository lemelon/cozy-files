// Generated by CoffeeScript 1.9.1
var File, Folder, sharing;

Folder = require('../models/folder');

File = require('../models/file');

sharing = require('../helpers/sharing');

module.exports.checkClearance = function(permission, type) {
  return function(req, res, next) {
    var element;
    if (req.folder != null) {
      element = new Folder(req.folder);
    } else if (req.file != null) {
      element = new File(req.file);
    } else if (type === 'folder') {
      element = new Folder(req.body);
    } else {
      element = new File(req.body);
    }
    return sharing.checkClearance(element, req, permission, function(authorized, rule) {
      var err;
      if (authorized) {
        if (rule != null) {
          req.guestEmail = rule.email;
          req.guestId = rule.contactid;
        }
        return next();
      } else {
        err = new Error('You cannot access this resource');
        err.status = 401;
        return next(err);
      }
    });
  };
};
