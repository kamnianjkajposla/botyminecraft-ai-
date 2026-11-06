const mineflayer = require('mineflayer');
const http = require('http');

// --- 1. PROSTY SERWER HTTP DLA RENDERA (Żeby się nie wyłączał) ---
const PORT = process.env.PORT || 10000;
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Boty cywilizacji Minecraft działają w tle!\n');
});

server.listen(PORT, () => {
    console.log(`[HTTP] Serwer webowy działa na porcie ${PORT} i trzyma Render przy życiu.`);
});

// --- 2. KONFIGURACJA 20 AGENTÓW MINECRAFT ---
const SERVER_HOST = 'sigammaikrft13.aternos.me';
const SERVER_PORT = 25565; // Zmień, jeśli Aternos podał inny port
const TOTAL_BOTS = 20;     // 20 agentów

const StanOsady = {
    drewno: 0,
    kamien: 0,
    poziomRozwoju: 1
};

function uruchomBota(id) {
    let rola = "drwal";
    if (id > 6 && id <= 12) rola = "gornik";
    else if (id > 12 && id <= 16) rola = "rolnik";
    else if (id > 16) rola = "budowniczy";

    const nazwaBota = `Agent_${id}`;

    const bot = mineflayer.createBot({
        host: SERVER_HOST,
        port: SERVER_PORT,
        username: nazwaBota,
        version: '1.21.5'
    });

    bot.on('spawn', () => {
        console.log(`[+] ${nazwaBota} (${rola}) dołączył do świata na Renderze!`);

        setInterval(() => {
            podejmijDecyzjęAgenta(bot, rola, nazwaBota);
        }, 30000 + Math.random() * 15000);
    });

    bot.on('error', (err) => {});

    bot.on('kicked', (reason) => {
        setTimeout(() => {
            uruchomBota(id);
        }, 40000);
    });
}

function podejmijDecyzjęAgenta(bot, rola, nazwa) {
    if (StanOsady.drewno >= 25 && StanOsady.poziomRozwoju === 1) {
        StanOsady.poziomRozwoju = 2;
        bot.chat("Awansowaliśmy cywilizację na 2 poziom technologii!");
    }

    if (rola === "drwal") {
        StanOsady.drewno += 2;
        if (Math.random() < 0.3) {
            bot.chat(`${nazwa}: Dostarczyłem drewno. (Magazyn: ${StanOsady.drewno} szt.)`);
        }
    } else if (rola === "gornik" && StanOsady.poziomRozwoju >= 2) {
        StanOsady.kamien += 1;
        if (Math.random() < 0.3) {
            bot.chat(`${nazwa}: Wydobyłem surowiec skalny.`);
        }
    } else if (rola === "budowniczy" && StanOsady.drewno >= 4) {
        StanOsady.drewno -= 4;
        bot.chat(`${nazwa}: 🏗️ Wznoszę nową strukturę osady!`);
    }
}

console.log(`=== URUCHAMIANIE 20 AGENTÓW DLA ${SERVER_HOST} ===`);

// Wchodzenie botów pojedynczo co 10 sekund (ochrona przed banem/DDoS na Aternosie)
for (let i = 1; i <= TOTAL_BOTS; i++) {
    setTimeout(() => {
        uruchomBota(i);
    }, i * 10000);
}
