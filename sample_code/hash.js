const bcrypt = require('bcrypt')

// 1234
// hash -> abcd
async function run() {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash('1234', salt);

    console.log(salt);
    console.log(hashed);
    const hashed2 = await bcrypt.hash('1234', salt);
    console.log(hashed2);

    return salt;
}

run();