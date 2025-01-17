import e from "express";
import authRouter from './auth/authRoutes.js'
import proceduresRouter from './Routes/proceduresRoutes.js'
import requestsRouter from './Routes/requestsRoutes.js'
import usersRouter from './Routes/usersRoutes.js'
import session from "express-session";
import cors from 'cors'
import cookieParser from "cookie-parser";
import 'dotenv/config'
import logger from "./config/winstonConfig.js";
import initializeDB from "./config/db/init.js";
import { verifyToken } from "./auth/authMIddleware.js";
import { fileURLToPath } from 'node:url'
import path from 'path'

const port = 10000
const app = e()

// Obtener directorio actual
const __filename = fileURLToPath(import.meta.url)
export const __dirname = path.dirname(__filename)

// Configuración para servir archivos estáticos
app.use('/uploads', e.static(path.join(__dirname, 'uploads')));

// Inicializar base de datos
await initializeDB()

// Middleware para registrar solicitudes HTTP
app.use((req, res, next) => {
    const { method, url } = req;
    let message
    message = `${method} ${url}`;
    logger.info(`Solicitud HTTP: ${message}`);
    next();
});

app.use(e.json())
app.use(cookieParser())

app.use(cors({ // Modificar origenes permitidos en producción
    origin: [
        'https://municipio-virtual.onrender.com',
        'https://municipio-virtual-chonchi.onrender.com',
        'http://localhost:10000',
        'http://localhost:5173',
        'http://localhost:5174',
        'https://accounts.claveunica.gob.cl/'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS']
}))

// Configuración del middleware de sesión
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Cambiar a true en producción
        httpOnly: true
    }
}));

app.use('/', authRouter)
app.use("/procedures", verifyToken, proceduresRouter)
app.use("/requests", requestsRouter)
app.use("/users", usersRouter)

app.listen(port, () => {
    console.log("Servidor levantado...")
})