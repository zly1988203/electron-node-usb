const ipc = require('electron').ipcRenderer;

document.getElementById('FindPort_2Bnt').onclick = function () { 
    ipc.send('OnFindPort_2Bnt'); 
}

document.getElementById('FindPort_3Bnt').onclick = function () { ipc.send('OnFindPort_3Bnt'); }

document.getElementById('sWriteExBnt').onclick = function () { ipc.send('OnsWriteExBnt'); }

document.getElementById('sWrite_2ExBnt').onclick = function () { ipc.send('OnsWrite_2ExBnt'); }

document.getElementById('sWriteEx_NewBnt').onclick = function () { ipc.send('OnsWriteEx_NewBnt'); }

document.getElementById('sWrite_2Ex_NewBnt').onclick = function () { ipc.send('OnsWrite_2Ex_NewBnt'); }

document.getElementById('YWriteBnt').onclick = function () { ipc.send('OnYWriteBnt'); }

document.getElementById('YReadBnt').onclick = function () { ipc.send('OnYReadBnt'); }

document.getElementById('YWriteStringBnt').onclick = function () { ipc.send('OnYWriteStringBnt'); }

document.getElementById('YReadStringBnt').onclick = function () { ipc.send('OnYReadStringBnt'); }

document.getElementById('YWriteStringWithLenBnt').onclick = function () { ipc.send('OnYWriteStringWithLenBnt'); }

document.getElementById('YReadStringWithLenBnt').onclick = function () { ipc.send('OnYReadStringWithLenBnt'); }

document.getElementById('SetCal_2Bnt').onclick = function () { ipc.send('OnSetCal_2Bnt'); }

document.getElementById('EncStringBnt').onclick = function () { ipc.send('OnEncStringBnt'); }

document.getElementById('CalBnt').onclick = function () { ipc.send('OnCalBnt'); }

document.getElementById('SetCal_NewBnt').onclick = function () { ipc.send('OnSetCal_NewBnt'); }

document.getElementById('EncString_NewBnt').onclick = function () { ipc.send('OnEncString_NewBnt'); }

document.getElementById('Cal_NewBnt').onclick = function () { ipc.send('OnCal_NewBnt'); }

document.getElementById('ReSetBnt').onclick = function () { ipc.send('OnReSetBnt'); }

document.getElementById('Sm2TestBnt').onclick = function () { ipc.send('OnSm2TestBnt'); }


window.onload = init();
function init() {
    ipc.send('onFindPort');
}

ipc.on('ErrMsg', function (event, ErrMsg) {
    alert(ErrMsg);
})

ipc.on('ErrMsgEx', function (event, ErrMsg,lasterror) {
    alert(ErrMsg+lasterror.toString());
})

ipc.on('GetUSBKeyInfo', function (event, ID,Ver,VerEx) {
    IDTxt.value=ID;
    VerTxt.value=Ver;
    VerExTxt.value=VerEx;
})

ipc.on('Msg', function (event, Msg) {
    alert(Msg);
})

