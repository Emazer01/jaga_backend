const express = require('express')
const jwt = require('jsonwebtoken');
const { Services } = require('../services');

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

const tambahKadet = async (req, res, next) => {
    try {
        console.log("sampai controller")
        var akun = await Services.register(req.body.username, req.body.password, req.body.role)
        var foto = await Services.foto(req.body.fotoUrl)
        var result = await Services.tambahKadet(req.body.nim, req.body.nama, 1, req.body.pleton, foto.foto_id, req.body.pangkat, 2, akun.akun_id, req.body.jk)
        if (result.code != 200) {
            var rollback = await Services.rollbackTambahKadet(foto.foto_id, akun.akun_id)
            res.status(rollback.code).send(rollback.message)
        } else {
            var log = await Services.logKeterangan(1,result.kadet_id)
            res.status(log.code).send(log.message)
        }
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}

const editKadet = async = async (req, res, next) => {
    try {
        const editKadet = await Services.editKadet(req.body.nim, req.body.nama, req.body.pleton, req.body.pangkat, req.user.id, req.body.jk)
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
/*
const tambahKadet = async (req, res, next) => {
    try {
        console.log(req)
        res.status(200).send("ok")
    } catch (error) {
        return res.status(500).send("Gangguan server")
    }
}*/
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
    assignJabatan
}