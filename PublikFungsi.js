const momentjs = require("moment-timezone");

var kueri_cari_data_debug = function(nama_tabel,nama_field,kondisi){
    let sql;
    if ((nama_tabel) && (kondisi) && (kondisi)){
        sql = 'SELECT ' + nama_field + ' FROM ' + nama_tabel + ' ' + kondisi;
        console.log("Kueri Lengkap: \n" + sql);
    }
    else{
        sql = "";
        console.log("Parameter Kueri Belum Lengkap !");
        console.log("nama_tabel : " + nama_tabel);
        console.log("nama_field : " + nama_field);
        console.log("kondisi : " + kondisi);
    }
    return sql;
}

var kueri_simpan_data_single_debug = function(nama_tabel,nama_field,value_field){
    let sql;
    if ((nama_tabel) && (nama_field) && (value_field)){
        sql = 'INSERT INTO '+ nama_tabel +'('+ nama_field +') VALUES('+ value_field +')';
        console.log("Kueri Lengkap: \n" + sql);
    }
    else{
        sql = "";
        console.log("Parameter Kueri Belum Lengkap !");
        console.log("nama_tabel : " + nama_tabel);
        console.log("nama_field : " + nama_field);
        console.log("value_field : " + value_field);
    }
    return sql;
}

var kueri_simpan_data_single_ignore = function(nama_tabel,nama_field,value_field){
    let sql;
    if ((nama_tabel.length > 0) && (nama_field.length > 0) && (value_field.length > 0)){
        sql = 'INSERT IGNORE INTO '+ nama_tabel +'('+ nama_field +') VALUES('+ value_field +')';
        // console.log("Kueri Lengkap: \n" + sql);
    }
    else{
        sql = "";
        console.log("Parameter Kueri Belum Lengkap !");
        console.log("nama_tabel : " + nama_tabel);
        console.log("nama_field : " + nama_field);
        console.log("value_field : " + value_field);
    }
    return sql;
}

var kueri_simpan_data_multi_debug = function(nama_tabel,nama_field,value_field){
    let sql;
    if ((nama_tabel) && (nama_field) && (value_field)){
        sql = 'INSERT INTO '+ nama_tabel +'('+ nama_field +') VALUES '+ value_field +'';
        console.log("Kueri Lengkap: \n" + sql);
    }
    else{
        sql = "";
        console.log("Parameter Kueri Belum Lengkap !");
        console.log("nama_tabel : " + nama_tabel);
        console.log("nama_field : " + nama_field);
        console.log("value_field : " + value_field);
    }
    return sql;
}

//nama_tabel,nama_field,value_field,gbrBase64
var kueri_simpan_data_base64 = function(nama_tabel,nama_field,field_base64,value_field,gbrBase64){
    let sql;

    // let base64Data = req.rawBody.replace(/^data:image\/png;base64,/, "");

    if ((nama_tabel) && (nama_field) && (value_field) && (field_base64) && (gbrBase64)){
        sql = 'INSERT INTO '+ nama_tabel +'('+ nama_field +','+ field_base64 +') VALUES('+ value_field +','+ gbrBase64 +')';
        // console.log("Kueri Lengkap: \n" + sql);
    }
    else{
        sql = "";
        console.log("Parameter Kueri Belum Lengkap !");
        console.log("nama_tabel : " + nama_tabel);
        console.log("nama_field : " + nama_field);
        console.log("field_base64 : " + field_base64);
        console.log("value_field : " + value_field);
        console.log("field_base64 : " + field_base64);
    }
    return sql;    
}

var kueri_ubah_data_debug = function(nama_tabel,nama_field,kondisi){
    let sql;    
    if ((nama_tabel) && (nama_field) && (kondisi)){
        sql = "UPDATE "+ nama_tabel +" SET "+ nama_field +" WHERE "+ kondisi +"";
        console.log("Kueri Lengkap: \n" + sql);
    }
    else{
        sql = "";
        console.log("Parameter Kueri Belum Lengkap !");
        console.log("nama_tabel : " + nama_tabel);
        console.log("kondisi : " + kondisi);
    }
    return sql;
}

var kueri_hapus_data_debug = function(nama_tabel,kondisi){
    let sql;    
    if ((nama_tabel) && (kondisi)){
        sql = "DELETE FROM "+ nama_tabel +" WHERE "+ kondisi +"";
        console.log("Kueri Lengkap: \n" + sql);
    }
    else{
        sql = "";
        console.log("Parameter Kueri Belum Lengkap !");
        console.log("nama_tabel : " + nama_tabel);
        console.log("kondisi : " + kondisi);
    }
    return sql;
}

var kosongkan_data_debug = function(nama_tabel){
    let sql;    
    if (nama_tabel){
        sql = "TRUNCATE TABLE `"+ nama_tabel + "`";
        console.log("Kueri Lengkap: \n" + sql);
    }
    else{
        sql = "";
        console.log("Parameter Kueri Belum Lengkap !");
        console.log("nama_tabel : " + nama_tabel);
    }
    return sql;
}

var urlToFile = function (url, filename, mimeType) {
    return (fetch(url)
        .then(function(res){return res.arrayBuffer();})
        .then(function(buf){return new File([buf], filename,{type:mimeType});})
    );

    /*
    Usage example:
    urltoFile('data:text/plain;base64,aGVsbG8gd29ybGQ=', 'hello.txt','text/plain')
    .then(function(file){ console.log(file);});
    */
}

var dataURLtoFile = function (dataurl, filename) {
    var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), 
    n = bstr.length, 
    u8arr = new Uint8Array(n);
        
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, {type:mime});

    /*
    var file = dataURLtoFile('data:text/plain;base64,aGVsbG8gd29ybGQ=','hello.txt');
    console.log(file);
    */
}

var waktu_sekarang = function(formatnya){
    //DDMMYYYYHH
    let tampil_sekarang = momentjs().locale("ID").tz('Asia/Jakarta').format(formatnya);
    return tampil_sekarang;
}

module.exports = {
    CariDataDebug: function (nama_tabel,nama_field,kondisi) {
        return kueri_cari_data_debug(nama_tabel,nama_field,kondisi);
    },
    SimpanSingleDebug: function (nama_tabel,nama_field,value_field) {
        return kueri_simpan_data_single_debug(nama_tabel,nama_field,value_field);
    },
    SimpanSingleIgnore: function (nama_tabel,nama_field,value_field) {
        return kueri_simpan_data_single_ignore(nama_tabel,nama_field,value_field);
    },
    SimpanMulti: function (nama_tabel,nama_field,value_field) {
        return kueri_simpan_data_multi(nama_tabel,nama_field,value_field);
    },
    SimpanMultiDebug: function (nama_tabel,nama_field,value_field) {
        return kueri_simpan_data_multi_debug(nama_tabel,nama_field,value_field);
    },
    SimpanBase64 : function (nama_tabel,nama_field,field_base64,value_field,gbrBase64) {
        return kueri_simpan_data_base64(nama_tabel,nama_field,field_base64,value_field,gbrBase64);
    },
    UbahDebug: function (nama_tabel,nama_field,kondisi) {
        return kueri_ubah_data_debug(nama_tabel,nama_field,kondisi);
    },
    HapusDebug: function (nama_tabel,kondisi) {
        return kueri_hapus_data_debug(nama_tabel,kondisi);
    },
    KosongkanDataDebug: function (nama_tabel) {
        return kosongkan_data_debug(nama_tabel);
    },
    UrlToFile: function (url, filename, mimeType) {
        return urlToFile(url, filename, mimeType);
    },
    DataUrlToFile: function (dataurl, filename) {
        return dataURLtoFile(dataurl, filename);
    },
    WaktuSekarang: function (formatnya) {
        return waktu_sekarang(formatnya);
    }
};