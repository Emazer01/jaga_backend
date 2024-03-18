const express = require('express')
const router = express.Router()
const { userController } = require('../controller')
const Auth = require('../middleware/auth')
const { Validation } = require('../validators')

router.post('/login', userController.login)

router.get('/verify', Auth.verifyToken, userController.verify)

router.get('/atribut', Auth.verifyToken, userController.atribut)

router.get('/kadets', Auth.verifyToken, userController.kadets)

router.get('/kadet', Auth.verifyToken, userController.kadet)

router.get('/mykadet', Auth.verifyToken, userController.myKadet)

router.get('/accounts', Auth.verifyToken, Auth.verifyAdmin, userController.accounts)

router.post('/tambahKadet', Auth.verifyToken, Auth.verifyAdmin, Validation.register, userController.tambahKadet)

router.post('/tambahAkun', Auth.verifyToken, Auth.verifyAdmin, Validation.register, userController.tambahAkun)

router.post('/tambahJabatan', Auth.verifyToken, Auth.verifyAdmin, userController.tambahJabatan)

router.post('/tambahDD', Auth.verifyToken, Auth.verifyAdmin, userController.tambahDD)

router.put('/changePassword', Auth.verifyToken, userController.changePassword)

router.put('/editKadet', Auth.verifyToken, userController.editKadet)

router.get('/jabatans', Auth.verifyToken, userController.jabatans)

router.get('/dds', Auth.verifyToken, userController.dds)

router.put('/assignJabatan', Auth.verifyToken, Auth.verifyAdmin, userController.assignJabatan)

router.put('/assignDinas', Auth.verifyToken, Auth.verifyAdmin, userController.assignDinas)

router.get('/wewenang', Auth.verifyToken, userController.wewenang)

router.post('/dataApel', Auth.verifyToken, userController.dataApel)

router.get('/listLapApel', Auth.verifyToken, userController.listLapApel)

router.post('/lapApel', Auth.verifyToken, userController.lapApel)

router.get('/apel', Auth.verifyToken, userController.apel)

module.exports = router