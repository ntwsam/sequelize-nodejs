const userModel = require('../model/user.model')
const bcrypt = require('bcryptjs')
const Sequelize = require('sequelize')
const { generateToken, verifyRefreshToken } = require('../service/jwt')
const redisClient = require('../config/redis')
const { or } = Sequelize.Op
const cookie = require('cookie')

// ⭐️ register
const register = async (req, res) => {

    try {
        const { username, email, password, role } = req.body
        if (!username || !email || !password || !role) return res.status(400).json({ message: "Username, email, password and role are required" })

        const existingUser = await userModel.findOne({ where: { username } })
        if (existingUser) return res.status(400).json({ message: "Username is already exists" })

        const existingEmail = await userModel.findOne({ where: { email } })
        if (existingEmail) return res.status(400).json({ message: "Email is already exists" })

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await userModel.create({
            username,
            email,
            password: hashedPassword,
            role,
        })
        res.status(201).json({
            message: "Register new user successfully!",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            }
        })
    } catch (err) {
        res.status(500).json({ message: "Error to register new user:", err })
    }
}

// ⭐️ login
const login = async (req, res) => {
    try {
        const { usernameOrEmail, password } = req.body
        if (!usernameOrEmail || !password) return res.status(400).json({ message: "username or email and password are required" })

        const user = await userModel.findOne({
            where: {
                [or]: [
                    { username: usernameOrEmail },
                    { email: usernameOrEmail },
                ]
            }
        }
        )
        if (!user) return res.status(404).json({ message: "Invalid user or email" })

        const checkPassword = await bcrypt.compare(password, user.password)
        if (!checkPassword) return res.staus(400).json({ message: "Invalid password" })

        const token = await generateToken(user)
        if (!token) return res.status(400).json({ message: "Failed to generate token" })

        const accessToken = token.accessToken
        const refreshToken = token.refreshToken

        res.setHeader('Authorization', `Bearer ${accessToken}`) // ⭐️ set accesstoken to Authorization header
        res.cookie('refreshToken', refreshToken, { // ⭐️ add refreshtoken in cookie
            httpOnly: true,
            secure: false,
            maxAge: 604800000,
        })
        await redisClient.set(`userID:${user.id}`, refreshToken, { EX: 604800 }) // ⭐️ add refreshtoken with ttl 7 days

        res.status(200).json({
            message: "Login Successfully!",
            user: user.username,
            refreshToken: refreshToken,
        })
    } catch (err) {
        res.status(500).json({ message: "Error to login:", err })
    }
}

// ⭐️ logout
const logout = async (req, res) => {
    try {
        const userID = req.user.id
        const token = req.token
        if (!userID || !token) return res.status(401).json({ where: "User is not logged in" })

        const existingUser = await userModel.findOne({ where: { id: userID } })
        if (!existingUser) return res.status(404).json({ message: "User is not found" })

        await redisClient.del(`userID:${userID}`) // ⭐️ remove refreshtoken in redis
        await redisClient.set(token, 'blacklisted', { EX: 900 }) // ⭐️ add accesstoken to blacklist with ttl 15 mins
        res.removeHeader('Authorization') // ⭐️ remove Authorization header
        res.clearCookie('refreshToken', { // ⭐️ remove refreshtoken in cookie
            httpOnly: true,
            secure: false,
        })

        res.status(200).json({ message: "Logout Successfully!" })
    } catch (err) {
        res.status(500).json({ message: "Error to logout:", err })
    }
}

// ⭐️ refresh
const refresh = async (req, res) => {
    try {
        const userID = req.user.id
        const accessToken = req.token

        const cookies = cookie.parse(req.headers.cookie)
        const refreshToken = cookies.refreshToken
        const redisRefreshToken = await redisClient.get(`userID:${userID}`)

        if (!userID || !refreshToken || !redisRefreshToken) return res.status(401).json({ message: "User is not logged in" })

        if (refreshToken !== redisRefreshToken) return res.status(400).json({ message: "Refresh token not match" })

        const decoded = await verifyRefreshToken(refreshToken)
        if (!decoded) return res.status(400).json({ message: "Invalid refresh token" })

        const token = await generateToken(decoded)
        const newAccessToken = token.accessToken
        const newRefreshToken = token.refreshToken

        await redisClient.set(accessToken, 'blacklisted', { EX: 900 }) // ⭐️ add old accesstoken to blacklist
        res.setHeader('Authorization', `Bearer ${newAccessToken}`) // ⭐️ update Authorization header
        await redisClient.set(`userID:${userID}`, newRefreshToken, { EX: 604800 }) // ⭐️ update refreshtoken in redis
        res.cookie('refreshToken', newRefreshToken, { // ⭐️ update refreshtoken in cookie
            httpOnly: true,
            secure: false,
            maxAge: 604800000,
        })

        res.status(200).json({
            message: "Refresh token is successfully!",
            refreshToken: newRefreshToken,
        })
    } catch (err) {
        res.status(500).json({ message: "Error to refresh token:", err })
    }
}

// ⭐️ protect
const protect = async (req, res) => {
    try {
        const userID = req.user.id
        if (!userID) return res.status(401).json({ message: "User is not logged in" })

        const user = await userModel.findOne({ where: { id: userID } })
        if (!user) return res.status(404).json({ message: "User is not found" })

        res.status(200).json({
            message: "Protect route accessed",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        })
    } catch (err) {
        res.status(500).json({ message: "Error in the protect route:" })
    }
}

// ⭐️ admin
const admin = async (req, res) => {
    try {
        const userID = req.user.id
        if (!userID) return res.status(401).json({ message: "User is not logged in" })

        const user = await userModel.findOne({ where: { id: userID } })
        if (!user) return res.status(404).json({ message: "User is not found" })

        res.status(200).json({
            message: "Admin route accessed",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        })
    } catch (err) {
        res.status(500).json({ message: "Error in the admin route:" })
    }
}

module.exports = { register, login, logout, refresh, protect, admin }