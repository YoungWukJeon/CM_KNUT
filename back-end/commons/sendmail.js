var email = require("emailjs");
var config = require("../commons/secret").smtp_info.admin;

function sendMail(options) {
  var server = email.server.connect({
    user: config.user,
    password: config.password,
    host: config.host,
    ssl: true
  });

  var message = {
    text: options.text || "test sending email with node.js",
    from: "Community Mapping in KNUT " + config.from,
    to: options.to || "Your To Info",
    subject: options.subject || "testing emailjs",
    attachment: [
      {
        data: options.data || "<html>i <i>hope</i> this works!</html>",
        alternative: true
      }
    ]
  };

  server.send(message, function(err, message) {
    console.log(err || message);

    if (err) {
      options.res.json("fail");
    } else {
      options.res.json("success");
    }
  });
}

module.exports = {
  send: sendMail
};
