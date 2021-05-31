const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mysql = require("mysql");
const sha1js = require('sha1');
const sha256js = require('js-sha256');
const base64 = require('base-64');
const cors = require('cors');
const PublikFungsi = require("./PublikFungsi");
const Token = require("./Token");
const Jimp = require("jimp");
const fs = require("fs");
const path = require('path');

// parse application/json
// app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
// app.use(cors({ origin: true }));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

//create database connection
const conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "tunneling_delphi_nodejs",
});

//connect to database
conn.connect((err) => {
    if (err) throw err;
    console.log("Mysql Connected...");
});

app.post("/api/cari_data", (req, res) => {    
    let data = {
        token:req.body.token,
        nama_tabel: req.body.nama_tabel,
        nama_field: req.body.nama_field,
        kondisi: req.body.kondisi
    };
    let sql;
    let nama_tabel = data['nama_tabel'];
    try {
        if (nama_tabel){
            sql = PublikFungsi.CariDataDebug(base64.decode(data['nama_tabel']),data['nama_field'],data['kondisi']);
        }
        else {
            sql = PublikFungsi.CariDataDebug("",data['nama_field'],data['kondisi']);
        }
    } catch (error) {
        sql = PublikFungsi.CariDataDebug("",data['nama_field'],data['kondisi']);
        console.log(error);
    }
    res.setHeader('Content-Type', 'application/json');
    if ((data['token']) && (data['nama_tabel']) && (data['nama_field']) && (data['kondisi'])){
        if (Token.LoginToken(data['token'])){
            conn.query(sql, data, (err, results) => {        
                if (err) {
                    res.send(JSON.stringify({ 
                        status: 200, 
                        pesan: "Error.", 
                        status_tampil: false, 
                        tokennyaa: "Hidden", 
                        error: err, 
                        jumlah_data: 0, 
                        data: results,
                    }));
                }
                else if (results.length > 0){
                    res.send(JSON.stringify({ 
                        status: 200, 
                        pesan: "Datanya ada.", 
                        status_tampil: true, 
                        tokennyaa: "Hidden", 
                        error: null, 
                        jumlah_data: results.length, 
                        data: results,
                    }));
                }
                else{
                    res.send(JSON.stringify({ 
                        status: 200, 
                        pesan: "Belum Ada datanya.", 
                        status_tampil: false, 
                        tokennyaa: "Hidden", 
                        error: null, 
                        jumlah_data: results.length, 
                        data: results,
                    }));
                }
            });
        }
        else{
            res.send(JSON.stringify({ 
                status: 200, 
                pesan: "Token Tidak Sesuai !", 
                status_tampil: false, 
                tokennyaa: data['token'], 
                error: null, 
                jumlah_data: 0, 
                data: [] 
            }));
        }
    }
    else{
        res.send(JSON.stringify({ 
            status: 200, 
            pesan: "Inputan Kurang !", 
            status_tampil: false, 
            tokennyaa: data['token'], 
            error: null, 
            jumlah_data: 0, 
            data: [] 
        }));
    }
    console.log(data);
});

app.put("/api/tambah_data_gbr", (req, res) => {
    let data = {
        token: req.body.token,
        nama_tabel: req.body.nama_tabel,
        nama_field: req.body.nama_field,
        value_field: req.body.value_field,
        gbr_base64: req.body.gbr_base64,
        nama_foto: req.body.nama_foto,
        alamat_foto: req.body.alamat_foto
    };
    let sql,nama_fotonya;
    let nama_tabel = data['nama_tabel'];
    try {
        if (nama_tabel){
            sql = PublikFungsi.SimpanSingle(base64.decode(data['nama_tabel']),data['nama_field'],data['value_field']);
        }
        else {
            sql = PublikFungsi.SimpanSingle("",data['nama_field'],data['value_field']);
        }
    } catch (error) {
        sql = PublikFungsi.SimpanSingle("",data['nama_field'],data['value_field']);
        console.log(error);
    }
    nama_fotonya= data['nama_foto'];
    res.setHeader('Content-Type', 'application/json');
    if ((!data) || (typeof data != "undefined")){
        if (Token.LoginToken(data['token'])){
            conn.query(sql, data, (err, results) => {        
                if (err){
                    console.log('Error : ' + err);
                    res.send(JSON.stringify({ 
                        status: 200, 
                        status_simpan: false, 
                        pesan: "Datanya Sudah Ada.", 
                        tokennyaa: "Hidden", 
                        error: err, 
                        jumlah_data: 0, 
                        data: results,
                    }));
                }
                else{
                    if ((data['gbr_base64']) && (data['nama_foto']) && (data['alamat_foto'])){
                        const buffer = Buffer.from(data['gbr_base64'], "base64");
                        Jimp.read(buffer, (err, res_jimp) => {
                            if (err) {
                                console.log('Error : ' + err);
                                res.send(JSON.stringify({ 
                                    status: 200, 
                                    status_simpan: false, 
                                    pesan: "Data berhasil diinput tetapi error upload gambar !", 
                                    tokennyaa: "Hidden", 
                                    error: err, 
                                    jumlah_data: 0, 
                                    data: results,
                                }));
                            }
                            else {
                                res_jimp.quality(100).write(data['alamat_foto'] + nama_fotonya);
                                res.send(JSON.stringify({ 
                                    status: 200, 
                                    status_simpan: true, 
                                    pesan: "Sukses Input Data.", 
                                    tokennyaa: "Hidden", 
                                    error: null, 
                                    jumlah_data: results.length, 
                                    data: results,
                                })); 
                            }                            
                        });
                    }
                    else{
                        res.send(JSON.stringify({ 
                            status: 200, 
                            status_simpan: true, 
                            pesan: "Sukses Input Data Tanpa Gambar.", 
                            tokennyaa: "Hidden", 
                            error: null, 
                            jumlah_data: results.length, 
                            data: results,
                        }));
                    }
                }
            });
        }
        else{
            res.send(JSON.stringify({ 
                status: 200, 
                status_simpan: false, 
                pesan: "Token Tidak Sesuai !", 
                tokennyaa: data['token'], 
                error: null, 
                jumlah_data: 0, 
                data: [] 
            }));
        }
    }
    else{
        res.send(JSON.stringify({ 
            status: 200, 
            status_simpan: false, 
            pesan: "Token Kosong !", 
            tokennyaa: 
            data['token'], 
            error: null, 
            jumlah_data: 0, 
            data: [] 
        }));
    }
    console.log(data);
});

app.put("/api/tambah_data_gbr_2", (req, res) => {
    let data = {
        token: req.body.token,
        nama_tabel: req.body.nama_tabel,
        nama_field: req.body.nama_field,
        value_field: req.body.value_field,
        gbr_base64: req.body.gbr_base64,
        gbr_base64_2: req.body.gbr_base64_2,
        nama_foto: req.body.nama_foto,
        nama_foto_2: req.body.nama_foto_2,
        alamat_foto: req.body.alamat_foto,
        alamat_foto_2: req.body.alamat_foto_2
    };
    let sql,nama_fotonya,nama_fotonya_2,errornya_1,errorNya_2;
    let nama_tabel = data['nama_tabel'];
    try {
        if (nama_tabel){
            sql = PublikFungsi.SimpanSingle(base64.decode(data['nama_tabel']),data['nama_field'],data['value_field']);
        }
        else {
            sql = PublikFungsi.SimpanSingle("",data['nama_field'],data['value_field']);
        }
    } catch (error) {
        sql = PublikFungsi.SimpanSingle("",data['nama_field'],data['value_field']);
        console.log(error);
    }
    nama_fotonya= data['nama_foto'];
    nama_fotonya_2= data['nama_foto_2'];
    res.setHeader('Content-Type', 'application/json');
    if ((!data) || (typeof data != "undefined")){
        if (Token.LoginToken(data['token'])){
            conn.query(sql, data, (err, results) => {        
                if (err){
                    console.log('Error : ' + err);
                    res.send(JSON.stringify({ 
                        status: 200, 
                        status_simpan: false, 
                        pesan: "Datanya Sudah Ada.", 
                        tokennyaa: "Hidden", 
                        error: err, 
                        jumlah_data: 0, 
                        data: results,
                    }));
                }
                else{
                    if ((data['gbr_base64']) && (data['gbr_base64_2']) && (data['nama_foto']) && (data['nama_foto_2']) && (data['alamat_foto']) && (data['alamat_foto_2'])){
                        const buffer = Buffer.from(data['gbr_base64'], "base64");
                        const buffer_2 = Buffer.from(data['gbr_base64_2'], "base64");
                        Jimp.read(buffer, (err, res_jimp) => {
                            if (err) {
                                console.log('Error Buffer 1 : ' + err);
                                errornya_1=err;
                            }
                            else {                                
                                res_jimp.quality(100).write(data['alamat_foto'] + nama_fotonya);
                                console.log('Sukses Buffer 1');
                                errornya_1=null; 
                            }                            
                        });

                        Jimp.read(buffer_2, (err_2, res_jimp_2) => {
                            if (err) {
                                console.log('Error Buffer 1 : ' + err_2);
                                errorNya_2=err_2;
                            }
                            else {                                
                                res_jimp_2.quality(100).write(data['alamat_foto_2'] + nama_fotonya_2);
                                console.log('Sukses Buffer 2'); 
                                errorNya_2=null;
                            }                   
                        });

                        res.send(JSON.stringify({ 
                            status: 200, 
                            status_simpan: true, 
                            pesan: "Sukses Input Data Bergambar.", 
                            tokennyaa: "Hidden", 
                            error_gbr_1: errornya_1, 
                            error_gbr_2: errorNya_2,
                            jumlah_data: results.length, 
                            data: results,
                        }));
                    }
                    else{
                        res.send(JSON.stringify({ 
                            status: 200, 
                            status_simpan: true, 
                            pesan: "Sukses Input Data Tanpa Gambar.", 
                            tokennyaa: "Hidden", 
                            error: null, 
                            jumlah_data: results.length, 
                            data: results,
                        }));
                    }
                }
            });
        }
        else{
            res.send(JSON.stringify({ 
                status: 200, 
                status_simpan: false, 
                pesan: "Token Tidak Sesuai !", 
                tokennyaa: data['token'], 
                error: null, 
                jumlah_data: 0, 
                data: [] 
            }));
        }
    }
    else{
        res.send(JSON.stringify({ 
            status: 200, 
            status_simpan: false, 
            pesan: "Token Kosong !", 
            tokennyaa: 
            data['token'], 
            error: null, 
            jumlah_data: 0, 
            data: [] 
        }));
    }
    console.log(data);
});

app.post("/api/tambah_data", (req, res) => {
    let data = {
        token: req.body.token,
        nama_tabel: req.body.nama_tabel,
        nama_field: req.body.nama_field,
        value_field: req.body.value_field
    };
    let sql;
    let nama_tabel = data['nama_tabel'];
    try {
        if (nama_tabel){
            sql = PublikFungsi.SimpanSingleDebug(base64.decode(data['nama_tabel']),data['nama_field'],data['value_field']);
        }
        else {
            sql = PublikFungsi.SimpanSingleDebug("",data['nama_field'],data['value_field']);
        }
    } catch (error) {
        sql = PublikFungsi.SimpanSingleDebug("",data['nama_field'],data['value_field']);
        console.log(error);
    }    
    res.setHeader('Content-Type', 'application/json');
    if ((!data) || (typeof data != "undefined")){
        if (Token.LoginToken(data['token'])){
            conn.query(sql, data, (err, results) => {        
                if (err){
                    res.send(JSON.stringify({ 
                        status: 200, 
                        status_simpan: false, 
                        pesan: "Datanya Sudah Ada.", 
                        tokennyaa: "Hidden", 
                        error: err, 
                        jumlah_data: 0, 
                        data: results,
                    }));
                }
                else{
                    res.send(JSON.stringify({ 
                        status: 200, 
                        status_simpan: true, 
                        pesan: "Sukses Input Data.", 
                        tokennyaa: "Hidden", 
                        error: null, 
                        jumlah_data: results.length, 
                        data: results,
                    }));
                }
            });
        }
        else{
            res.send(JSON.stringify({ 
                status: 200, 
                status_simpan: false, 
                pesan: "Token Tidak Sesuai !", 
                tokennyaa: data['token'], 
                error: null, 
                jumlah_data: 0, 
                data: [] }));
        }
    }
    else{
        res.send(JSON.stringify({ 
            status: 200, 
            status_simpan: false, 
            pesan: "Token Kosong !", 
            tokennyaa: 
            data['token'], 
            error: null, 
            jumlah_data: 0, 
            data: [] 
        }));
    }
    console.log(data);
});

app.post("/api/tambah_data_multi", (req, res) => {
    let data = {
        token: req.body.token,
        nama_tabel: req.body.nama_tabel,
        nama_field: req.body.nama_field,
        value_field: req.body.value_field
    };
    let sql;
    let nama_tabel = data['nama_tabel'];
    try {
        if (nama_tabel){
            sql = PublikFungsi.SimpanMultiDebug(base64.decode(data['nama_tabel']),data['nama_field'],data['value_field']);
        }
        else {
            sql = PublikFungsi.SimpanMultiDebug("",data['nama_field'],data['value_field']);
        }
    } catch (error) {
        sql = PublikFungsi.SimpanMultiDebug("",data['nama_field'],data['value_field']);
        console.log(error);
    }    
    res.setHeader('Content-Type', 'application/json');
    if ((!data) || (typeof data != "undefined")){
        if (Token.LoginToken(data['token'])){
            conn.query(sql, data, (err, results) => {        
                if (err){
                    res.send(JSON.stringify({ 
                        status: 200, 
                        status_simpan: false, 
                        pesan: "Datanya Sudah Ada.", 
                        tokennyaa: "Hidden", 
                        error: err, 
                        jumlah_data: 0, 
                        data: results,
                    }));
                }
                else{
                    res.send(JSON.stringify({ 
                        status: 200, 
                        status_simpan: true, 
                        pesan: "Sukses Input Data.", 
                        tokennyaa: "Hidden", 
                        error: null, 
                        jumlah_data: results.length, 
                        data: results,
                    }));
                }
            });
        }
        else{
            res.send(JSON.stringify({ 
                status: 200, 
                status_simpan: false, 
                pesan: "Token Tidak Sesuai !", 
                tokennyaa: data['token'], 
                error: null, 
                jumlah_data: 0, 
                data: [] }));
        }
    }
    else{
        res.send(JSON.stringify({ 
            status: 200, 
            status_simpan: false, 
            pesan: "Token Kosong !", 
            tokennyaa: 
            data['token'], 
            error: null, 
            jumlah_data: 0, 
            data: [] 
        }));
    }
    console.log(data);
});

app.post("/api/hapus_data", (req, res) => {
    let data = {
        token: req.body.token,
        nama_tabel: req.body.nama_tabel,
        kondisi: req.body.kondisi,
        alamat_foto: req.body.alamat_foto,
        nama_foto: req.body.nama_foto
    };
    let sql;
    let nama_tabel = data['nama_tabel'];
    try {
        if (nama_tabel){
            sql = PublikFungsi.HapusDebug(base64.decode(data['nama_tabel']),data['kondisi']);
        }
        else {
            sql = PublikFungsi.HapusDebug("",data['kondisi']);
        }
    } catch (error) {
        sql = PublikFungsi.HapusDebug("",data['kondisi']);
        console.log(error);
    }    
    res.setHeader('Content-Type', 'application/json');
    if ((!data) || (typeof data != "undefined")){
        if (Token.LoginToken(data['token'])){
            conn.query(sql, data, (err, results) => {        
                if (err){
                    res.send(JSON.stringify({ 
                        status: 200, 
                        status_hapus: false, 
                        pesan: "Error Hapus Data.", 
                        tokennyaa: "Hidden", 
                        error: err, 
                        jumlah_data: 0, 
                        data: results,
                    }));
                }
                else{
                    if ((data['alamat_foto']) && (data['nama_foto'])){
                        if ((data['alamat_foto']) && (data['nama_foto'])){
                            if (fs.existsSync(data['alamat_foto'] + data['nama_foto'])) {
                                fs.unlinkSync(data['alamat_foto'] + data['nama_foto']);
                            }
                        }

                        res.send(JSON.stringify({ 
                            status: 200, 
                            status_hapus: true, 
                            pesan: "Sukses Hapus Data Beserta Fotonya.", 
                            tokennyaa: "Hidden", 
                            error: null, 
                            jumlah_data: results.length, 
                            data: results,
                        }));
                    }
                    else{
                        res.send(JSON.stringify({ 
                            status: 200, 
                            status_hapus: true, 
                            pesan: "Sukses Hapus Data.", 
                            tokennyaa: "Hidden", 
                            error: null, 
                            jumlah_data: results.length, 
                            data: results,
                        }));
                    }
                }
            });
        }
        else{
            res.send(JSON.stringify({ 
                status: 200, 
                status_hapus: false, 
                pesan: "Token Tidak Sesuai !", 
                tokennyaa: data['token'], 
                error: null, 
                jumlah_data: 0, 
                data: [] }));
        }
    }
    else{
        res.send(JSON.stringify({ 
            status: 200, 
            status_hapus: false, 
            pesan: "Token Kosong !", 
            tokennyaa: 
            data['token'], 
            error: null, 
            jumlah_data: 0, 
            data: [] 
        }));
    }
    console.log(data);
});

app.post("/api/ubah_data", (req, res) => {
    let data = {
        token: req.body.token,
        nama_tabel: req.body.nama_tabel,
        nama_field: req.body.nama_field,
        kondisi: req.body.kondisi
    };
    let sql;
    let nama_tabel = data['nama_tabel'];
    try {
        if (nama_tabel){
            sql = PublikFungsi.UbahDebug(base64.decode(data['nama_tabel']),data['nama_field'],data['kondisi']);
        }
        else {
            sql = PublikFungsi.UbahDebug("",data['nama_field'],data['kondisi']);
        }
    } catch (error) {
        sql = PublikFungsi.UbahDebug("",data['nama_field'],data['kondisi']);
        console.log(error);
    }
    res.setHeader('Content-Type', 'application/json');
    if ((!data) || (typeof data != "undefined")){
        if (Token.LoginToken(data['token'])){
            conn.query(sql, data, (err, results) => {        
                if (err){
                    res.send(JSON.stringify({ 
                        status: 200, 
                        status_ubah: false, 
                        pesan: "Error Ubah Data.", 
                        tokennyaa: "Hidden", 
                        error: err, 
                        jumlah_data: 0, 
                        data: results,
                    }));
                }
                else{
                    res.send(JSON.stringify({ 
                        status: 200, 
                        status_ubah: true, 
                        pesan: "Sukses Ubah Data.", 
                        tokennyaa: "Hidden", 
                        error: null, 
                        jumlah_data: results.length, 
                        data: results,
                    }));
                }
            });
        }
        else{
            res.send(JSON.stringify({ 
                status: 200, 
                status_ubah: false, 
                pesan: "Token Tidak Sesuai !", 
                tokennyaa: data['token'], 
                error: null, 
                jumlah_data: 0, 
                data: [] }));
        }
    }
    else{
        res.send(JSON.stringify({ 
            status: 200, 
            status_ubah: false, 
            pesan: "Token Kosong !", 
            tokennyaa: 
            data['token'], 
            error: null, 
            jumlah_data: 0, 
            data: [] 
        }));
    }
    console.log(data);
});

app.put("/api/ubah_data_gbr", (req, res) => {
    let data = {
        token: req.body.token,
        nama_tabel: req.body.nama_tabel,
        nama_field: req.body.nama_field,
        kondisi: req.body.kondisi,
        gbr_base64 : req.body.gbr_base64,
        alamat_foto : req.body.alamat_foto,
        nama_foto : req.body.nama_foto,
        nama_foto_lama : req.body.nama_foto_lama
    };
    let sql;
    let nama_tabel = data['nama_tabel'];
    try {
        if (nama_tabel){
            sql = PublikFungsi.UbahDebug(base64.decode(data['nama_tabel']),data['nama_field'],data['kondisi']);
        }
        else {
            sql = PublikFungsi.UbahDebug("",data['nama_field'],data['kondisi']);
        }
    } catch (error) {
        sql = PublikFungsi.UbahDebug("",data['nama_field'],data['kondisi']);
        console.log(error);
    }
    res.setHeader('Content-Type', 'application/json');
    if ((!data) || (typeof data != "undefined")){
        if (Token.LoginToken(data['token'])){
            conn.query(sql, data, (err, results) => {        
                if (err){
                    res.send(JSON.stringify({ 
                        status: 200, 
                        status_ubah: false, 
                        pesan: "Error Ubah Data.", 
                        tokennyaa: "Hidden", 
                        error: err, 
                        jumlah_data: 0, 
                        data: results,
                    }));
                }
                else{
                    if ((data['gbr_base64']) && (data['alamat_foto']) && (data['nama_foto'])){
                        const buffer = Buffer.from(data['gbr_base64'], "base64");
                        Jimp.read(buffer, (err, res_jimp) => {
                            if (err) {
                                console.log('Error : ' + err);
                                res.send(JSON.stringify({ 
                                    status: 200, 
                                    status_ubah: false, 
                                    pesan: "Sukses ubah data tetapi error ubah gambar.", 
                                    tokennyaa: "Hidden", 
                                    error: null, 
                                    jumlah_data: 0, 
                                    data: results,
                                }));
                            }
                            else {                                   
                                if ((data['alamat_foto']) && (data['nama_foto_lama'])){
                                    if (fs.existsSync(data['alamat_foto'] + data['nama_foto_lama'])) {
                                        fs.unlinkSync(data['alamat_foto'] + data['nama_foto_lama']);
                                    }
                                }
                                
                                res_jimp.quality(100).write(data['alamat_foto'] + data['nama_foto']);
                                res.send(JSON.stringify({ 
                                    status: 200, 
                                    status_ubah: true, 
                                    pesan: "Sukses Ubah Data dan Ubah Gambar.", 
                                    tokennyaa: "Hidden", 
                                    error: null, 
                                    jumlah_data: results.length, 
                                    data: results,
                                }));
                            }                            
                        });
                    }
                    else {
                        res.send(JSON.stringify({ 
                            status: 200, 
                            status_ubah: true, 
                            pesan: "Sukses Ubah Data Saja.", 
                            tokennyaa: "Hidden", 
                            error: null, 
                            jumlah_data: results.length, 
                            data: results,
                        }));
                    }
                }
            });
        }
        else{
            res.send(JSON.stringify({ 
                status: 200, 
                status_ubah: false, 
                pesan: "Token Tidak Sesuai !", 
                tokennyaa: data['token'], 
                error: null, 
                jumlah_data: 0, 
                data: [] }));
        }
    }
    else{
        res.send(JSON.stringify({ 
            status: 200, 
            status_ubah: false, 
            pesan: "Token Kosong !", 
            tokennyaa: 
            data['token'], 
            error: null, 
            jumlah_data: 0, 
            data: [] 
        }));
    }
    console.log(data);
});

app.post("/api/login_barcode", (req, res) => {    
    let data = {
        token:req.body.token,
        hasil_barcode: req.body.hasil_barcode
    };
    let sql,hasil_barcode,hasil_pisah;
    hasil_barcode=base64.decode(data['hasil_barcode']);
    hasil_pisah=hasil_barcode.split('_');
    sql = 'SELECT * FROM mediasoft_pengguna WHERE user_pengguna = "' + 
    hasil_pisah[1] + '"';
    console.log(sql);
    res.setHeader('Content-Type', 'application/json');
    if ((data['token']) && (data['hasil_barcode'])){
        if (Token.LoginToken(data['token'])){
            conn.query(sql, data, (err, results) => {        
                if (err) {
                    res.send(JSON.stringify({ 
                        status: 200, 
                        pesan: "Error.", 
                        status_tampil: false, 
                        tokennyaa: "Hidden", 
                        error: err, 
                        jumlah_data: 0, 
                        data: results,
                    }));
                }
                else if (results.length > 0){
                    res.send(JSON.stringify({ 
                        status: 200, 
                        pesan: "Datanya ada.", 
                        status_tampil: true, 
                        tokennyaa: "Hidden", 
                        error: null, 
                        jumlah_data: results.length, 
                        data: results,
                    }));
                }
                else{
                    res.send(JSON.stringify({ 
                        status: 200, 
                        pesan: "Belum Ada datanya.", 
                        status_tampil: false, 
                        tokennyaa: "Hidden", 
                        error: null, 
                        jumlah_data: results.length, 
                        data: results,
                    }));
                }
            });
        }
        else{
            res.send(JSON.stringify({ 
                status: 200, 
                pesan: "Token Tidak Sesuai !", 
                status_tampil: false, 
                tokennyaa: data['token'], 
                error: null, 
                jumlah_data: 0, 
                data: [] 
            }));
        }
    }
    else{
        res.send(JSON.stringify({ 
            status: 200, 
            pesan: "Inputan Kurang !", 
            status_tampil: false, 
            tokennyaa: data['token'], 
            error: null, 
            jumlah_data: 0, 
            data: [] 
        }));
    }
    console.log(data);
});

app.post("/api/kosongkan_data", (req, res) => {
    let data = {
        token: req.body.token,
        nama_tabel: req.body.nama_tabel
    };
    let sql;
    let nama_tabel = data['nama_tabel'];
    try {
        if (nama_tabel){
            sql = PublikFungsi.KosongkanDataDebug(base64.decode(data['nama_tabel']));
        }
        else {
            sql = PublikFungsi.KosongkanDataDebug("");
        }
    } catch (error) {
        sql = PublikFungsi.KosongkanDataDebug("");
        console.log(error);
    }    
    res.setHeader('Content-Type', 'application/json');
    if ((!data) || (typeof data != "undefined")){
        if (Token.LoginToken(data['token'])){
            conn.query(sql, data, (err, results) => {        
                if (err){
                    res.send(JSON.stringify({ 
                        status: 200, 
                        status_kosongkan: false, 
                        pesan: "Error Kosongkan Data.", 
                        tokennyaa: "Hidden", 
                        error: err, 
                        jumlah_data: 0, 
                        data: results,
                    }));
                }
                else{
                    res.send(JSON.stringify({ 
                        status: 200, 
                        status_kosongkan: true, 
                        pesan: "Sukses Kosongkan Data.", 
                        tokennyaa: "Hidden", 
                        error: null, 
                        jumlah_data: 0, 
                        data: results,
                    }));
                }
            });
        }
        else{
            res.send(JSON.stringify({ 
                status: 200, 
                status_kosongkan: false, 
                pesan: "Token Tidak Sesuai !", 
                tokennyaa: data['token'], 
                error: null, 
                jumlah_data: 0, 
                data: [] }));
        }
    }
    else{
        res.send(JSON.stringify({ 
            status: 200, 
            status_kosongkan: false, 
            pesan: "Token Kosong !", 
            tokennyaa: 
            data['token'], 
            error: null, 
            jumlah_data: 0, 
            data: [] 
        }));
    }
    console.log(data);
});

app.get("/gambar", (req, res) => {
    let data = {
        path_req : req.query.path_req,
        nama_foto_req : req.query.nama_foto_req
    };
    console.log(data);
    let alamat_path1;
    if ((data['path_req']) && (data['nama_foto_req'])){
        alamat_path1 = path.join(__dirname + '/' + data['path_req'] + data['nama_foto_req']);               
    }
    else{
        alamat_path1 = path.join(__dirname + "/gambar/");
    }
    console.log("path : " + alamat_path1);
    res.sendFile(alamat_path1);
});

//Server listening
var server = app.listen(81, () => {
    var host = server.address().address;
    var port = server.address().port;
    console.log("MediaSoft Timbangan. Server started on port "+ port +"..." + "\n");
    console.log("Example app listening at http://"+ host +":" + port, host, port);
});