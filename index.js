const mineflayer = require('mineflayer');
const http = require('http');

// --- 1. SERWER HTTP DLA RENDERA (Żeby się nie wyłączał) ---
const PORT = process.env.PORT || 10000;
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Boty cywilizacji Minecraft działają aktywnie w tle!\n');
});

server.listen(PORT, () => {
    console.log(`[HTTP] Serwer webowy działa na porcie ${PORT}.`);
});

// --- 2. KONFIGURACJA 20 AGENTÓW MINECRAFT ---
const SERVER_HOST = 'sigammaikrft13.aternos.me';
const SERVER_PORT = 25565; // Zmień, jeśli Aternos przydzielił inny port
const TOTAL_BOTS = 20;

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
        console.log(`[+] ${nazwaBota} (${rola}) dołączył do świata!`);
        bot.chat(`[AI] ${nazwaBota} (${rola}) dołączył do sieci cywilizacji i rozpoczyna pracę!`);

        // Pętla decyzyjna agenta (akcja i meldunek na czacie co 20-35 sekund)
        setInterval(() => {
            podejmijDecyzjęIRozmawiaj(bot, rola, nazwaBota);
        }, 20000 + Math.random() * 15000);
    });

    // Nasłuchiwanie czatu i interakcja z innymi
    bot.on('chat', (username, message) => {
        if (username === nazwaBota) return;
        
        // Jeśli ktoś wspomni o drewnie lub budowaniu, reagują
        if (message.includes("drewno") && rola === "budowniczy" && Math.random() < 0.5) {
            setTimeout(() => {
                bot.chat(`[AI] ${nazwaBota}: Zanotowałem stan surowców. Planuję nową strukturę.`);
            }, 2000);
        }
    });

    bot.on('error', (err) => {});

    // AUTOMATYCZNE DOŁĄCZANIE PONOWNIE W 5 SEKUND W RAZIE ROZPŁĄCZENIA / KICKA
    bot.on('kicked', (reason) => {
        console.log(`[-] ${nazwaBota} rozłączony. Próba powrotu za 5 sekund...`);
        setTimeout(() => {
            uruchomBota(id);
        }, 5000); // Dokładnie 5 sekund
    });

    bot.on('end', () => {
        setTimeout(() => {
            uruchomBota(id);
        }, 5000); // 5 sekund w przypadku nagłego końca połączenia
    });
}

function podejmijDecyzjęIRozmawiaj(bot, rola, nazwa) {
    if (StanOsady.drewno >= 30 && StanOsady.poziomRozwoju === 1) {
        StanOsady.poziomRozwoju = 2;
        bot.chat(`[AI] ${nazwa}: Osiągnęliśmy 2 poziom technologii cywilizacji! Wszyscy agenci przechodzą na wyższy tier pracy.`);
        return;
    }

    if (rola === "drwal") {
        StanOsady.drewno += 3;
        if (Math.random() < 0.4) {
            bot.chat(`[AI] ${nazwa}: [Drwal] Pozyskałem surowce. Całkowite drewno w osadzie: ${StanOsady.drewno}`);
        }
    } else if (rola === "gornik" && StanOsady.poziomRozwoju >= 2) {
        StanOsady.kamien += 2;
        if (Math.random() < 0.4) {
            bot.chat(`[AI] ${nazwa}: [Górnik] Wydobywam kamień. Stan kamienia: ${StanOsady.kamien}`);
        }
    } else if (rola === "rolnik") {
        if (Math.random() < 0.3) {
            bot.chat(`[AI] ${nazwa}: [Rolnik] Uprawiam ziemię i dbam o zapasy żywności dla osady.`);
        }
    } else if (rola === "budowniczy" && StanOsady.drewno >= 5) {
        StanOsady.drewno -= 5;
        bot.chat(`[AI] ${nazwa}: [Budowniczy] 🏗️ Zużyłem 5 drewna na wzniesienie nowego budynku cywilizacji!`);
    }
}

console.log(`=== URUCHAMIANIE 20 AGENTÓW (wejście co 15 sekund, powrót w 5s) ===`);

// Wchodzenie botów pojedynczo co 15 sekund przy starcie
for (let i = 1; i <= TOTAL_BOTS; i++) {
    setTimeout(() => {
        uruchomBota(i);
    }, i * 15000); 
}
