const mineflayer = require('mineflayer');
const http = require('http');

// --- 1. SERWER HTTP DLA RENDERA (Żeby się nie wyłączał) ---
const PORT = process.env.PORT || 10000;
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Boty cywilizacji Minecraft działają w tle i rozmawiają na czacie!\n');
});

server.listen(PORT, () => {
    console.log(`[HTTP] Serwer webowy działa na porcie ${PORT}.`);
});

// --- 2. KONFIGURACJA 20 AGENTÓW MINECRAFT ---
const SERVER_HOST = 'sigammaikrft13.aternos.me';
const SERVER_PORT = 25565; // Zmień, jeśli Aternos ma inny port
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

        // Każdy bot co 25-45 sekund wykonuje akcję i pisze na czacie gry
        setInterval(() => {
            podejmijDecyzjęIRozmawiaj(bot, rola, nazwaBota);
        }, 25000 + Math.random() * 20000);
    });

    // Nasłuchiwanie wiadomości czatu od innych graczy/botów
    bot.on('chat', (username, message) => {
        if (username === nazwaBota) return; // Ignoruj własne wiadomości
        
        // Reakcja na czat (np. bot odpowiada na komunikaty o drewnie)
        if (message.includes("drewno") && rola === "budowniczy" && Math.random() < 0.4) {
            setTimeout(() => {
                bot.chat(`Widzę surowce! Przygotowuję plan budowy, ${username}.`);
            }, 3000);
        }
    });

    bot.on('error', (err) => {});

    bot.on('kicked', (reason) => {
        setTimeout(() => {
            uruchomBota(id);
        }, 45000); // Ponowne wejście po wyrzuceniu
    });
}

function podejmijDecyzjęIRozmawiaj(bot, rola, nazwa) {
    if (StanOsady.drewno >= 25 && StanOsady.poziomRozwoju === 1) {
        StanOsady.poziomRozwoju = 2;
        bot.chat("Osiągnęliśmy 2 poziom technologii cywilizacji!");
        return;
    }

    if (rola === "drwal") {
        StanOsady.drewno += 2;
        if (Math.random() < 0.35) {
            bot.chat(`${nazwa}: Ściąłem drzewa. Stan drewna w osadzie: ${StanOsady.drewno}`);
        }
    } else if (rola === "gornik" && StanOsady.poziomRozwoju >= 2) {
        StanOsady.kamien += 1;
        if (Math.random() < 0.35) {
            bot.chat(`${nazwa}: Wydobywam kamień na mury obronne.`);
        }
    } else if (rola === "rolnik") {
        if (Math.random() < 0.25) {
            bot.chat(`${nazwa}: Uprawiam pole, żeby wyżywić całą osadę!`);
        }
    } else if (rola === "budowniczy" && StanOsady.drewno >= 4) {
        StanOsady.drewno -= 4;
        bot.chat(`${nazwa}: 🏗️ Wznoszę nowy budynek mieszkalny z zebranego drewna!`);
    }
}

console.log(`=== URUCHAMIANIE 20 AGENTÓW (wejście co 15 sekund) ===`);

// Wchodzenie botów pojedynczo dokładnie co 15 sekund
for (let i = 1; i <= TOTAL_BOTS; i++) {
    setTimeout(() => {
        uruchomBota(i);
    }, i * 15000); 
}
