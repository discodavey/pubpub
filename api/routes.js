// var app = require('./api');
// app.all('/*', function(req, res, next) {
//   // res.header("Access-Control-Allow-Origin", "http://pub.media.mit.edu");
//   res.header("Access-Control-Allow-Origin", req.headers.origin);
//   res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
//   res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
//   res.header("Access-Control-Allow-Credentials", true);
//   next();
// });

require('./routes/app-routes');
<<<<<<< HEAD
require('./routes/atom-routes');
=======
require('./routes/femi-routes');
require('./routes/analytics-routes');
>>>>>>> a8c186d6b9041c57f82c0423b3b0540b92311097
require('./routes/asset-routes');
require('./routes/autocomplete-routes');
require('./routes/discussion-routes');
require('./routes/group-routes');
require('./routes/journal-routes');
require('./routes/jrnl-routes');
require('./routes/login-routes');
require('./routes/pub-routes');
require('./routes/signup-routes');
require('./routes/user-routes');
require('./routes/test-routes');
require('./routes/math-routes');
require('./routes/s3-upload-policy');
require('./routes/rssGen.js');
require('./routes/export-routes');
require('./routes/email-verification-routes');
require('./routes/tag-routes');
require('./routes/version-routes');
require('./routes/settings-routes');
