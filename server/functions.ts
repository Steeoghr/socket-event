
import {Server} from "socket.io";
// @ts-ignore
import express from "express";
import http from "http";
import { SocketServer } from "../server";
import path from "path";
import fs from "fs";

export function createServer() {
    const app = express();

    // Configura EJS come motore di template
    app.set('view engine', 'ejs');

    // Specifica la cartella contenente i file HTML
    app.set('views', path.join(__dirname, 'views'));

    const server = http.createServer(app);
    const io = new Server(server);
    app.get("/", (req: any, res: any) => {
        const templatePath = path.join(__dirname, '..', '..', 'views', 'index.html');

        // Verifica se il file del template esiste
        if (fs.existsSync(templatePath)) {
            // Passa dati al tuo template, se necessario
            res.render('index');
        } else {
            // Se il file non esiste, restituisci un messaggio personalizzato
            res.send('Server running...');
        }
    })
    return new SocketServer(io, server, app);
}