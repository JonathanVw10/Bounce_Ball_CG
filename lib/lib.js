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

    gambarBarHp(pemain, xAwal, yBar) {
        const lebarBarTotal = 100;
        const tinggiBar = 6;
        const rasioHp = Math.max(0, pemain.hp / pemain.hpMaks);
        const lebarHpAktif = Math.round(lebarBarTotal * rasioHp);
        const warnaHp = rasioHp > 0.3 ? { r: 40, g: 200, b: 40 } : { r: 230, g: 40, b: 40 };

        for (let i = 0; i < tinggiBar; i++) {
            this.dda_line(
                xAwal,
                yBar + i,
                xAwal + lebarBarTotal,
                yBar + i,
                { r: 210, g: 210, b: 210 }
            );

            if (lebarHpAktif > 0) {
                this.dda_line(
                    xAwal,
                    yBar + i,
                    xAwal + lebarHpAktif,
                    yBar + i,
                    warnaHp
                );
            }
        }
    }

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
            return Math.floor(Math.random() * 8) + 5;
        } else {
            return Math.floor(Math.random() * 8) + 13;
        }
    }

    buatBolaRandom(x, y, warna, sudutAwal) {
        return {
            tipe: "RANDOM",
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

    efekTabrakan(xc, yc, rays, r, color) {
        let a = (Math.PI * 2) / rays;
        for (let i = 0; i < rays; i++) {
            let sudut = i * a;
            let x1 = xc + r * Math.cos(sudut);
            let y1 = yc + r * Math.sin(sudut);
            let b = Math.floor(Math.random() * 15) + 5;
            let x2 = xc + (r + b) * Math.cos(sudut);
            let y2 = yc + (r + b) * Math.sin(sudut);

            this.dda_line(
                Math.round(x1),
                Math.round(y1),
                Math.round(x2),
                Math.round(y2),
                color
            );
        }
    }
}
