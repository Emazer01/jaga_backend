const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../db.config/db.config.js')

const tingkat = ['resimen', 'batalyon', 'kompi', 'pleton']

const singkat = {
    'resimen': 'men',
    'batalyon': 'yon',
    'kompi': 'ki',
    'pleton': 'ton'
}

const subOrdinates = {
    'resimen': 'batalyon',
    'batalyon': 'kompi',
    'kompi': 'pleton',
    'pleton': ''
}

const forward = {
    'pleton': `
        left join ton_ki tk on tk.apel_ton_id = a.apel_ton_id
        left join ki_yon ky on ky.apel_ki_id = tk.apel_ki_id
        left join yon_men ym on ym.apel_yon_id = ky.apel_yon_id

        left join pleton ton on ton.pleton_id = a.pleton_id
        left join kompi ki on ki.kompi_id = ton.kompi_id
        left join batalyon yon on yon.batalyon_id = ki.batalyon_id
    `,
    'kompi': `
        left join ton_ki tk on tk.apel_ki_id = a.apel_ki_id
        left join ki_yon ky on ky.apel_ki_id = a.apel_ki_id
        left join yon_men ym on ym.apel_yon_id = ky.apel_yon_id
        
        left join kompi ki on ki.kompi_id = a.kompi_id
        left join batalyon yon on yon.batalyon_id = ki.batalyon_id
    `,
    'batalyon': `
        left join yon_men ym on ym.apel_yon_id = a.apel_yon_id
        left join ki_yon ky on ky.apel_yon_id = a.apel_yon_id 
        left join ton_ki tk on tk.apel_ki_id = ky.apel_ki_id 
        
        left join batalyon yon on yon.batalyon_id = a.batalyon_id
    `,
    'resimen': `
        left join yon_men ym on ym.apel_men_id = a.apel_men_id
        left join ki_yon ky on ky.apel_yon_id = ym.apel_yon_id 
        left join ton_ki tk on tk.apel_ki_id = ky.apel_ki_id 
        
        left join resimen men on men.resimen_id = a.resimen_id
    `
}

//==============================================================================//
//============================== SELECT NO PARAMS ==============================//
//==============================================================================//

const accounts = async () => {
    try {
        const query = `
        SELECT 
            a.akun_id, 
            a.username, 
            r.role_target,
            k.kadet_nama,
            s.status_id,
            s.status_nama
        FROM 
            akun AS a 
            LEFT JOIN role AS r ON a.role_id = r.role_id 
            LEFT JOIN kadet AS k ON a.akun_id = k.akun_id 
            LEFT JOIN status AS s ON a.status_id = s.status_id
        ORDER BY a.akun_id DESC`
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
        const query = `
        SELECT 
            k.kadet_id, 
            k.kadet_nim, 
            k.kadet_nama, 
            k.jenis_kelamin,
            k.angkatan,
            ket.keterangan_nama, 
            p.pleton_nama, 
            c.kompi_nama, 
            b.batalyon_nama, 
            j_r.jabatan_resimen_nama, 
            j_b.jabatan_batalyon_nama, 
            j_k.jabatan_kompi_nama, 
            j_p.jabatan_pleton_nama, 
            d_r.dd_resimen_nama, 
            d_b.dd_batalyon_nama, 
            d_k.dd_kompi_nama, 
            d_p.dd_pleton_nama, 
            pa.pangkat_singkat  
        FROM 
            kadet AS k 
            LEFT JOIN keterangan AS ket ON k.keterangan_id = ket.keterangan_id 
            LEFT JOIN pleton AS p ON k.pleton_id = p.pleton_id 
            LEFT JOIN kompi AS c ON p.kompi_id = c.kompi_id 
            LEFT JOIN batalyon AS b ON c.batalyon_id = b.batalyon_id 
            LEFT JOIN jabatan_resimen AS j_r ON j_r.kadet_id = k.kadet_id 
            LEFT JOIN jabatan_batalyon AS j_b ON j_b.kadet_id = k.kadet_id 
            LEFT JOIN jabatan_kompi AS j_k ON j_k.kadet_id = k.kadet_id 
            LEFT JOIN jabatan_pleton AS j_p ON j_p.kadet_id = k.kadet_id 
            LEFT JOIN dd_resimen AS d_r ON d_r.kadet_id = k.kadet_id 
            LEFT JOIN dd_batalyon AS d_b ON d_b.kadet_id = k.kadet_id 
            LEFT JOIN dd_kompi AS d_k ON d_k.kadet_id = k.kadet_id 
            LEFT JOIN dd_pleton AS d_p ON d_p.kadet_id = k.kadet_id 
            LEFT JOIN pangkat AS pa ON k.pangkat_id = pa.pangkat_id 
            LEFT JOIN akun AS a ON k.akun_id = a.akun_id
        WHERE a.status_id = 2 
        ORDER BY k.kadet_nim`
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
        var hasil = []
        for (let index = 0; index < tingkat.length; index++) {
            var query = `
            SELECT 
                j.jabatan_${tingkat[index]}_id as jabatan_id, 
                j.${tingkat[index]}_id as yurisdiksi_id, 
                y.${tingkat[index]}_nama as yurisdiksi_nama, 
                j.jabatan_${tingkat[index]}_nama as jabatan,
                k.kadet_nama,
                k.kadet_nim, 
                p.pangkat_singkat, 
                f.foto_isi, 
                je.jenis_jabatan_nama, 
                s.status_nama 
            FROM 
                jabatan_${tingkat[index]} AS j 
                LEFT JOIN kadet AS k ON j.kadet_id = k.kadet_id 
                LEFT JOIN pangkat AS p ON k.pangkat_id = p.pangkat_id 
                LEFT JOIN foto AS f ON k.foto_id = f.foto_id 
                LEFT JOIN jenis_jabatan AS je ON j.jenis_jabatan_id = je.jenis_jabatan_id 
                LEFT JOIN status AS s ON j.status_id = s.status_id 
                LEFT JOIN ${tingkat[index]} AS y ON j.${tingkat[index]}_id = y.${tingkat[index]}_id
            ORDER BY j.jabatan_${tingkat[index]}_id`
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
                    jenis: jabatan.rows[i].jenis_jabatan_nama,
                    status: jabatan.rows[i].status_nama,
                    yurisdiksi_id: jabatan.rows[i].yurisdiksi_id,
                    yurisdiksi_nama: jabatan.rows[i].yurisdiksi_nama
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
        var hasil = []
        for (let index = 0; index < tingkat.length; index++) {
            var query = `
            SELECT 
                j.dd_${tingkat[index]}_id as dd_id,
                j.dd_${tingkat[index]}_nama as dd,
                k.kadet_nama,
                k.kadet_nim, 
                p.pangkat_singkat, 
                f.foto_isi, 
                je.jenis_jabatan_nama, 
                j.jenis_kelamin, 
                s.status_nama 
            FROM 
                dd_${tingkat[index]} AS j 
                LEFT JOIN kadet AS k ON j.kadet_id = k.kadet_id 
                LEFT JOIN pangkat AS p ON k.pangkat_id = p.pangkat_id 
                LEFT JOIN foto AS f ON k.foto_id = f.foto_id 
                LEFT JOIN jenis_jabatan AS je ON j.jenis_jabatan_id = je.jenis_jabatan_id 
                LEFT JOIN status AS s ON j.status_id = s.status_id
            ORDER BY j.dd_${tingkat[index]}_id`
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
                    jk: dd.rows[i].jenis_kelamin,
                    status: dd.rows[i].status_nama
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

//====================================================================//
//============================== INSERT ==============================//
//====================================================================//

const register = async (username, user_pass, role_id) => {
    try {
        const hash = await bcrypt.hash(user_pass, 10)
        const query = `INSERT INTO akun(username, user_pass, role_id, status_id) values($1, $2, $3, 2) returning akun_id;`
        const hasil = await db.query(query, [username, hash, role_id]);
        return ({
            code: 200,
            akun_id: hasil.rows[0].akun_id
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

const tambahKadet = async (kadet_nim, kadet_nama, keterangan_id, pleton_id, foto_id, pangkat_id, akun_id, jk, angkatan) => {
    try {
        const query = `INSERT INTO kadet(kadet_nim, kadet_nama, keterangan_id, pleton_id, foto_id, pangkat_id, akun_id, jenis_kelamin, angkatan) values($1, $2, $3, $4, $5, $6, $7, $8, $9) returning kadet_id;`
        const hasil = await db.query(query, [kadet_nim, kadet_nama, keterangan_id, pleton_id, foto_id, pangkat_id, akun_id, jk, angkatan]);
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

const logKeterangan = async (keterangan_id, kadet_id) => {
    try {
        const query = `INSERT INTO log_keterangan(log_ket_date, keterangan_id, kadet_id) values(now(), $1, $2) returning log_ket_id;`
        const hasil = await db.query(query, [keterangan_id, kadet_id]);
        return ({
            code: 200,
            log_ket_id: hasil.rows[0].log_ket_id,
            message: "success"
        })
    } catch (error) {
        return (error.message);
    }
}

const lapApel = async (tingkat, yurisdiksi_id, pelapor_kadet_id, jenis_apel_id) => {
    try {
        const query = `
        INSERT INTO apel_${tingkat} (
            apel_${singkat[tingkat]}_date,
            ${tingkat}_id,
            pelapor_kadet_id,
            jenis_apel_id, 
            editable) 
        SELECT 
            now(),
            $1,
            $2,
            $3,
            $4
        WHERE not exists (select apel_${singkat[tingkat]}_date, jenis_apel_id from apel_${tingkat} ap where date_trunc('day',apel_${singkat[tingkat]}_date) = date_trunc('day', now()) and jenis_apel_id = $3 and ${tingkat}_id = $1) 
        returning apel_${singkat[tingkat]}_id AS lap_apel_id;`
        const hasil = await db.query(query, [yurisdiksi_id, pelapor_kadet_id, jenis_apel_id, 1]);
        if (!hasil.rows[0]) {
            return ({
                code: 500,
                message: 'Error Insert'
            })
        }
        return ({
            code: 200,
            lap_apel_id: hasil.rows[0].lap_apel_id
        })
    } catch (error) {
        return (error.message);
    }
}

const sakit = async (kadet_id, sakit, detail_sakit, foto_id) => {
    try {
        const query = `
        INSERT INTO sakit(
            kadet_id,
            sakit_nama,
            sakit_date,
            sakit_detail,
            foto_id
        ) VALUES (
            $1, $2, now(), $3, $4
        ) RETURNING sakit_id;`
        const hasil = await db.query(query, [kadet_id, sakit, detail_sakit, foto_id]);
        return ({
            code: 200,
            sakit_id: hasil.rows[0].sakit_id
        })
    } catch (error) {
        return (error.message);
    }
}

const izin = async (kadet_id, izin, detail_izin, foto_id) => {
    try {
        const query = `
        INSERT INTO izin(
            kadet_id,
            izin_nama,
            izin_date,
            izin_detail,
            foto_id
        ) VALUES (
            $1, $2, now(), $3, $4
        ) RETURNING izin_id;`
        const hasil = await db.query(query, [kadet_id, izin, detail_izin, foto_id]);
        return ({
            code: 200,
            izin_id: hasil.rows[0].izin_id
        })
    } catch (error) {
        return (error.message);
    }
}

const dataApel = async (keterangan_id, kadet_id, apel_ton_id, sakit_id, izin_id) => {
    try {
        const query = `
        INSERT INTO data_apel(
            keterangan_id,
            kadet_id,
            apel_ton_id,
            sakit_id,
            izin_id
        ) VALUES (
            $1, $2, $3, $4, $5
        );`
        const hasil = await db.query(query, [keterangan_id, kadet_id, apel_ton_id, sakit_id, izin_id])
        return ({
            code: 200,
            message: 'Berhasil'
        })
    } catch (error) {
        return (error.message);
    }
}

const forwardApel = async (tingkat, tingkat_subordinates, apel_tingkat_id, apel_subordinates_id) => {
    try {
        const query = `
        INSERT INTO ${singkat[tingkat_subordinates]}_${singkat[tingkat]}(
            apel_${singkat[tingkat_subordinates]}_id,
            apel_${singkat[tingkat]}_id
        ) VALUES (
            $1, $2
        );`
        const hasil = await db.query(query, [apel_subordinates_id, apel_tingkat_id])
        return ({
            code: 200,
            message: 'Berhasil'
        })
    } catch (error) {
        return (error);
    }
}

//================================================================================//
//============================== SELECT WITH PARAMS ==============================//
//================================================================================//

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
            const token = jwt.sign(data, process.env.SECRET /*, { expiresIn: '2h' }*/);

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

const cekKadet = async (akun_id) => {
    try {
        const query = `SELECT kadet_nim, kadet_id FROM kadet AS k LEFT JOIN akun AS a ON k.akun_id = a.akun_id WHERE a.akun_id=$1`
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
        const query = `
        SELECT 
            k.kadet_id, 
            k.kadet_nim, 
            k.kadet_nama, 
            k.jenis_kelamin,
            k.angkatan,
            ket.keterangan_nama, 
            p.pleton_id, 
            p.pleton_nama, 
            c.kompi_nama, 
            b.batalyon_nama, 
            f.foto_isi, 
            pa.pangkat_id, 
            pa.pangkat_nama, 
            s.status_nama,
            jm.jabatan_resimen_nama,
            jb.jabatan_batalyon_nama,
            jk.jabatan_kompi_nama,
            jp.jabatan_pleton_nama,
            dm.dd_resimen_nama,
            db.dd_batalyon_nama,
            dk.dd_kompi_nama,
            dp.dd_pleton_nama
        FROM 
            kadet AS k 
            LEFT JOIN keterangan AS ket ON k.keterangan_id = ket.keterangan_id 
            LEFT JOIN pleton AS p ON k.pleton_id = p.pleton_id 
            LEFT JOIN kompi AS c ON p.kompi_id = c.kompi_id 
            LEFT JOIN batalyon AS b ON c.batalyon_id = b.batalyon_id 
            LEFT JOIN foto AS f ON k.foto_id=f.foto_id 
            LEFT JOIN pangkat AS pa ON k.pangkat_id=pa.pangkat_id 
            LEFT JOIN akun AS a ON k.akun_id=a.akun_id
            LEFT JOIN status AS s ON a.status_id=s.status_id 
            LEFT JOIN jabatan_resimen AS jm ON k.kadet_id = jm.kadet_id 
            LEFT JOIN jabatan_batalyon AS jb ON k.kadet_id = jb.kadet_id 
            LEFT JOIN jabatan_kompi AS jk ON k.kadet_id = jk.kadet_id 
            LEFT JOIN jabatan_pleton AS jp ON k.kadet_id = jp.kadet_id 
            LEFT JOIN dd_resimen AS dm ON k.kadet_id = dm.kadet_id 
            LEFT JOIN dd_batalyon AS db ON k.kadet_id = db.kadet_id 
            LEFT JOIN dd_kompi AS dk ON k.kadet_id = dk.kadet_id 
            LEFT JOIN dd_pleton AS dp ON k.kadet_id = dp.kadet_id 
        WHERE k.kadet_nim=$1`
        const user = await db.query(query, [kadet_nim])
        return ({
            code: 200,
            message: user.rows[0]
        })
    } catch (error) {
        return (error.message);
    }
}

const cekJabatan = async (akun_id) => {
    try {
        for (let index = 0; index < tingkat.length; index++) {
            const query1 = `
            select 
                j.jabatan_${tingkat[index]}_nama as jabatan, 
                j.${tingkat[index]}_id as yurisdiksi_id,
                k.kadet_nama,
                k.kadet_id
            from
                jabatan_${tingkat[index]} j 
                inner join kadet k on j.kadet_id = k.kadet_id 
                inner join akun a on k.akun_id = a.akun_id
            where k.akun_id = $1`
            const hasil1 = await db.query(query1, [akun_id]);
            if (hasil1.rows[0]) {
                var subordinates1 = ''
                try {
                    const subquery1 = `SELECT ${subOrdinates[tingkat[index]]}_id AS subordinates_id, ${subOrdinates[tingkat[index]]}_nama AS subordinates_nama FROM ${subOrdinates[tingkat[index]]} WHERE ${tingkat[index]}_id = $1`
                    subordinates1 = await db.query(subquery1, [hasil1.rows[0].yurisdiksi_id])
                } catch (error) {
                    subordinates1 = {
                        rows: []
                    }
                }
                return ({
                    code: 200,
                    data: {
                        tingkat: tingkat[index],
                        kadet_id: hasil1.rows[0].kadet_id,
                        jabatan: hasil1.rows[0].jabatan,
                        yurisdiksi: hasil1.rows[0].yurisdiksi_id,
                        sub_ordinates: subordinates1.rows
                    }
                })
            }
            const query2 = `
            select 
                d.dd_${tingkat[index]}_nama as jabatan, 
                d.${tingkat[index]}_id as yurisdiksi_id,
                k.kadet_nama,
                k.kadet_id
            from
                dd_${tingkat[index]} d 
                inner join kadet k on d.kadet_id = k.kadet_id 
                inner join akun a on k.akun_id = a.akun_id 
            where k.akun_id = $1`
            const hasil2 = await db.query(query2, [akun_id]);
            if (hasil2.rows[0]) {
                var subordinates2 = ''
                try {
                    const subquery2 = `SELECT ${subOrdinates[tingkat[index]]}_id AS subordinates_id, ${subOrdinates[tingkat[index]]}_nama AS subordinates_nama FROM ${subOrdinates[tingkat[index]]} WHERE ${tingkat[index]}_id = $1`
                    subordinates2 = await db.query(subquery2, [hasil2.rows[0].yurisdiksi_id])
                } catch (error) {
                    subordinates2 = {
                        rows: []
                    }
                }
                return ({
                    code: 200,
                    data: {
                        tingkat: tingkat[index],
                        kadet_id: hasil2.rows[0].kadet_id,
                        jabatan: hasil2.rows[0].jabatan,
                        yurisdiksi: hasil2.rows[0].yurisdiksi_id,
                        sub_ordinates: subordinates2.rows
                    }
                })
            }
        }
    } catch (error) {
        return (error.message);
    }
}

const accessKadet = async (tingkat, yurisdiksi_id) => {
    try {
        const query = `
        select 
            k.kadet_id,
            k.kadet_nama,
            pleton.pleton_id,
            pleton.pleton_nama,
            kompi.kompi_nama,
            batalyon.batalyon_nama,
            1 as keterangan_id
        from kadet as k
            left join pleton on k.pleton_id = pleton.pleton_id 
            left join kompi on pleton.kompi_id = kompi.kompi_id 
            left join batalyon on kompi.batalyon_id = batalyon.batalyon_id  
            left join resimen on batalyon.resimen_id = resimen.resimen_id
        where ${tingkat}.${tingkat}_id = $1
        order by k.pleton_id, k.kadet_nim`
        const hasil = await db.query(query, [yurisdiksi_id]);
        return ({
            code: 200,
            hasil: hasil.rows
        })
    } catch (error) {
        return (error.message);
    }
}

const listLapApel = async (tingkat, yurisdiksi_id, add_query, add_query2) => {
    var a = 'a'
    if (tingkat != 'pleton') {
        a = 'tk'
    }
    var concat = {
        'pleton': `
            concat(ton.pleton_nama, ' ', ki.kompi_nama, ' ', yon.batalyon_nama)
    `,
        'kompi': `
            concat(ki.kompi_nama, ' ', yon.batalyon_nama)
    `,
        'batalyon': `
            concat(yon.batalyon_nama)
    `,
        'resimen': `
            concat(men.resimen_nama)
    `
    }

    try {
        const query = `
        SELECT 
            '${tingkat}' as tingkat,
            ${concat[tingkat]} as satuan,
            a.apel_${singkat[tingkat]}_id as apel_id,
            a.apel_${singkat[tingkat]}_date as apel_date,
            a.${tingkat}_id as satuan_id,
            k.kadet_nama,
            p.pangkat_singkat,
            j.jenis_apel_id,
            j.jenis_apel_nama,
            a.editable,
            sum(h.hadir) as hadir, 
            sum(s.sakit) as sakit, 
            sum(i.izin) as izin, 
            sum(t.tanpa_keterangan) as tanpa_keterangan
        FROM apel_${tingkat} as a
        LEFT JOIN kadet as k ON a.pelapor_kadet_id = k.kadet_id
        LEFT JOIN pangkat as p ON k.pangkat_id = p.pangkat_id
        LEFT JOIN jenis_apel as j ON a.jenis_apel_id = j.jenis_apel_id
        ${forward[tingkat]}
        left join (
            select
            apel_ton_id, count(keterangan_id) as hadir
            from data_apel da 
            where keterangan_id = 1
            group by apel_ton_id, keterangan_id 
            ) as h
        on ${a}.apel_ton_id = h.apel_ton_id
        left join (
            select
            apel_ton_id, count(keterangan_id) as sakit
            from data_apel da 
            where keterangan_id = 2
            group by apel_ton_id, keterangan_id 
            ) as s
        on ${a}.apel_ton_id = s.apel_ton_id
        left join (
            select
            apel_ton_id, count(keterangan_id) as izin
            from data_apel da 
            where keterangan_id = 3
            group by apel_ton_id, keterangan_id 
            ) as i
        on ${a}.apel_ton_id = i.apel_ton_id
        left join (
            select
            apel_ton_id, count(keterangan_id) as tanpa_keterangan
            from data_apel da 
            where keterangan_id = 4
            group by apel_ton_id, keterangan_id 
            ) as t
        on ${a}.apel_ton_id = t.apel_ton_id
        ${add_query2}
        ${add_query}
        GROUP BY a.apel_${singkat[tingkat]}_id, k.kadet_nama, p.pangkat_singkat, j.jenis_apel_id, ${concat[tingkat]}
        ORDER BY a.apel_${singkat[tingkat]}_date DESC
        `
        const hasil = await db.query(query, [yurisdiksi_id])
        return ({
            code: 200,
            lap_apel: hasil.rows
        })
    } catch (error) {
        return (error.message);
    }
}

const getDataApel = async (apel_ton_id) => {
    try {
        const query = `
            SELECT 
                da.data_apel_id,
                da.keterangan_id,
                da.kadet_id,
                k.kadet_nama,
                concat(ton.pleton_nama, ' ', ki.kompi_nama, ' ', yon.batalyon_nama) as satuan,
                ket.keterangan_nama,
                p.pangkat_singkat,
                da.sakit_id,
                da.izin_id
            FROM data_apel da
            LEFT JOIN apel_pleton a ON da.apel_ton_id = a.apel_ton_id
            LEFT JOIN pleton ton ON a.pleton_id = ton.pleton_id
            LEFT JOIN kompi ki ON ton.kompi_id = ki.kompi_id
            LEFT JOIN batalyon yon ON ki.batalyon_id = yon.batalyon_id
            LEFT JOIN kadet k ON da.kadet_id = k.kadet_id
            LEFT JOIN keterangan ket ON da.keterangan_id = ket.keterangan_id
            LEFT JOIN pangkat p ON k.pangkat_id = p.pangkat_id
            WHERE da.apel_ton_id = $1
            ORDER BY k.kadet_nim
        `
        const hasil = await db.query(query, [apel_ton_id])
        return ({
            code: 200,
            message: hasil.rows
        })
    } catch (error) {
        return (error);
    }
}

const getSakit = async (sakit_id) => {
    try {
        const query = `
            SELECT 
                s.sakit_nama,
                s.sakit_detail,
                f.foto_isi,
                f.foto_id
            FROM sakit s
            LEFT JOIN foto f ON s.foto_id = f.foto_id
            WHERE s.sakit_id = $1
        `
        const hasil = await db.query(query, [sakit_id])
        return ({
            code: 200,
            message: hasil.rows[0]
        })
    } catch (error) {
        return (error);
    }
}

const getIzin = async (izin_id) => {
    try {
        const query = `
            SELECT 
                i.izin_nama,
                i.izin_detail,
                f.foto_isi,
                f.foto_id
            FROM izin i
            LEFT JOIN foto f ON i.foto_id = f.foto_id
            WHERE i.izin_id = $1
        `
        const hasil = await db.query(query, [izin_id])
        return ({
            code: 200,
            message: hasil.rows[0]
        })
    } catch (error) {
        return (error);
    }
}

const lapGiat = async (nama, detail, tanggal, foto_id, pelapor_id) => {
    try {
        const query = `
        INSERT INTO lap_giat(
            giat_date, 
            lap_giat_date, 
            giat_nama,
            giat_detail,
            pelapor_kadet_id,
            approve,
            foto_id
        ) VALUES (
            $1, now(), $2, $3, $4, $5, $6
        ) RETURNING giat_id;`
        const hasil = await db.query(query, [tanggal, nama, detail, pelapor_id, 0, foto_id]);
        if (!hasil.rows[0]) {
            return ({
                code: 500,
                message: 'Error Insert'
            })
        }
        return ({
            code: 200,
            giat_id: hasil.rows[0].giat_id
        })
    } catch (error) {
        return (error.message);
    }
}

const getLapGiat = async (param, param_id) => {
    try {
        const query = `
            SELECT 
                l.giat_id,
                l.giat_nama,
                l.giat_detail,
                l.giat_date,
                l.lap_giat_date,
                l.approve,
                f.foto_isi,
                k.kadet_nama as pelapor_nama,
                k2.kadet_nama as approver_nama
            FROM lap_giat l
            LEFT JOIN foto f ON l.foto_id = f.foto_id
            LEFT JOIN kadet k ON l.pelapor_kadet_id = k.kadet_id
            LEFT JOIN kadet k2 ON l.approver_kadet_id = k2.kadet_id
            WHERE l.${param} = $1
        `
        const hasil = await db.query(query, [param_id])
        return ({
            code: 200,
            message: hasil.rows
        })
    } catch (error) {
        return (error);
    }
}

const dataGiat = async (giat_id, kadet_id) => {
    try {
        const query = `
        INSERT INTO data_giat(
            kadet_id,
            giat_id
        ) VALUES (
            $1, $2
        ) RETURNING data_giat_id;`
        const hasil = await db.query(query, [kadet_id, giat_id]);
        if (!hasil.rows[0]) {
            return ({
                code: 500,
                message: 'Error Insert'
            })
        }
        return ({
            code: 200,
            data_giat_id: hasil.rows[0].data_giat_id
        })
    } catch (error) {
        return (error.message);
    }
}

const getDataGiat = async (giat_id) => {
    try {
        const query = `
            SELECT 
                k.kadet_nama
            FROM data_giat d
            LEFT JOIN kadet k ON d.kadet_id = k.kadet_id
            WHERE d.giat_id = $1
        `
        const hasil = await db.query(query, [giat_id])
        return ({
            code: 200,
            message: hasil.rows
        })
    } catch (error) {
        return (error);
    }
}


//====================================================================//
//============================== UPDATE ==============================//
//====================================================================//

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
        const query = `UPDATE jabatan_${tingkat} SET kadet_id = $1 WHERE jabatan_${tingkat}_id = $2 RETURNING jabatan_${tingkat}_id AS jabatan_id`
        const hasil = await db.query(query, [kadet_id, jabatan_id]);
        const query2 = `INSERT INTO log_jab_${singkat[tingkat]}(log_jab_${singkat[tingkat]}_date, jabatan_${tingkat}_id, kadet_id) VALUES(now(), $1, $2) RETURNING log_jab_${singkat[tingkat]}_id`
        const hasil2 = await db.query(query2, [hasil.rows[0].jabatan_id, kadet_id]);
        return ({
            code: 200,
            message: hasil2
        })
    } catch (error) {
        return (error.message);
    }
}

const assignDinas = async (tingkat, dinas_id, kadet_id) => {
    try {
        const query = `UPDATE dd_${tingkat} SET kadet_id = $1 WHERE dd_${tingkat}_id = $2 RETURNING dd_${tingkat}_id AS dinas_id`
        const hasil = await db.query(query, [kadet_id, dinas_id]);
        const query2 = `INSERT INTO log_dd_${singkat[tingkat]}(log_dd_${singkat[tingkat]}_date, dd_${tingkat}_id, kadet_id) VALUES(now(), $1, $2) RETURNING log_dd_${singkat[tingkat]}_id`
        const hasil2 = await db.query(query2, [hasil.rows[0].dinas_id, kadet_id]);
        return ({
            code: 200,
            message: hasil2
        })
    } catch (error) {
        return (error.message);
    }
}

const editKadet = async (kadet_nim, kadet_nama, pleton_id, pangkat_id, akun_id, jenis_kelamin, angkatan) => {
    try {
        const query = `UPDATE kadet SET kadet_nim = $1, kadet_nama=$2, pleton_id=$3, pangkat_id=$4, jenis_kelamin=$5, angkatan=$6 WHERE akun_id = $7 RETURNING foto_id`
        const hasil = await db.query(query, [kadet_nim, kadet_nama, pleton_id, pangkat_id, jenis_kelamin, angkatan, akun_id]);
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
            message: `update foto ${foto_id} success`
        })
    } catch (error) {
        return (error.message);
    }
}

const editSakitIzin = async (sakitIzin, nama, detail, id) => {
    try {
        const query = `UPDATE ${sakitIzin} SET ${sakitIzin}_nama = $1, ${sakitIzin}_detail = $2  WHERE ${sakitIzin}_id = $3`
        const hasil = await db.query(query, [nama, detail, id]);
        return ({
            code: 200,
            message: `update ${sakitIzin} ${id} success`
        })
    } catch (error) {
        return (error.message);
    }
}

const editDataApel = async (data_apel_id, keterangan_id, sakit_id, izin_id) => {
    try {
        const query = `UPDATE data_apel SET keterangan_id = $1, sakit_id = $2, izin_id = $3 WHERE data_apel_id = $4`
        const hasil = await db.query(query, [keterangan_id, sakit_id, izin_id, data_apel_id]);
        return ({
            code: 200,
            message: `update data apel ${data_apel_id} success`
        })
    } catch (error) {
        return (error.message);
    }
}

//====================================================================//
//============================== DELETE ==============================//
//====================================================================//

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

const deleteEntry = async (entry, entry_id) => {
    try {
        const query = `DELETE FROM ${entry} WHERE ${entry}_id=$1`
        const hasil = await db.query(query, [entry_id])
        return ({
            code: 400,
            message: `${entry} ${entry_id} deleted`
        })
    } catch (error) {
        return (error.message);
    }
}

module.exports = {
    //select no params
    accounts,
    atribut,
    kadets,
    dds,
    jabatans,
    //insert
    register,
    foto,
    tambahKadet,
    tambahDD,
    tambahJabatan,
    forwardApel,
    sakit,
    izin,
    dataApel,
    lapGiat,
    dataGiat,
    lapApel,
    //select with params
    kadet,
    logKeterangan,
    cekKadet,
    login,
    cekJabatan,
    accessKadet,
    listLapApel,
    getDataApel,
    getSakit,
    getIzin,
    getLapGiat,
    getDataGiat,
    //update
    changePassword,
    assignJabatan,
    assignDinas,
    editKadet,
    editFoto,
    editSakitIzin,
    editDataApel,
    //delete
    rollbackTambahKadet,
    deleteEntry
}