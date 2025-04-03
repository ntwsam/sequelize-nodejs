const jwt = require('jsonwebtoken')

require('dotenv').config()

const access = process.env.JWT_SECRET
const refresh = process.env.REFRESH_JWT_SECRET

function generateAccessToken(user) {
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, access, { expiresIn: "15m" })
    return token
}

function generateRefreshToken(user) {
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, refresh, { expiresIn: "7d" })
    return token
}

function generateToken(user) {
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)
    return { accessToken, refreshToken }
}

function verifyAccessToken(token) {
    try {
        const decoded = jwt.verify(token, access)
        return decoded
    } catch (err) {
        return null
    }
}

function verifyRefreshToken(token) {
    try {
        const decoded = jwt.verify(token, refresh)
        return decoded
    } catch (err) {
        return null
    }
}

module.exports = { generateToken, verifyAccessToken, verifyRefreshToken }