import { expressjwt as jwt } from 'express-jwt';
import { expressJwtSecret } from 'jwks-rsa';
import { decode as jwtDecode } from 'jsonwebtoken';

const authConfig = {
  domain: 'dev-igqjd2dbnlcr71c4.us.auth0.com',
  audience: 'https://tradesiml.tech/'
};

// Middleware to check JWT token
const checkJwt = jwt({
  secret: expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`
  }),
  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithms: ['RS256']
});

const extractEmail = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwtDecode(token);
  const email = decodedToken['https://tradesiml.tech/email'];

  if (!email) {
    return res.status(400).json({ error: 'Email not found in token' });
  }

  req.email = email;
  req.body.email = email;
  next();
};

export { checkJwt, extractEmail };
