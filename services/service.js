const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../db.config/db.config.js')

const login = async (username, password) => {
    try {
        const query = `SELECT * FROM akun WHERE username=$1`
        const user = await db.query(query, [username])
        if (!user.rows[0]) return ({
            code: 404,
            message: 'Username tidak ditemukan'
        })
        var hash = user.rows[0]['user_pass']
        var hasil = await bcrypt.compare(password, hash)
        if (hasil == true) {
            // 10. Generate token menggunakan jwt sign
            let data = {
                id: user.rows[0]['akun_id'],
                username: user.rows[0]['username'],
                role_id: user.rows[0]['role_id'],
                identitas: user.rows[0]['identitas_id']
            }
            const token = jwt.sign(data, process.env.SECRET, { expiresIn: '2h' });

            return ({
                code: 200,
                message: token
            })
        } else {
            return ({
                code: 401,
                message:'Password salah'
                })
        }
    } catch (error) {
        return (error.message);
    }
}

module.exports = {
    login,
}