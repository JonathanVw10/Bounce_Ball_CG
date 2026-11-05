export default class MatrixClass {
    multiply(matA, matB) {
        var hasil = [
            [0,0,0],
            [0,0,0],
            [0,0,0]
        ];

        for (var i = 0; i<3; i++) {
            for (var j = 0; j<3; j++) {
                for (var k = 0; k<3; k++) {
                    hasil[i][k] += matA[i][j] * matB[j][k]
                }
            }
        }
        return hasil
    }

    transform_point(point, matT) {
        var x_baru = matT[0][0]*point.x + matT[0][1]*point.y + matT[0][2]*1
        var y_baru = matT[1][0]*point.x + matT[1][1]*point.y + matT[1][2]*1

        return {x: x_baru, y: y_baru}
    }

    transform_points(points, matT) {
        var hasil = []
        for (var i = 0; i<points.length; i++){
            var titik_hasil
            titik_hasil = this.transform_point(points[i], matT)
            hasil.push(titik_hasil)
        }

        return hasil
    }

    create_translation(tx, ty) {
        return [
            [1,0,tx],
            [0,1,ty],
            [0,0,1]
        ]
    }

    create_scale(sx, sy) {
        return [
            [sx,0,0],
            [0,sy,0],
            [0,0,1]
        ]
    }

    create_rotation(degree) {
        return [
            [Math.cos(degree),-Math.sin(degree),0],
            [Math.sin(degree),Math.cos(degree),0],
            [0,0,1]
        ]
    }

    create_fixedp_rotation(xc, yc, degree) {
        var m1 = this.create_translation(-xc, -yc)
        var m2 = this.create_rotation(degree)
        var m3 = this.create_translation(xc, yc)

        var hasil
        hasil = this.multiply(m3, m2)
        hasil = this.multiply(hasil, m1)
        return hasil
    }

    create_fixedp_scale(xc, yc, sx, sy) {
        var m1 = this.create_translation(-xc, -yc)
        var m2 = this.create_scale(sx, sy)
        var m3 = this.create_translation(xc, yc)

        var hasil
        hasil = this.multiply(m3, m2)
        hasil = this.multiply(hasil, m1)
        return hasil
    }
} 