const mineflayer = require('mineflayer');

// Konfiguracja serwera Aternos
const SERVER_HOST = 'sigammaikrft13.aternos.me';
const SERVER_PORT = 25565; // Jeśli Aternos ma inny port, zmień tutaj
const TOTAL_BOTS = 20;     // Dokładnie 20 agentów

// Wspólny stan cywilizacji osady
const StanOsady = {
    drewno: 0,
    kamien: 0,
    poziomRozwoju: 1
};

function uruchomBota(id) {
    // Przydział ról dla 20 agentów
    let rola = "drwal";
    if (id > 6 && id <= 12) rola = "gornik";
    else if (id > 12 && id <= 16) rola = "rolnik";
    else if (id > 16) rola = "budowniczy";

    const nazwaBota = `Agent_${id}`;

    const bot = mineflayer.createBot({
        host: SERVER_HOST,
        port: SERVER_PORT,
        username: nazwaBota,
        version: '1.21.5' // Wersja zgodna z Twoim serwerem
    });

    bot.on('spawn', () => {
        console.log(`[+] ${nazwaBota} (${rola}) dołączył do symulacji na Renderze!`);

        // Pętla decyzyjna agenta (co 30-45 sekund podejmuje akcję)
        setInterval(() => {
            podejmijDecyzjęAgenta(bot, rola, nazwaBota);
        }, 30000 + Math.random() * 15000);
    });

    // Ciche wychwytywanie błędów sieciowych, żeby proces na Renderze się nie wyłożył
    bot.on('error', (err) => {
        // Ignorujemy chwilowe zrywania połączeń
    });

    bot.on('kicked', (reason) => {
        console.log(`[-] ${nazwaBota} został wyrzucony. Ponowne łączenie za 40 sekund...`);
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

// Wprowadzanie botów na serwer z dużymi odstępami (co 10 sekund), 
// żeby Aternos nie uznał tego za atak DDoS / anty-bot zapory.
for (let i = 1; i <= TOTAL_BOTS; i++) {
    setTimeout(() => {
        uruchomBota(i);
    }, i * 10000); 
}
