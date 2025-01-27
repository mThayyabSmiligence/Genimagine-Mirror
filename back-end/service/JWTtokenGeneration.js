const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    const payload = {
        id: user.id,
        username: user.userusername,
        role: user.role,
    };

    const secretKey = process.env.JWT_SECRET_KEY || '80676218f9466f7e32dd5e6ba01a9bddb29d624d45e67269362a49a66c1b38e7e2387893f17ae2374f4740c490fc0fc6a449510da9ebdc3906f9236192ab2bf4'
    const options = {
        expiredIn:'1h',
    };

    const token = jwt.sign(payload, secretKey, options);
    return token;
};

// const user = {id}