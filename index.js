import GrafLib from "./lib/lib.js";
import MatrixClass from "./lib/matrix.js";

const canvas = document.getElementById("mycanvas");
const ctx = canvas.getContext("2d");
const img = ctx.getImageData(0, 0, canvas.width, canvas.height);

let lib = new GrafLib(canvas.width, canvas.height, img);
let mat = new MatrixClass();

let faseGame = "BIDIK_P1";

let player1 = lib.buatBolaRandom(
    canvas.width / 4,
    canvas.height / 2,
    { r: 30, g: 130, b: 240 }, // Warna Biru
    0                          // Menghadap ke kanan
);

let player2 = lib.buatBolaFibonacci(
    (canvas.width * 3) / 4,
    canvas.height / 2,
    { r: 230, g: 45, b: 45 },
    Math.PI
);

const panjangGarisBidik = 40;
const warnaGarisBidik = { r: 90, g: 90, b: 90 };

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

        if (player1.hp <= 0 || player2.hp <= 0) {
            faseGame = "SELESAI";
        }
    }
}

function update() {
    if (faseGame !== "TANDING") return;

    let T1 = mat.create_translation(player1.kecepatan.x, player1.kecepatan.y);
    player1.posisi = mat.transform_point(player1.posisi, T1);

    let T2 = mat.create_translation(player2.kecepatan.x, player2.kecepatan.y);
    player2.posisi = mat.transform_point(player2.posisi, T2);

    lib.pantulkanDinding(player1, canvas.width, canvas.height);
    lib.pantulkanDinding(player2, canvas.width, canvas.height);

    cekTabrakanBola();
}

function render() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    lib.image_data = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Garis bidik
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

    lib.lingkaran_berisi(player1.posisi.x, player1.posisi.y, player1.radius, player1.warna);
    lib.lingkaran_berisi(player2.posisi.x, player2.posisi.y, player2.radius, player2.warna);

    lib.gambarBarHp(player1);
    lib.gambarBarHp(player2);

    ctx.putImageData(lib.image_data, 0, 0);

    // Info HUD
    ctx.fillStyle = "#1e60d0";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("Player 1 (Biru)", 15, 25);
    ctx.font = "12px sans-serif";
    ctx.fillText(`HP: ${player1.hp}/${player1.hpMaks}`, 15, 43);
    ctx.fillText(`Damage: ${player1.damage} (Acak)`, 15, 59);

    ctx.fillStyle = "#d02020";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("Player 2 (Merah)", canvas.width - 130, 25);
    ctx.font = "12px sans-serif";
    ctx.fillText(`HP: ${player2.hp}/${player2.hpMaks}`, canvas.width - 130, 43);
    ctx.fillText(`Damage: ${player2.damage} (Bertahap)`, canvas.width - 130, 59);

    ctx.textAlign = "center";
    if (faseGame === "BIDIK_P1") {
        ctx.fillStyle = "#1e60d0";
        ctx.font = "bold 13px sans-serif";
        ctx.fillText("Giliran Player 1: Arahkan kursor lalu KLIK untuk tentukan arah pantulan", canvas.width / 2, canvas.height - 18);
    } else if (faseGame === "BIDIK_P2") {
        ctx.fillStyle = "#d02020";
        ctx.font = "bold 13px sans-serif";
        ctx.fillText("Giliran Player 2: Arahkan kursor lalu KLIK untuk tentukan arah pantulan", canvas.width / 2, canvas.height - 18);
    } else if (faseGame === "TANDING") {
        ctx.fillStyle = "#555";
        ctx.font = "12px sans-serif";
        ctx.fillText("Bola saling bertabrakan dan mengurangi HP lawan!", canvas.width / 2, canvas.height - 18);
    } else if (faseGame === "SELESAI") {
        ctx.fillStyle = "#000";
        ctx.font = "bold 18px sans-serif";
        if (player1.hp > 0 && player2.hp <= 0) {
            ctx.fillStyle = "#1e60d0";
            ctx.fillText("PLAYER 1 (BIRU) MENANG!", canvas.width / 2, canvas.height / 2 - 40);
        } else if (player2.hp > 0 && player1.hp <= 0) {
            ctx.fillStyle = "#d02020";
            ctx.fillText("PLAYER 2 (MERAH) MENANG!", canvas.width / 2, canvas.height / 2 - 40);
        } else {
            ctx.fillText("PERTANDINGAN SERI!", canvas.width / 2, canvas.height / 2 - 40);
        }
        ctx.fillStyle = "#333";
        ctx.font = "13px sans-serif";
        ctx.fillText("KLIK DI MANA SAJA UNTUK MAIN LAGI", canvas.width / 2, canvas.height / 2 - 15);
    }
    ctx.textAlign = "left";
}

function loop() {
    update();
    render();
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
