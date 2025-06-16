const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;
require('dotenv').config();

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

const samlStrategy = new SamlStrategy(
  {
    entryPoint: process.env.SAML_ENTRY_POINT,
    issuer: process.env.SAML_ISSUER,
    callbackUrl: process.env.SAML_CALLBACK_URL,
    cert: process.env.SAML_CERT,
    identifierFormat: null
  },
  function(profile, done) {
    return done(null, profile);
  }
);
console.log("SAML Strategy Config:", {
  entryPoint: process.env.SAML_ENTRY_POINT,
  issuer: process.env.SAML_ISSUER,
  callbackUrl: process.env.SAML_CALLBACK_URL,
  cert: process.env.SAML_CERT?.substring(0, 30) + '...' // just for preview
});

passport.use(samlStrategy);
module.exports = passport;
