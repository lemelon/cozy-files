// Generated by CoffeeScript 1.8.0
var File, Folder, User, async, clearance, clearanceCtl, helpers, localization, mailTemplate, notiftemplate, templatefile;

File = require('../models/file');

Folder = require('../models/folder');

User = require('../models/user');

helpers = require('../helpers/sharing');

clearance = require('cozy-clearance');

async = require('async');

localization = require('../lib/localization_manager');

templatefile = require('path').join(__dirname, '../views/sharemail.jade');

mailTemplate = notiftemplate = localization.getEmailTemplate('sharemail.jade');

clearanceCtl = clearance.controller({
  mailTemplate: function(options, callback) {
    options.type = options.doc.docType.toLowerCase();
    return User.getDisplayName(function(err, displayName) {
      options.displayName = displayName || localization.t('default user name');
      options.localization = localization;
      return callback(null, mailTemplate(options));
    });
  },
  mailSubject: function(options, callback) {
    var name, type;
    type = options.doc.docType.toLowerCase();
    name = options.doc.name;
    return User.getDisplayName(function(err, displayName) {
      displayName = displayName || localization.t('default user name');
      return callback(null, localization.t('email sharing subject', {
        displayName: displayName,
        name: name
      }));
    });
  }
});

module.exports.fetch = function(req, res, next, id) {
  return async.parallel([
    function(cb) {
      return File.find(id, function(err, file) {
        return cb(null, file);
      });
    }, function(cb) {
      return Folder.find(id, function(err, folder) {
        return cb(null, folder);
      });
    }
  ], function(err, results) {
    var doc, file, folder;
    file = results[0], folder = results[1];
    doc = file || folder;
    if (doc) {
      req.doc = doc;
      return next();
    } else {
      err = new Error('bad usage');
      err.status = 400;
      return next(err);
    }
  });
};

module.exports.details = function(req, res, next) {
  return req.doc.getInheritedClearance(function(err, inherited) {
    if (err != null) {
      return next(err);
    } else {
      return res.send({
        inherited: inherited
      });
    }
  });
};

module.exports.change = function(req, res, next) {
  var body, changeNotification, _ref;
  _ref = req.body, clearance = _ref.clearance, changeNotification = _ref.changeNotification;
  body = {
    clearance: clearance,
    changeNotification: changeNotification
  };
  return req.doc.updateAttributes(body, function(err) {
    if (err) {
      return next(err);
    }
    return res.send(req.doc);
  });
};

module.exports.sendAll = clearanceCtl.sendAll;

module.exports.contactList = clearanceCtl.contactList;

module.exports.contactPicture = clearanceCtl.contactPicture;

module.exports.contact = clearanceCtl.contact;
