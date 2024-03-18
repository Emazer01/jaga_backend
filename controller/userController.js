const express = require('express')
const jwt = require('jsonwebtoken');
const { Services } = require('../services');

const subOrdinates = {
    'resimen': 'batalyon',
    'batalyon': 'kompi',
    'kompi': 'pleton',
    'pleton': ''
}

const singkat = {
    'resimen': 'men',
    'batalyon': 'yon',
    'kompi': 'ki',
    'pleton': 'ton'
}

const sambung = {
    'resimen': 'ym',
    'batalyon': 'ky',
    'kompi': 'tk'
}

const login = async (req, res, next) => {
    const { username, password } = req.body
    try {
        var result = await Services.login(username, password)
        res.status(result.code).send(result.message)
    } catch (error) {
        res.status(500).send("Gangguan server");
    }
}

const verify = async (req, res, next) => {
    try {
        const decode = req.user
        res.status(200).json(decode)
    } catch (err) {
        console.log(err.message);
        return res.status(500).send(err)
    }
}

const accounts = async (req, res, next) => {
    try {
        var result = await Services.accounts()
        res.status(result.code).send(result.message)
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const kadets = async (req, res, next) => {
    try {
        var result = await Services.kadets()
        res.status(result.code).send(result.message)
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const kadet = async (req, res, next) => {
    try {
        var result = await Services.kadet(req.query.nim)
        res.status(result.code).send(result.message)
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const jabatans = async (req, res, next) => {
    try {
        var result = await Services.jabatans()
        res.status(result.code).send(result.hasil)
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const dds = async (req, res, next) => {
    try {
        var result = await Services.dds()
        res.status(result.code).send(result.hasil)
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const myKadet = async (req, res, next) => {
    try {
        var cek = await Services.cekKadet(req.user.id)
        if (cek.code != 200) {
            res.status(cek.code).send(cek.message)
        }
        var result = await Services.kadet(cek.message.kadet_nim)
        res.status(result.code).send(result.message)
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const atribut = async (req, res, next) => {
    try {
        var result = await Services.atribut()
        res.status(result.code).send(result.message)
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const changePassword = async = async (req, res, next) => {
    try {
        const login = await Services.login(req.user.username, req.body.oldPassword)
        if (login.code != 200) {
            res.status(login.code).send(login.message)
        }
        var result = await Services.changePassword(req.user.id, req.body.newPassword)
        res.status(result.code).send(result.message)
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const assignJabatan = async = async (req, res, next) => {
    try {
        var result = await Services.assignJabatan(req.body.tingkat, req.body.jabatan_id, req.body.kadet_id)
        res.status(result.code).send(result.message)
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const assignDinas = async = async (req, res, next) => {
    try {
        var result = await Services.assignDinas(req.body.tingkat, req.body.dinas_id, req.body.kadet_id)
        res.status(result.code).send(result.message)
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const tambahKadet = async (req, res, next) => {
    try {
        console.log("sampai controller")
        var akun = await Services.register(req.body.username, req.body.password, req.body.role)
        console.log(akun)
        var foto = await Services.foto(req.body.fotoUrl)
        console.log(foto)
        var result = await Services.tambahKadet(req.body.nim, req.body.nama, 1, req.body.pleton, foto.foto_id, req.body.pangkat, akun.akun_id, req.body.jk, req.body.angkatan)
        if (result.code != 200) {
            var rollback = await Services.rollbackTambahKadet(foto.foto_id, akun.akun_id)
            res.status(rollback.code).send(rollback.message)
        } else {
            res.status(result.code).send(result.message)
        }
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const editKadet = async = async (req, res, next) => {
    try {
        const editKadet = await Services.editKadet(req.body.nim, req.body.nama, req.body.pleton, req.body.pangkat, req.user.id, req.body.jk, req.body.angkatan)
        if (editKadet.code == 200) {
            const foto = await Services.editFoto(editKadet.foto_id, req.body.fotoUrl)
            res.status(foto.code).send(foto.message)
        } else {
            res.status(editKadet.code).send('Gangguan server')
        }
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const tambahAkun = async (req, res, next) => {
    try {
        var akun = await Services.register(req.body.username, req.body.password, req.body.role)
        res.status(akun.code).send('Berhasil tambah akun')
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const tambahJabatan = async (req, res, next) => {
    try {
        var jabatan = await Services.tambahJabatan(req.body.jenis_jabatan, req.body.tingkat, req.body.yurisdiksi, req.body.nama_jabatan)
        res.status(jabatan.code).send('Berhasil tambah jabatan')
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const tambahDD = async (req, res, next) => {
    try {
        var dd = await Services.tambahDD(req.body.jenis_jabatan, req.body.tingkat, req.body.yurisdiksi, req.body.nama_dd, req.body.jk)
        res.status(dd.code).send('Berhasil tambah dinas dalam')
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const wewenang = async (req, res, next) => {
    try {
        var wewenang = await Services.cekJabatan(req.user.id)
        if (wewenang) {
            if (wewenang.data.tingkat != 'pleton') {
                res.status(wewenang.code).send({
                    jabatan: {
                        tingkat: wewenang.data.tingkat,
                        jabatan_nama: wewenang.data.jabatan
                    },
                    pleton_id: 0,
                    pleton_nama: "",
                    kadets: []
                })
            } else {
                var kadets = await Services.accessKadet(wewenang.data.tingkat, wewenang.data.yurisdiksi)
                var listKadet = []
                for (let index = 0; index < kadets.hasil.length; index++) {
                    listKadet.push({
                        kadet_id: kadets.hasil[index].kadet_id,
                        kadet_nama: kadets.hasil[index].kadet_nama
                    })
                }
                res.status(kadets.code).send({
                    jabatan: {
                        tingkat: wewenang.data.tingkat,
                        jabatan_nama: wewenang.data.jabatan
                    },
                    pleton_id: kadets.hasil[0].pleton_id,
                    pleton_nama: `${kadets.hasil[0].pleton_nama} ${kadets.hasil[0].kompi_nama} ${kadets.hasil[0].batalyon_nama}`,
                    kadets: listKadet
                })
            }
        } else {
            res.status(404).send("Tidak Punya Wewenang")
        }

    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const dataApel = async (req, res, next) => {
    try {
        var wewenang = await Services.cekJabatan(req.user.id)
        if (wewenang) {
            if (wewenang.data.tingkat != 'pleton') {
                res.status(404).send("Tidak Punya Wewenang")
            } else if (wewenang.data.yurisdiksi == req.body.pleton_id) {
                var apel = await Services.lapApel('pleton', wewenang.data.yurisdiksi, wewenang.data.kadet_id, req.body.jenis_apel)
                if (apel.lap_apel_id) {
                    for (let index = 0; index < req.body.data.length; index++) {
                        var sakit_id = null
                        var izin_id = null
                        if (req.body.data[index].keterangan_id == 2) {
                            var foto = await Services.foto(req.body.data[index].foto_sakit)
                            sakit_id = (await Services.sakit(req.body.data[index].kadet_id, req.body.data[index].sakit, req.body.data[index].detail_sakit, foto.foto_id)).sakit_id
                            console.log('sakit_id = ', sakit_id)
                        } else if (req.body.data[index].keterangan_id == 3) {
                            var foto = await Services.foto(req.body.data[index].foto_izin)
                            izin_id = (await Services.izin(req.body.data[index].kadet_id, req.body.data[index].izin, req.body.data[index].detail_izin, foto.foto_id)).izin_id
                        }
                        var dataApel = await Services.dataApel(req.body.data[index].keterangan_id, req.body.data[index].kadet_id, apel.lap_apel_id, sakit_id, izin_id)
                    }
                    res.status(200).send('berhasil')
                } else {
                    res.status(500).send("Gangguan server")
                }
                //res.status(apel.code).send('Berhasil tambah apel')
            }
        } else {
            res.status(404).send("Tidak Punya Wewenang")
        }
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const listLapApel = async (req, res, next) => {
    try {
        var wewenang = await Services.cekJabatan(req.user.id)
        if (wewenang) {
            console.log(wewenang.data.tingkat, wewenang.data.yurisdiksi, '', `WHERE a.${wewenang.data.tingkat}_id = $1`)
            var result = await Services.listLapApel(wewenang.data.tingkat, wewenang.data.yurisdiksi, '', `WHERE a.${wewenang.data.tingkat}_id = $1`)
            var listSub = []
            for (let index = 0; index < wewenang.data.sub_ordinates.length; index++) {
                var subResult = await Services.listLapApel(subOrdinates[wewenang.data.tingkat], wewenang.data.sub_ordinates[index].subordinates_id, `AND date_trunc('day',a.apel_${singkat[subOrdinates[wewenang.data.tingkat]]}_date) = date_trunc('day', now())`, `WHERE a.${subOrdinates[wewenang.data.tingkat]}_id = $1`)
                listSub.push({
                    subordinates_id: wewenang.data.sub_ordinates[index].subordinates_id,
                    subordinates_nama: wewenang.data.sub_ordinates[index].subordinates_nama,
                    lap_apel: subResult.lap_apel
                })
            }
            res.status(result.code).send({
                lap_apel: result.lap_apel,
                subordinates: listSub
            })
        } else {
            res.status(404).send("Tidak Punya Wewenang")
        }
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const lapApel = async (req, res, next) => {
    try {
        var wewenang = await Services.cekJabatan(req.user.id)
        if (wewenang && req.body.subordinates_lap_id[0] != null) {
            console.log(wewenang)
            var apel = await Services.lapApel(wewenang.data.tingkat, wewenang.data.yurisdiksi, wewenang.data.kadet_id, req.body.jenis_apel)
            if (apel.lap_apel_id) {
                for (let index = 0; index < req.body.subordinates_lap_id.length; index++) {
                    var forward = await Services.forwardApel(wewenang.data.tingkat, subOrdinates[wewenang.data.tingkat], apel.lap_apel_id, req.body.subordinates_lap_id[index])
                }
                res.status(200).send('berhasil')
            } else {
                res.status(500).send("Gangguan server")
            }
        } else {
            res.status(404).send("Tidak Punya Wewenang")
        }
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const apel = async (req, res, next) => {
    try {
        console.log(req.query.tingkat, req.query.id)
        var apel_ton_id = []
        var list_data_apel = []
        var result = await Services.listLapApel(req.query.tingkat, req.query.id, '', `WHERE a.apel_${singkat[req.query.tingkat]}_id = $1`)
        console.log(result)
        if (req.query.tingkat != 'pleton') {
            console.log(subOrdinates[req.query.tingkat], req.query.id, '', `WHERE ${sambung[req.query.tingkat]}.apel_${singkat[req.query.tingkat]}_id = $1`)
            var sub = await Services.listLapApel('pleton', req.query.id, '', `WHERE ${sambung[req.query.tingkat]}.apel_${singkat[req.query.tingkat]}_id = $1`)
            for (let index = 0; index < sub.lap_apel.length; index++) {
                apel_ton_id.push(sub.lap_apel[index].apel_id)
            }
        } else if (req.query.tingkat == 'pleton') {
            apel_ton_id.push(result.lap_apel[0].apel_id)
        }
        console.log('apel ton', apel_ton_id)
        for (let index = 0; index < apel_ton_id.length; index++) {
            var data_apel = await Services.getDataApel(apel_ton_id[index])
            for (let index = 0; index < data_apel.message.length; index++) {
                if (data_apel.message[index].keterangan_nama == 'Sakit') {
                    var sakit = await Services.getSakit(data_apel.message[index].sakit_id)
                    data_apel.message[index].sakit = sakit.message
                    console.log('sakit', sakit)
                } else if (data_apel.message[index].keterangan_nama == 'Izin') {
                    var izin = await Services.getIzin(data_apel.message[index].izin_id)
                    data_apel.message[index].izin = izin.message
                    console.log('izin', izin)
                }
                list_data_apel.push(data_apel.message[index])
            }
        }
        console.log(list_data_apel)
        return res.status(200).send({
            lapApel : result,
            dataApel : list_data_apel
        })
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

module.exports = {
    login,
    verify,
    accounts,
    atribut,
    tambahKadet,
    tambahAkun,
    kadets,
    kadet,
    changePassword,
    myKadet,
    editKadet,
    tambahJabatan,
    jabatans,
    assignJabatan,
    tambahDD,
    dds,
    assignDinas,
    wewenang,
    dataApel,
    listLapApel,
    lapApel,
    apel
}