import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../schema/user'


// server
export const server = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    res.send("server is running on port 3000 - auth service")
}

// signup user
export const userSignup = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { name, email, password } = req.body

        const isUser = await User.findOne({ email, isAdmin: false })
        if (isUser) return res.status(409).json({ msg: 'This email already exist' })

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({ name, email, password: hashedPassword })
        await newUser.save()

        return res.status(200).json({ msg: "Successfully created an account" })

    } catch (err) {
        next(err)
    }
}

// login user
export const userLogin = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { email, password } = req.body

        const isUser = await User.findOne({ email })
        if (!isUser) return res.status(401).json({ msg: "Incorrect email address" })

        const isPasswordValid = await bcrypt.compare(password, isUser.password)
        if (!isPasswordValid) return res.status(401).json({ msg: "Incorrect password" })

        const payload = { userId: isUser._id }
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '7d' })
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '1m' })

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/'
        });

        return res.status(200).json({ msg: 'Successfully logged In', accessToken })

    } catch (err) {
        next(err)
    }
}

// user logout
export const userLogout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        res.setHeader('Cache-Control', 'no-store');
        res.clearCookie('refreshToken', {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/',
        });
        res.sendStatus(200)
    } catch (err) {
        next(err)
    }
}


// admin login
export const adminLogin = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { email, password } = req.body

        const isUser = await User.findOne({ email, isAdmin: true })
        if (!isUser) return res.status(401).json({ msg: "Incorrect email address" })

        const isPasswordValid = await bcrypt.compare(password, isUser.password)
        if (!isPasswordValid) return res.status(401).json({ msg: "Incorrect password" })

        const payload = { userId: isUser._id }
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '7d' })
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '1m' })

        res.cookie('AdminRefreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/'
        });

        return res.status(200).json({ msg: 'Successfully logged In', accessToken })

    } catch (err) {
        console.log(err)
    }
}