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
        // 13. membuat verify
        const decode = req.user
        //const user = await Services.verify(decode.id,)
        //console.log(user)
        res.status(200).json(decode)
    } catch (err) {
        console.log(err.message);
        return res.status(500).send(err)
    }
}
 
module.exports = {
    login,
    verify,
}