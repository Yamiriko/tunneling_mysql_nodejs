const sha256js = require('js-sha256');

var token_tampil_data = function () {
    let showTampil;
    showTampil = "TunnellingDelphi2021";
    console.log("Token Aslinya : " + showTampil);
    console.log("Token Encode : " + sha256js(showTampil));

    return sha256js(showTampil);
}

var login =  function (isi_token) {
    let nilai;
    let token_sistem = token_tampil_data();
    if (!isi_token){
        nilai = false;
    }
    else if (!token_sistem){
        nilai = false;
    }
    else{
        if (isi_token === token_sistem){
            nilai = true;
        }
        else{
            nilai = false;
        }
    }
    console.log("Isi Token : " + isi_token);
    console.log("Token Sistem : " + token_sistem);
    console.log("Nilai : " + nilai);
    return nilai;
}

var login_deploy =  function (isi_token) {
    let nilai;
    let token_sistem = token_tampil_data_deploy();
    if (!isi_token){
        nilai = false;
    }
    else if (!token_sistem){
        nilai = false;
    }
    else{
        if (isi_token === token_sistem){
            nilai = true;
        }
        else{
            nilai = false;
        }
    }
    return nilai;
}

module.exports = {
    Token: function () {
        return token_tampil_data();
    },
    LoginToken: function (isi_token) {
        return login(isi_token);
    },
    LoginDeploy: function (isi_token) {
        return login_deploy(isi_token);
    }
};