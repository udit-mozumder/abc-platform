const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(new SamlStrategy(
  {
    entryPoint: process.env.SAML_ENTRY_POINT,
    issuer: process.env.SAML_ISSUER,
    callbackUrl: process.env.SAML_CALLBACK_URL,
    cert: process.env.SAML_CERT.replace(/\\n/g, '\n'),
  },
  (profile, done) => done(null, profile)
));

<<<<<<< HEAD
module.exports = passport;
=======
module.exports = passport;
>>>>>>> d1de502 (Step 4: Added SAML login routes and auth logic)
