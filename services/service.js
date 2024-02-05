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
                role_id: user.rows[0]['role_id']
            }
            const token = jwt.sign(data, process.env.SECRET, { expiresIn: '2h' });

            return ({
                code: 200,
                message: token
            })
        } else {
            return ({
                code: 401,
                message: 'Password salah'
            })
        }
    } catch (error) {
        return (error.message);
    }
}

const accounts = async () => {
    try {
        const query = `SELECT a.akun_id, a.username, r.role_target  FROM akun AS a LEFT JOIN role AS r ON a.role_id = r.role_id ORDER BY a.akun_id DESC`
        const user = await db.query(query)
        return ({
            code: 200,
            message: user.rows
        })
    } catch (error) {
        return (error.message);
    }
}

const kadets = async () => {
    try {
        const query = `SELECT k.kadet_id, k.kadet_nim, k.kadet_nama, k.jenis_kelamin, ket.keterangan_nama, p.pleton_nama, c.kompi_nama, b.batalyon_nama, j_r.jabatan_resimen_nama, j_b.jabatan_batalyon_nama, j_k.jabatan_kompi_nama, j_p.jabatan_pleton_nama, pa.pangkat_singkat  FROM kadet AS k LEFT JOIN keterangan AS ket ON k.keterangan_id = ket.keterangan_id LEFT JOIN pleton AS p ON k.pleton_id = p.pleton_id LEFT JOIN kompi AS c ON p.kompi_id = c.kompi_id LEFT JOIN batalyon AS b ON c.batalyon_id = b.batalyon_id LEFT JOIN jabatan_resimen AS j_r ON j_r.kadet_id = k.kadet_id LEFT JOIN jabatan_batalyon AS j_b ON j_b.kadet_id = k.kadet_id LEFT JOIN jabatan_kompi AS j_k ON j_k.kadet_id = k.kadet_id LEFT JOIN jabatan_pleton AS j_p ON j_p.kadet_id = k.kadet_id LEFT JOIN pangkat AS pa ON k.pangkat_id = pa.pangkat_id WHERE k.status_id = 2 ORDER BY k.kadet_nim`
        const user = await db.query(query)
        return ({
            code: 200,
            message: user.rows
        })
    } catch (error) {
        return (error.message);
    }
}

const jabatans = async () => {
    try {
        const tingkat = ['resimen', 'batalyon', 'kompi', 'pleton']
        var hasil = []
        for (let index = 0; index < tingkat.length; index++) {
            var query = `SELECT j.jabatan_${tingkat[index]}_id as jabatan_id,j.jabatan_${tingkat[index]}_nama as jabatan,k.kadet_nama,k.kadet_nim, p.pangkat_singkat, f.foto_isi, je.jenis_jabatan_nama FROM jabatan_${tingkat[index]} AS j LEFT JOIN kadet AS k ON j.kadet_id = k.kadet_id LEFT JOIN pangkat AS p ON k.pangkat_id = p.pangkat_id LEFT JOIN foto AS f ON k.foto_id = f.foto_id LEFT JOIN jenis_jabatan AS je ON j.jenis_jabatan_id = je.jenis_jabatan_id WHERE j.status_id = 2 ORDER BY j.jabatan_${tingkat[index]}_id`
            var jabatan = await db.query(query)
            for (let i = 0; i < jabatan.rows.length; i++) {
                hasil.push({
                    tingkat: tingkat[index],
                    jabatan_id: jabatan.rows[i].jabatan_id,
                    jabatan_nama: jabatan.rows[i].jabatan,
                    kadet_nama: jabatan.rows[i].kadet_nama,
                    kadet_nim: jabatan.rows[i].kadet_nim,
                    pangkat: jabatan.rows[i].pangkat_singkat,
                    foto: jabatan.rows[i].foto_isi,
                    jenis: jabatan.rows[i].jenis_jabatan_nama
                })
            }

        }
        return ({
            code: 200,
            hasil: hasil
        })
    } catch (error) {
        return (error.message);
    }
}

const dds = async () => {
    try {
        const tingkat = ['resimen', 'batalyon', 'kompi', 'pleton']
        var hasil = []
        for (let index = 0; index < tingkat.length; index++) {
            var query = `SELECT j.dd_${tingkat[index]}_id as dd_id,j.dd_${tingkat[index]}_nama as dd,k.kadet_nama,k.kadet_nim, p.pangkat_singkat, f.foto_isi, je.jenis_jabatan_nama, j.jenis_kelamin FROM dd_${tingkat[index]} AS j LEFT JOIN kadet AS k ON j.kadet_id = k.kadet_id LEFT JOIN pangkat AS p ON k.pangkat_id = p.pangkat_id LEFT JOIN foto AS f ON k.foto_id = f.foto_id LEFT JOIN jenis_jabatan AS je ON j.jenis_jabatan_id = je.jenis_jabatan_id WHERE j.status_id = 2 ORDER BY j.dd_${tingkat[index]}_id`
            var dd = await db.query(query)
            for (let i = 0; i < dd.rows.length; i++) {
                hasil.push({
                    tingkat: tingkat[index],
                    dd_id: dd.rows[i].dd_id,
                    dd_nama: dd.rows[i].dd,
                    kadet_nama: dd.rows[i].kadet_nama,
                    kadet_nim: dd.rows[i].kadet_nim,
                    pangkat: dd.rows[i].pangkat_singkat,
                    foto: dd.rows[i].foto_isi,
                    jenis: dd.rows[i].jenis_jabatan_nama,
                    jk: dd.rows[i].jenis_kelamin
                })
            }

        }
        return ({
            code: 200,
            hasil: hasil
        })
    } catch (error) {
        return (error.message);
    }
}

const cekKadet = async (akun_id) => {
    try {
        const query = `SELECT kadet_nim FROM kadet AS k LEFT JOIN akun AS a ON k.akun_id = a.akun_id WHERE a.akun_id=$1`
        const user = await db.query(query, [akun_id])
        if (!user.rows[0]) {
            return ({
                code: 404,
                message: 'Not Found'
            })
        }
        return ({
            code: 200,
            message: user.rows[0]
        })
    } catch (error) {
        return (error.message);
    }
}

const kadet = async (kadet_nim) => {
    try {
        const query = `SELECT k.kadet_id, k.kadet_nim, k.kadet_nama, k.jenis_kelamin, ket.keterangan_nama, p.pleton_id, p.pleton_nama, c.kompi_nama, b.batalyon_nama, f.foto_isi, pa.pangkat_id, pa.pangkat_nama, s.status_nama  FROM kadet AS k LEFT JOIN keterangan AS ket ON k.keterangan_id = ket.keterangan_id LEFT JOIN pleton AS p ON k.pleton_id = p.pleton_id LEFT JOIN kompi AS c ON p.kompi_id = c.kompi_id LEFT JOIN batalyon AS b ON c.batalyon_id = b.batalyon_id LEFT JOIN foto AS f ON k.foto_id=f.foto_id LEFT JOIN pangkat AS pa ON k.pangkat_id=pa.pangkat_id LEFT JOIN status AS s ON k.status_id=s.status_id WHERE k.kadet_nim=$1`
        const user = await db.query(query, [kadet_nim])
        console.log(user.rows[0].foto_isi.length)
        return ({
            code: 200,
            message: user.rows[0]
        })
    } catch (error) {
        return (error.message);
    }
}

const atribut = async () => {
    try {
        const query = `SELECT * FROM pangkat`
        const hasil = await db.query(query)
        const query2 = `SELECT pleton_id, pleton_nama, k.kompi_id, kompi_nama, b.batalyon_id, batalyon_nama FROM pleton AS p LEFT JOIN kompi AS k ON p.kompi_id=k.kompi_id LEFT JOIN batalyon AS b ON k.batalyon_id=b.batalyon_id`
        const hasil2 = await db.query(query2)
        return ({
            code: 200,
            message: {
                pangkat: hasil.rows,
                pleton: hasil2.rows
            }
        })
    } catch (error) {
        return (error.message);
    }
}

const register = async (username, user_pass, role_id) => {
    try {
        const hash = await bcrypt.hash(user_pass, 10)
        const query = `INSERT INTO akun(username, user_pass, role_id) values($1, $2, $3) returning akun_id;`
        const hasil = await db.query(query, [username, hash, role_id]);
        return ({
            code: 200,
            akun_id: hasil.rows[0].akun_id
        })
    } catch (error) {
        return (error.message);
    }
}

const changePassword = async (akun_id, newpassword) => {
    try {
        const hash = await bcrypt.hash(newpassword, 10)
        const query = `UPDATE akun SET user_pass = $1 WHERE akun_id = $2`
        const hasil = await db.query(query, [hash, akun_id]);
        return ({
            code: 200,
            message: hasil
        })
    } catch (error) {
        return (error.message);
    }
}

const assignJabatan = async (tingkat, jabatan_id, kadet_id) => {
    try {
        const singkat = {
            'resimen':'men',
            'batalyon':'yon',
            'kompi':'ki',
            'pleton':'ton'
        }
        const query = `UPDATE jabatan_${tingkat} SET kadet_id = $1 WHERE jabatan_${tingkat}_id = $2 RETURNING jabatan_${tingkat}_id AS jabatan_id`
        const hasil = await db.query(query, [kadet_id, jabatan_id]);
        const query2 = `INSERT INTO log_jab_${singkat[tingkat]}(log_jab_${singkat[tingkat]}_date, jabatan_${tingkat}_id, kadet_id) VALUES(now(), $1, $2) RETURNING log_jab_${singkat[tingkat]}_id`
        console.log(query2)
        const hasil2 = await db.query(query2, [hasil.rows[0].jabatan_id, kadet_id]);
        return ({
            code: 200,
            message: hasil2
        })
    } catch (error) {
        return (error.message);
    }
}

const foto = async (fotoUrl) => {
    try {
        const query = `INSERT INTO foto(foto_isi) values($1) returning foto_id;`
        const hasil = await db.query(query, [fotoUrl]);
        return ({
            code: 200,
            foto_id: hasil.rows[0].foto_id
        })
    } catch (error) {
        return (error.message);
    }
}

const tambahKadet = async (kadet_nim, kadet_nama, keterangan_id, pleton_id, foto_id, pangkat_id, status_id, akun_id, jk) => {
    try {
        const query = `INSERT INTO kadet(kadet_nim, kadet_nama, keterangan_id, pleton_id, foto_id, pangkat_id, status_id, akun_id, jenis_kelamin) values($1, $2, $3, $4, $5, $6, $7, $8, $9) returning kadet_id;`
        const hasil = await db.query(query, [kadet_nim, kadet_nama, keterangan_id, pleton_id, foto_id, pangkat_id, status_id, akun_id, jk]);
        return ({
            code: 200,
            kadet_id: hasil.rows[0].kadet_id,
            message: 'success'
        })
    } catch (error) {
        return (error.message);
    }
}

const tambahJabatan = async (jenis_jabatan, tingkat, yurisdiksi, nama_jabatan) => {
    try {
        const query = `INSERT INTO jabatan_${tingkat}(jabatan_${tingkat}_nama, status_id, jenis_jabatan_id, ${tingkat}_id) values($1, 2, $2, $3) returning jabatan_${tingkat}_id;`
        const hasil = await db.query(query, [nama_jabatan, jenis_jabatan, yurisdiksi]);
        return ({
            code: 200,
            hasil: hasil.rows[0],
            message: 'success'
        })
    } catch (error) {
        return (error.message);
    }
}

const tambahDD = async (jenis_jabatan, tingkat, yurisdiksi, nama_dd, jk) => {
    try {
        const query = `INSERT INTO dd_${tingkat}(dd_${tingkat}_nama, status_id, jenis_jabatan_id, ${tingkat}_id, jenis_kelamin) values($1, 2, $2, $3, $4) returning dd_${tingkat}_id;`
        const hasil = await db.query(query, [nama_dd, jenis_jabatan, yurisdiksi, jk]);
        return ({
            code: 200,
            hasil: hasil.rows[0],
            message: 'success'
        })
    } catch (error) {
        return (error.message);
    }
}

const editKadet = async (kadet_nim, kadet_nama, pleton_id, pangkat_id, akun_id, jenis_kelamin) => {
    try {
        const query = `UPDATE kadet SET kadet_nim = $1, kadet_nama=$2, pleton_id=$3, pangkat_id=$4, jenis_kelamin=$5 WHERE akun_id = $6 RETURNING foto_id`
        const hasil = await db.query(query, [kadet_nim, kadet_nama, pleton_id, pangkat_id, jenis_kelamin, akun_id]);
        //console.log(hasil)
        return ({
            code: 200,
            foto_id: hasil.rows[0].foto_id
        })
    } catch (error) {
        return (error.message);
    }
}

const editFoto = async (foto_id, foto_isi) => {
    try {
        const query = `UPDATE foto SET foto_isi = $1 WHERE foto_id = $2`
        const hasil = await db.query(query, [foto_isi, foto_id]);
        return ({
            code: 200,
            message: 'success'
        })
    } catch (error) {
        return (error.message);
    }
}

const rollbackTambahKadet = async (foto_id, akun_id) => {
    try {
        const query = `DELETE FROM akun WHERE akun_id=$1`
        const hasil = await db.query(query, [akun_id]);
        const query2 = `DELETE FROM foto WHERE foto_id=$1`
        const hasil2 = await db.query(query2, [foto_id]);
        return ({
            code: 400,
            message: 'Gagal tambah kadet'
        })
    } catch (error) {
        return (error.message);
    }
}

const logKeterangan = async (keterangan_id, kadet_id) => {
    try {
        console.log("sampai service log")
        console.log(keterangan_id, kadet_id);
        const query = `INSERT INTO log_keterangan(log_ket_date, keterangan_id, kadet_id) values(now(), $1, $2) returning log_ket_id;`
        const hasil = await db.query(query, [keterangan_id, kadet_id]);
        console.log(hasil)
        return ({
            code: 200,
            log_ket_id: hasil.rows[0].log_ket_id,
            message: "success"
        })
    } catch (error) {
        console.log(error)
        return (error.message);
    }
}

module.exports = {
    login,
    accounts,
    atribut,
    register,
    foto,
    tambahKadet,
    rollbackTambahKadet,
    kadets,
    kadet,
    logKeterangan,
    changePassword,
    cekKadet,
    editKadet,
    editFoto,
    tambahJabatan,
    jabatans,
    assignJabatan,
    tambahDD,
    dds
}