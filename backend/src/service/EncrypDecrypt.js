const crypto = require('crypto');

const algorithm = 'aes-128-cbc';
const secretKey = Buffer.from(process.env.PROMPT_ENCRYPTION_SECRET_KEY, 'hex'); // 16-byte key
const iv = crypto.randomBytes(16); // Initialization Vector (IV)

// Encrypt function
function encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + encrypted; // Prepend IV to ciphertext
}

// Decrypt function
function decrypt(encryptedText) {
    try {
        if (!encryptedText || encryptedText.length < 32 || !/^[0-9a-fA-F]+$/.test(encryptedText)) {
            return encryptedText;
        }

        const iv = Buffer.from(encryptedText.slice(0, 32), 'hex'); 
        const encryptedData = encryptedText.slice(32); 
        const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);

        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.warn("Decryption failed, returning original text:", error.message);
        return encryptedText;  
    }
}

module.exports = { encrypt, decrypt };