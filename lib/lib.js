export default class GrafLib {
    constructor(canvas_width, canvas_height, image_data) {
        this.canvas_width = canvas_width;
        this.canvas_height = canvas_height;
        this.image_data = image_data;
    }

    draw_dot(x, y, color) {
        x = Math.round(x);
        y = Math.round(y);
        if (x < 0 || x >= this.canvas_width || y < 0 || y >= this.canvas_height) return;
        let index = 4 * (x + (y * this.canvas_width));
        this.image_data.data[index] = color.r;
        this.image_data.data[index + 1] = color.g;
        this.image_data.data[index + 2] = color.b;
        this.image_data.data[index + 3] = 255;
    }

    dda_line(x1, y1, x2, y2, color) {
        x1 = Math.round(x1);
        y1 = Math.round(y1);
        x2 = Math.round(x2);
        y2 = Math.round(y2);

        let dx = Math.abs(x2 - x1);
        let dy = Math.abs(y2 - y1);
        let steps = Math.max(dx, dy);

        if (steps === 0) {
            this.draw_dot(x1, y1, color);
            return;
        }

        if (dx >= dy) {
            let my = Math.abs(dy) / dx;
            if (x2 < x1) {
                let y = y1;
                for (let x = x1; x >= x2; x--) {
                    this.draw_dot(x, Math.round(y), color);
                    if (y2 >= y1) {
                        y = y + my;
                    } else {
                        y = y - my;
                    }
                }
            } else {
                let y = y1;
                for (let x = x1; x <= x2; x++) {
                    this.draw_dot(x, Math.round(y), color);
                    if (y2 >= y1) {
                        y = y + my;
                    } else {
                        y = y - my;
                    }
                }
            }
        } else {
            let mx = Math.abs(dx) / dy;
            if (y2 < y1) {
                let x = x1;
                for (let y = y1; y >= y2; y--) {
                    this.draw_dot(Math.round(x), y, color);
                    if (x2 >= x1) {
                        x = x + mx;
                    } else {
                        x = x - mx;
                    }
                }
            } else {
                let x = x1;
                for (let y = y1; y <= y2; y++) {
                    this.draw_dot(Math.round(x), y, color);
                    if (x2 >= x1) {
                        x = x + mx;
                    } else {
                        x = x - mx;
                    }
                }
            }
        }
    }

    polygon(kump_titik, color) {
        for (let i = 0; i < kump_titik.length; i++) {
            let titik_awal = kump_titik[i];
            let titik_akhir = kump_titik[(i + 1) % kump_titik.length];
            this.dda_line(titik_awal.x, titik_awal.y, titik_akhir.x, titik_akhir.y, color);
        }
    }

    lingkaran_polar(xc, yc, radius, color) {
        let step = 0.5 / radius;
        for (let sudut = 0; sudut <= Math.PI * 2; sudut += step) {
            let x = xc + radius * Math.cos(sudut);
            let y = yc + radius * Math.sin(sudut);
            this.draw_dot(Math.round(x), Math.round(y), color);
        }
    }

    lingkaran_berisi(xc, yc, radius, color) {
        for (let r = 1; r <= radius; r++) {
            this.lingkaran_polar(xc, yc, r, color);
        }
        this.draw_dot(xc, yc, color);
    }

    translasi(titik_lama, T) {
        var x_baru = titik_lama.x + T.x;
        var y_baru = titik_lama.y + T.y;
        return { x: x_baru, y: y_baru };
    }

    rotasi_fp(titik, center, sudut_rad) {
        let t1 = this.translasi(titik, { x: -center.x, y: -center.y });

        let cos_s = Math.cos(sudut_rad);
        let sin_s = Math.sin(sudut_rad);

        let x_rot = t1.x * cos_s - t1.y * sin_s;
        let y_rot = t1.x * sin_s + t1.y * cos_s;

        let t2 = this.translasi({ x: x_rot, y: y_rot }, { x: center.x, y: center.y });
        return t2;
    }

    // Data pemain
    buatPemain(x, y, warna, sudutAwal) {
        return {
            tipe: "NORMAL",
            posisiAwal: { x: x, y: y },
            posisi: { x: x, y: y },
            radius: 30,
            kecepatan: { x: 0, y: 0 },
            kecepatanMaks: 5,
            sudutBidik: sudutAwal,
            hpMaks: 100,
            hp: 100,
            damage: 10,
            warna: warna
        };
    }

    // Pantulan dinding
    pantulkanDinding(pemain, batasLebar = 500, batasTinggi = 500) {
        if (pemain.posisi.x - pemain.radius <= 0) {
            pemain.posisi.x = pemain.radius;
            pemain.kecepatan.x *= -1;
        } else if (pemain.posisi.x + pemain.radius >= batasLebar) {
            pemain.posisi.x = batasLebar - pemain.radius;
            pemain.kecepatan.x *= -1;
        }

        if (pemain.posisi.y - pemain.radius <= 0) {
            pemain.posisi.y = pemain.radius;
            pemain.kecepatan.y *= -1;
        } else if (pemain.posisi.y + pemain.radius >= batasTinggi) {
            pemain.posisi.y = batasTinggi - pemain.radius;
            pemain.kecepatan.y *= -1;
        }
    }

    // Bar HP di atas bola
    gambarBarHp(pemain) {
        const lebarBarTotal = 30;
        const rasioHp = Math.max(0, pemain.hp / pemain.hpMaks);
        const lebarHpAktif = Math.round(lebarBarTotal * rasioHp);

        const xAwal = Math.round(pemain.posisi.x - lebarBarTotal / 2);
        const yBar = Math.round(pemain.posisi.y - pemain.radius - 8);

        this.dda_line(
            xAwal,
            yBar,
            xAwal + lebarBarTotal,
            yBar,
            { r: 180, g: 180, b: 180 }
        );

        if (lebarHpAktif > 0) {
            const warnaHp = rasioHp > 0.3 ? { r: 40, g: 200, b: 40 } : { r: 230, g: 40, b: 40 };
            this.dda_line(
                xAwal,
                yBar,
                xAwal + lebarHpAktif,
                yBar,
                warnaHp
            );
        }
    }

    // bagian dominic
    hitungFibonacci(n) {
        if (n <= 1) return 1;
        let a = 1, b = 1;
        for (let i = 2; i <= n; i++) {
            let temp = a + b;
            a = b;
            b = temp;
        }
        return b;
    }

    buatBolaFibonacci(x, y, warna, sudutAwal) {
        return {
            tipe: "FIBONACCI",        
            posisiAwal: { x: x, y: y },
            posisi: { x: x, y: y },
            radius: 30,
            kecepatan: { x: 0, y: 0 },
            kecepatanMaks: 5,
            sudutBidik: sudutAwal,
            hpMaks: 100,
            hp: 100,
            hitCount: 1,             
            damage: 1,               
            warna: warna
        };
    }

    acakDamageAdil() {
        const peluang = Math.random(); 

        if (peluang < 0.6) {
            return Math.floor(Math.random() * 10) + 1;
        } else {
            return Math.floor(Math.random() * 20) + 11;
        }
    }

    buatBolaRandom(x, y, warna, sudutAwal) {
        return {
            tipe: "RANDOM",
            posisiAwal: { x: x, y: y },
            posisi: { x: x, y: y },
            radius: 30,
            kecepatan: { x: 0, y: 0 },
            kecepatanMaks: 5,
            sudutBidik: sudutAwal,
            hpMaks: 100,
            hp: 100,
            damage: this.acakDamageAdil(), 
            warna: warna
        };
    }
}
