import GrafLib from "./lib/lib.js";
import MatrixClass from "./lib/matrix.js";

const canvas = document.getElementById("mycanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const img = ctx.getImageData(0, 0, canvas.width, canvas.height);

let lib = new GrafLib(canvas.width, canvas.height, img);
let mat = new MatrixClass();

const p1HpEl = document.querySelector("#p1-hp");
const p1DamageEl = document.querySelector("#p1-damage");
const p2HpEl = document.querySelector("#p2-hp");
const p2DamageEl = document.querySelector("#p2-damage");
const winnerTextEl = document.querySelector("#winner-text");
const instructionTextEl = document.querySelector("#instruction-text");

let faseGame = "BIDIK_P1";

let player1 = lib.buatBolaRandom(
    canvas.width / 4,
    canvas.height / 2,
    { r: 30, g: 130, b: 240 },
    0
);

let player2 = lib.buatBolaFibonacci(
    (canvas.width * 3) / 4,
    canvas.height / 2,
    { r: 230, g: 45, b: 45 },
    Math.PI
);

const panjangGarisBidik = 40;
const warnaGarisBidik = { r: 90, g: 90, b: 90 };
let efek = { aktif: false, x: 0, y: 0, r: 20, rays: 12, mengecil: true };

canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (faseGame === "BIDIK_P1") {
        player1.sudutBidik = Math.atan2(
            mouseY - player1.posisi.y,
            mouseX - player1.posisi.x
        );
    } else if (faseGame === "BIDIK_P2") {
        player2.sudutBidik = Math.atan2(
            mouseY - player2.posisi.y,
            mouseX - player2.posisi.x
        );
    }
});

canvas.addEventListener("click", () => {
    if (faseGame === "BIDIK_P1") {
        faseGame = "BIDIK_P2";
    } else if (faseGame === "BIDIK_P2") {
        player1.kecepatan = {
            x: Math.cos(player1.sudutBidik) * player1.kecepatanMaks,
            y: Math.sin(player1.sudutBidik) * player1.kecepatanMaks
        };
        player2.kecepatan = {
            x: Math.cos(player2.sudutBidik) * player2.kecepatanMaks,
            y: Math.sin(player2.sudutBidik) * player2.kecepatanMaks
        };
        faseGame = "TANDING";
    } else if (faseGame === "SELESAI") {
        resetPertandingan();
    }
});

function resetPertandingan() {
    player1 = lib.buatBolaRandom(
        canvas.width / 4,
        canvas.height / 2,
        { r: 30, g: 130, b: 240 },
        0
    );
    player2 = lib.buatBolaFibonacci(
        (canvas.width * 3) / 4,
        canvas.height / 2,
        { r: 230, g: 45, b: 45 },
        Math.PI
    );
    efek.aktif = false;
    faseGame = "BIDIK_P1";
}

function cekTabrakanBola() {
    const dx = player2.posisi.x - player1.posisi.x;
    const dy = player2.posisi.y - player1.posisi.y;
    const jarak = Math.sqrt(dx * dx + dy * dy);
    const radiusTotal = player1.radius + player2.radius;

    if (jarak < radiusTotal) {
        player1.hp = Math.max(0, player1.hp - player2.damage);
        player2.hp = Math.max(0, player2.hp - player1.damage);

        if (player1.tipe === "RANDOM") {
            player1.damage = lib.acakDamageAdil();
        }

        if (player2.tipe === "FIBONACCI") {
            player2.hitCount += 1;
            player2.damage = lib.hitungFibonacci(player2.hitCount);
        }

        const nx = dx / (jarak || 1);
        const ny = dy / (jarak || 1);

        const kx = player1.kecepatan.x - player2.kecepatan.x;
        const ky = player1.kecepatan.y - player2.kecepatan.y;
        const p = kx * nx + ky * ny;

        if (p > 0) {
            player1.kecepatan.x -= p * nx;
            player1.kecepatan.y -= p * ny;
            player2.kecepatan.x += p * nx;
            player2.kecepatan.y += p * ny;
        }

        const overlap = radiusTotal - jarak;
        player1.posisi.x -= (overlap / 2) * nx;
        player1.posisi.y -= (overlap / 2) * ny;
        player2.posisi.x += (overlap / 2) * nx;
        player2.posisi.y += (overlap / 2) * ny;

        efek = {
            aktif: true,
            x: (player1.posisi.x + player2.posisi.x) / 2,
            y: (player1.posisi.y + player2.posisi.y) / 2,
            r: 20,
            rays: Math.floor(Math.random() * 12) + 8,
            mengecil: true
        };

        if (player1.hp <= 0 || player2.hp <= 0) {
            faseGame = "SELESAI";
        }
    }
}

function update() {
    if (efek.aktif) {
        if (efek.mengecil) {
            efek.r -= 3;
            if (efek.r <= 4) {
                efek.mengecil = false;
            }
        } else {
            efek.r += 4;
            if (efek.r >= 28) {
                efek.aktif = false;
            }
        }
    }

    if (faseGame !== "TANDING") return;

    let T1 = mat.create_translation(player1.kecepatan.x, player1.kecepatan.y);
    player1.posisi = mat.transform_point(player1.posisi, T1);

    let T2 = mat.create_translation(player2.kecepatan.x, player2.kecepatan.y);
    player2.posisi = mat.transform_point(player2.posisi, T2);

    lib.pantulkanDinding(player1, canvas.width, canvas.height);
    lib.pantulkanDinding(player2, canvas.width, canvas.height);

    cekTabrakanBola();
}

function updateUI() {
    p1HpEl.textContent = `HP: ${player1.hp}/${player1.hpMaks}`;
    p1DamageEl.textContent = `Damage: ${player1.damage} (Acak)`;

    p2HpEl.textContent = `HP: ${player2.hp}/${player2.hpMaks}`;
    p2DamageEl.textContent = `Damage: ${player2.damage} (Bertahap)`;

    if (faseGame === "BIDIK_P1") {
        winnerTextEl.textContent = "";
        instructionTextEl.style.color = "#1e60d0";
        instructionTextEl.textContent = "Giliran Player 1: Arahkan kursor lalu KLIK untuk tentukan arah pantulan";
    } else if (faseGame === "BIDIK_P2") {
        winnerTextEl.textContent = "";
        instructionTextEl.style.color = "#d02020";
        instructionTextEl.textContent = "Giliran Player 2: Arahkan kursor lalu KLIK untuk tentukan arah pantulan";
    } else if (faseGame === "TANDING") {
        winnerTextEl.textContent = "";
        instructionTextEl.style.color = "#555";
        instructionTextEl.textContent = "Bola saling bertabrakan dan mengurangi HP lawan!";
    } else if (faseGame === "SELESAI") {
        if (player1.hp > 0 && player2.hp <= 0) {
            winnerTextEl.style.color = "#1e60d0";
            winnerTextEl.textContent = "PLAYER 1 (BIRU) MENANG!";
        } else if (player2.hp > 0 && player1.hp <= 0) {
            winnerTextEl.style.color = "#d02020";
            winnerTextEl.textContent = "PLAYER 2 (MERAH) MENANG!";
        } else {
            winnerTextEl.style.color = "#000";
            winnerTextEl.textContent = "PERTANDINGAN SERI!";
        }
        instructionTextEl.style.color = "#333";
        instructionTextEl.textContent = "KLIK DI MANA SAJA UNTUK MAIN LAGI";
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lib.image_data = ctx.getImageData(0, 0, canvas.width, canvas.height);

    lib.lingkaran_berisi(player1.posisi.x, player1.posisi.y, player1.radius, player1.warna);
    lib.lingkaran_berisi(player2.posisi.x, player2.posisi.y, player2.radius, player2.warna);

    if (faseGame === "BIDIK_P1") {
        let R1 = mat.create_rotation(player1.sudutBidik);
        let T1 = mat.create_translation(player1.posisi.x, player1.posisi.y);
        let M1 = mat.multiply(T1, R1);
        const titikUjung = mat.transform_point({ x: panjangGarisBidik, y: 0 }, M1);
        lib.dda_line(player1.posisi.x, player1.posisi.y, titikUjung.x, titikUjung.y, warnaGarisBidik);
    } else if (faseGame === "BIDIK_P2") {
        let R2 = mat.create_rotation(player2.sudutBidik);
        let T2 = mat.create_translation(player2.posisi.x, player2.posisi.y);
        let M2 = mat.multiply(T2, R2);
        const titikUjung = mat.transform_point({ x: panjangGarisBidik, y: 0 }, M2);
        lib.dda_line(player2.posisi.x, player2.posisi.y, titikUjung.x, titikUjung.y, warnaGarisBidik);
    }

    if (efek.aktif) {
        lib.efekTabrakan(efek.x, efek.y, efek.rays, efek.r, { r: 255, g: 140, b: 0 });
    }

    lib.gambarBarHp(player1, 15, 20);
    lib.gambarBarHp(player2, canvas.width - 115, 20);

    ctx.putImageData(lib.image_data, 0, 0);

    updateUI();
}

function loop() {
    update();
    render();
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
