// Generated by CoffeeScript 1.6.3
var Config, Contact, fs, path;

Contact = require('../models/contact');

Config = require('../models/config');

path = require('path');

fs = require('fs');

module.exports = {
  fetch: function(req, res, next, id) {
    return Contact.find(id, function(err, contact) {
      if (err) {
        return res.error(500, 'An error occured', err);
      }
      if (!contact) {
        return res.error(404, 'Contact not found');
      }
      req.contact = contact;
      return next();
    });
  },
  list: function(req, res) {
    return Contact.request('all', function(err, contacts) {
      if (err) {
        return res.error(500, 'An error occured', err);
      }
      return res.send(contacts);
    });
  },
  create: function(req, res) {
    var model, toCreate;
    model = req.body.contact ? JSON.parse(req.body.contact) : req.body;
    toCreate = new Contact(model);
    return Contact.create(toCreate, function(err, contact) {
      var data, file, _ref;
      if (err) {
        return res.error(500, "Creation failed.", err);
      }
      if (file = (_ref = req.files) != null ? _ref['picture'] : void 0) {
        data = {
          name: 'picture'
        };
        return contact.attachFile(file.path, data, function(err) {
          if (err) {
            return res.error(500, "Creation failed.", err);
          }
          return fs.unlink(file.path, function(err) {
            if (err) {
              return res.error(500, "Creation failed.", err);
            }
            return res.send(contact, 201);
          });
        });
      } else {
        return res.send(contact, 201);
      }
    });
  },
  read: function(req, res) {
    return res.send(req.contact);
  },
  update: function(req, res) {
    var model;
    model = req.body.contact ? JSON.parse(req.body.contact) : req.body;
    return req.contact.updateAttributes(model, function(err) {
      var data, file, _ref;
      if (err) {
        return res.error(500, "Update failed.", err);
      }
      if (file = (_ref = req.files) != null ? _ref['picture'] : void 0) {
        data = {
          name: 'picture'
        };
        return req.contact.attachFile(file.path, data, function(err) {
          if (err) {
            return res.error(500, "Update failed.", err);
          }
          return fs.unlink(file.path, function(err) {
            console.log("failed to purge " + file.path);
            return res.send(req.contact, 201);
          });
        });
      } else {
        return res.send(req.contact, 201);
      }
    });
  },
  "delete": function(req, res) {
    return req.contact.destroy(function(err) {
      if (err) {
        return res.error(500, "Deletion failed.", err);
      }
      return res.send("Deletion succeded.", 204);
    });
  },
  picture: function(req, res) {
    var stream, _ref;
    if ((_ref = req.contact._attachments) != null ? _ref.picture : void 0) {
      stream = req.contact.getFile('picture', function(err) {
        if (err) {
          return res.error(500, "File fetching failed.", err);
        }
      });
      return stream.pipe(res);
    } else {
      return res.sendfile(path.resolve(__dirname, '../assets/defaultpicture.png'));
    }
  },
  vCard: function(req, res) {
    return Config.getInstance(function(err, config) {
      return Contact.request('all', function(err, contacts) {
        var contact, date, out, _i, _len;
        if (err) {
          return res.error(500, 'An error occured', err);
        }
        out = "";
        for (_i = 0, _len = contacts.length; _i < _len; _i++) {
          contact = contacts[_i];
          out += contact.toVCF(config);
        }
        date = new Date();
        date = "" + (date.getYear()) + "-" + (date.getMonth()) + "-" + (date.getDate());
        res.attachment("cozy-contacts-" + date + ".vcf");
        res.set('Content-Type', 'text/x-vcard');
        return res.send(out);
      });
    });
  }
};
