const {ipcMain} = require('electron')

var usbDetect = require('usb-detection');


// Do some detection
usbDetect.startMonitoring();

var IF2K=require('./IF2K.js');

var lasterror;

var mIF2K=new IF2K();

var bIsFoundUsbKey=false;

var g_Event;

var KeyPath=null;

function SendErrMsg(event,ErrMsg)
{
    event.sender.send('ErrMsg', ErrMsg)
}

function SendMsg(event,Msg)
{
    event.sender.send('Msg', Msg)
}

function SendErrMsgEx(event,ErrMsg)
{
    event.sender.send('ErrMsgEx', ErrMsg,lasterror);
}


function FindUsbKey()
{
    var ErrGetVer="获取锁的版本时错误，错误码是："
    var ErrGetVerEx="获取锁的扩展版本时错误，错误码是："
    var ErrGetID="获取锁的ID时错误，错误码是："
    var MsgMoreUKey="发现系统中有多把锁，请只插入要操作的锁。"
    var MsgNoUKey="未能在系统中发现加密锁."
   
    KeyPath=mIF2K.FindPort(1);
    lasterror=mIF2K.GetLastError();
    if (lasterror==0)
    {
        SendErrMsg(g_Event,MsgMoreUKey);return ;
    }
    
    KeyPath=mIF2K.FindPort(0);
    lasterror=mIF2K.GetLastError();
    if (lasterror!=0)
    {
        g_Event.sender.send('GetUSBKeyInfo', '','','');
        SendErrMsg(g_Event,MsgNoUKey);return ;
    }
    {

        var Ver=mIF2K.NT_GetIDVersion(KeyPath);
        lasterror=mIF2K.GetLastError();
        if(lasterror!=0)
        {
            SendErrMsgEx(g_Event,ErrGetVer);return ;
        }
        var VerEx=mIF2K.NT_GetIDVersionEx(KeyPath);
        lasterror=mIF2K.GetLastError();
        if(lasterror!=0)
        {
            SendErrMsgEx(g_Event,ErrGetVerEx);return ;
        }
        
        IDInfo=mIF2K.GetID(KeyPath);
        lasterror=mIF2K.GetLastError();
        if(lasterror!=0)
        {
            SendErrMsgEx(g_Event,ErrGetID);return ;
        }
        g_Event.sender.send('GetUSBKeyInfo', IDInfo.ID_1+IDInfo.ID_2,Ver.toString(),VerEx.toString());

        
    } 

}

ipcMain.on('onFindPort', (event, arg) => {

    g_Event=event;

    FindUsbKey();
    
   });


  ////////////////LB & RB /////////////
  ipcMain.on('OnFindPort_2Bnt', (event, arg) => {
    //使用普通算法一来查找指定的加密锁
    /*查找是否存在指定的加密狗,如果找到，则返回0,
    注意！！！！！！！！！这里的参数“1”及参数“134226688”，随每个软件开发商的不同而不同，因为每个开发商的加密锁的加密算法都不一样，
    1、运行我们的开发工具，
    2、在“算法设置及测试页”-》“加密”-》“请输入要加密的数据”那里随意输入一个数
    3、然后单击“加密数据(使用普通算法一)”
    4、然后就会返回对应的数据(即“加密后的数据”)，
    然后将输入的数和返回的数替换这里的参数“1”及参数“134226688”*/
    var mKeyPath=mIF2K.FindPort_2( 1, 134226688) ;
    lasterror=mIF2K.GetLastError()
    if (lasterror!= 0)
       SendErrMsgEx(event,"未找到指定的加密锁,错误码是:");
    else
      SendMsg(event,"找到指定的加密锁");
  })

  ipcMain.on('OnFindPort_3Bnt', (event, arg) => {
    
     //使用普通算法二来查找指定的加密锁
    /*查找是否存在指定的加密狗,如果找到，则返回0,
    注意！！！！！！！！！这里的参数“1”及参数“134226688”，随每个软件开发商的不同而不同，因为每个开发商的加密锁的加密算法都不一样，
    1、运行我们的开发工具，
    2、在“算法设置及测试页”-》“加密”-》“请输入要加密的数据”那里随意输入一个数
    3、然后单击“加密数据(使用普通算法二)”
    4、然后就会返回对应的数据(即“加密后的数据”)，
    然后将输入的数和返回的数替换这里的参数“1”及参数“134226688”*/
    var mKeyPath=mIF2K.FindPort_3( 1, 134226688) ;
    lasterror=mIF2K.GetLastError()
    if (lasterror!= 0)
       SendErrMsgEx(event,"未找到指定的加密锁,错误码是:");
    else
      SendMsg(event,"找到指定的加密锁");    
  
  })

  ipcMain.on('OnsWriteExBnt', (event, arg) => {
    
     //对输入的数进行加密运算，然后读出加密运算后的结果(使用普通算法一)
     var result=mIF2K.sWriteEx(1,KeyPath);
     lasterror=mIF2K.GetLastError();
     if (lasterror!= 0) { SendErrMsgEx(event,"加密错误,错误码是："); return; }
     SendMsg(event,"已成功进行加密运算，加密后的数据是：" + result.toString());

  
  })

  ipcMain.on('OnsWrite_2ExBnt', (event, arg) => {
    
    //对输入的数进行解密运算，然后读出解密运算后的结果(使用普通算法一)
    var result = mIF2K.sWrite_2Ex(134226688,KeyPath);
    lasterror=mIF2K.GetLastError();
    if (lasterror!= 0) { SendErrMsgEx(event,"解密错误,错误码是："); return; }
    SendMsg(event,"已成功进行解密运算，解密后的数据是：" + result.toString());

  
  })

  ipcMain.on('OnsWriteEx_NewBnt', (event, arg) => {
    
    //对输入的数进行加密运算，然后读出加密运算后的结果(使用普通算法二)
    var result = mIF2K.sWriteEx_New(1,KeyPath);
    lasterror=mIF2K.GetLastError();
    if (lasterror!= 0) { SendErrMsgEx(event,"加密错误,错误码是："); return; }
    SendMsg(event,"已成功进行加密运算，加密后的数据是：" + result.toString());

  
  })

  ipcMain.on('OnsWrite_2Ex_NewBnt', (event, arg) => {
    
     //对输入的数进行解密运算，然后读出解密运算后的结果(使用普通算法二)
     var result = mIF2K.sWrite_2Ex_New(134226688,KeyPath);
     lasterror=mIF2K.GetLastError();
     if (lasterror!= 0) { SendErrMsgEx(event,"解密错误,错误码是："); return; }
     SendMsg(event,"已成功进行解密运算，解密后的数据是：" + result.toString());

  
  })

  ipcMain.on('OnYWriteBnt', (event, arg) => {
    
    //向加密锁的指定的地址中写入指定的数据，使用默认的写密码
    var len = 300;//要写入300个字节的数据
    var address = 0;//要写入的地址
    var buf = new Uint8Array(len);
    var n;
    for (n = 0; n < 300; n++)
    {
        buf[n] = n;
    }
    lasterror = mIF2K.YWrite(buf, address, len, "ffffffff", "ffffffff",KeyPath);
    if (lasterror != 0) { SendErrMsgEx(event,"写储存器数据失败,错误码是："); return; }
    SendMsg(event,"写储存器数据成功。");
  
  })

  ipcMain.on('OnYReadBnt', (event, arg) => {
    
    //从加密锁的指定的地址中读取一批数据,使用默认的读密码
    var len = 300;//要读取300个字节的数
    var address = 0; //要读取的起始地址

    var buf = mIF2K.YRead(address, len, "ffffffff", "ffffffff",KeyPath);
    lasterror=mIF2K.GetLastError();
    if (lasterror != 0) { SendErrMsgEx(event,"读取储存器失败,错误码是："); return; }
    SendMsg(event,"读取储存器数据成功");
  })

  ipcMain.on('OnYWriteStringBnt', (event, arg) => {
    
    //注意，如果是普通单片机芯片，储存器的写次数是有限制的，写次数为1000次，读不限制，如果是智能芯片，写的次数为10万次
    //写入字符串到加密锁中,使用默认的写密码
    
    var InString = "加密锁";
    var ret = mIF2K.YWriteString(InString, 0, "ffffffff", "ffffffff",KeyPath);
    if (ret < 0) { lasterror=ret;SendErrMsgEx(event,"写字符串失败,错误码是："); return; }
    SendMsg(event,"写入成功。写入的字符串的长度是：" + ret);
     
  
  })

  ipcMain.on('OnYReadStringBnt', (event, arg) => {
    
     //从加密锁中读取字符串,使用默认的读密码
     var Address=0
     var mylen = 9;//注意这里的6是长度，要与写入的字符串的长度相同
     var outstring=mIF2K.YReadString( Address, mylen, "ffffffff", "ffffffff",KeyPath) ;
     lasterror=mIF2K.GetLastError();
     if (lasterror!= 0) { SendErrMsgEx(event,"读字符串失败,错误码是："); return; }
     SendMsg(event,"读字符串成功：" + outstring);

  
  })

  ipcMain.on('OnYWriteStringWithLenBnt', (event, arg) => {
    
    //注意，如果是普通单片机芯片，储存器的写次数是有限制的，写次数为1000次，读不限制，如果是智能芯片，写的次数为10万次
    // 这个例子与上面的不同之处是，可以写入非固定长度的字符串，它是先将字符串的长度写入到首地址，然后再写入相应的字符串
    
    var addr = 0;//要写入的地址
    var InString;
    var buf = new Uint8Array(1);
    InString = "加密锁";


    //写入字符串到地址1
    OutLen = mIF2K.YWriteString(InString, addr+1, "ffffffff", "ffffffff",KeyPath);
    if (OutLen < 0)
    {
        lasterror=OutLen;
        SendErrMsgEx(event,"写入字符串错误。错误码：" ); return;
    }

    buf[0] = OutLen;
    //写入字符串的长度到地址0
    lasterror = mIF2K.YWrite(buf, addr, 1, "ffffffff", "ffffffff",KeyPath);
    if (lasterror != 0)
        SendErrMsgEx(event,"写入字符串长度错误。错误码：" );
    else
        SendMsg(event,"写入字符串成功");
  
  })

  ipcMain.on('OnYReadStringWithLenBnt', (event, arg) => {
    
    //这个例子与上面的不同之处是，可以读取非固定长度的字符串，它是先从首地址读取字符串的长度，然后再读取相应的字符串
    
    var nlen;
    var addr = 0;//要读取的地址
    
    //先从地址0读到以前写入的字符串的长度
    var buf  = mIF2K.YRead( addr, 1, "ffffffff", "ffffffff",KeyPath);
    lasterror=mIF2K.GetLastError();
    nlen = buf[0];
    if (lasterror != 0)
    {
        SendErrMsgEx(event,"读取字符串长度错误。错误码："); return;
    }
    //再读取相应长度的字符串
    var outstring = mIF2K.YReadString(addr+1, nlen, "ffffffff", "ffffffff",KeyPath);
    lasterror=mIF2K.GetLastError();
    if (lasterror != 0)
        SendErrMsgEx(event,"读取字符串错误。错误码：" );
    else
        SendMsg(event,"已成功读取字符串：" + outstring);

  
  })

  ipcMain.on('OnSetCal_2Bnt', (event, arg) => {
    
     //设置增强算法密钥一
    //注意：密钥为不超过32个的0-F字符，例如：1234567890ABCDEF1234567890ABCDEF,不足32个字符的，系统会自动在后面补0
    
    var Key = "1234567890ABCDEF1234567890ABCDEF";
    lasterror = mIF2K.SetCal_2(Key,KeyPath);
    if (lasterror != 0) { SendErrMsgEx(event,"设置增强算法密钥错误,错误码是："); return; }
    SendMsg(event,"已成功设置了增强算法密钥");
   
  
  })

  ipcMain.on('OnEncStringBnt', (event, arg) => {
    
    //'使用增强算法一对字符串进行加密
    var nlen;
    var outstring="";
    InString = "加密锁";
    nlen = InString.length + 1;
    if (nlen < 8) nlen = 8;
    var outstring = mIF2K.EncString(InString ,KeyPath);
    lasterror=mIF2K.GetLastError();
    if (lasterror != 0) { SendErrMsgEx(event,"加密字符串出现错误,错误码是："); return; }
    SendMsg(event,"已成功对字符串进行加密，加密后的字符串为：" + outstring);
    //推荐加密方案：生成随机数，让锁做加密运算，同时在程序中端使用代码做同样的加密运算，然后进行比较判断。
    //'以下是对应的加密代码，可以参考使用
      var out_str;
      out_str = mIF2K.StrEnc("我们是加密锁", "1234567890ABCDEF1234567890ABCDEF");
      out_str = mIF2K.StrDec(out_str, "1234567890ABCDEF1234567890ABCDEF");

  
  })

  ipcMain.on('OnCalBnt', (event, arg) => {
    
    //使用增强算法一对二进制数据进行加密
    
    var n;
    var InBuf = new Uint8Array(8);

    for (n = 0; n < 8; n++)
    {
        InBuf[n] = n;
    }
    var OutBuf = mIF2K.Cal(InBuf,KeyPath);
    lasterror=mIF2K.GetLastError();
    if (lasterror != 0) { SendErrMsgEx(event,"加密数据时失败,错误码是："); return; }
    SendMsg(event,"已成功对二进制数据进行了加密");
    //推荐加密方案：生成随机数，让锁做加密运算，同时在程序中端使用代码做同样的加密运算，然后进行比较判断。
    //以下是对应的加密代码，可以参考使用
    
    /*var outbuf_2=mIF2K.EnCode(InBuf, "1234567890ABCDEF1234567890ABCDEF");
    var outbuf_3=mIF2K.DeCode(outbuf_2, "1234567890ABCDEF1234567890ABCDEF");*/

  
  })

  ipcMain.on('OnSetCal_NewBnt', (event, arg) => {
    
    //设置增强算法密钥二
    //注意：密钥为不超过32个的0-F字符，例如：1234567890ABCDEF1234567890ABCDEF,不足32个字符的，系统会自动在后面补0

    var Key = "ABCDEF1234567890ABCDEF1234567890";
    lasterror = mIF2K.SetCal_New(Key,KeyPath);
    if (lasterror != 0) { SendErrMsgEx(event,"设置增强算法密钥错误,错误码是："); return; }
    SendMsg(event,"已成功设置了增强算法密钥");
  })

  ipcMain.on('OnEncString_NewBnt', (event, arg) => {
    
     //'使用增强算法二对字符串进行加密
     var nlen;
     var InString;
     InString = "加密锁";
     nlen = InString.length + 1;
     if (nlen < 8) nlen = 8;
     var  outstring= mIF2K.EncString_New(InString,KeyPath);
     lasterror=mIF2K.GetLastError();
     if (lasterror != 0) { SendErrMsgEx(event,"加密字符串出现错误,错误码是："); return; }
     SendMsg(event,"已成功对字符串进行加密，加密后的字符串为：" + outstring);

  
  })

  ipcMain.on('OnCal_NewBnt', (event, arg) => {
    
     //使用增强算法二对二进制数据进行加密
     
     var n;
     var InBuf = new Uint8Array(8);

     for (n = 0; n < 8; n++)
     {
         InBuf[n] = (n);
     }
     var OutBuf = mIF2K.Cal_New(InBuf,KeyPath);
     lasterror=mIF2K.GetLastError();
     if (lasterror != 0) { SendErrMsgEx(event,"加密数据时失败,错误码是："); return; }
     SendMsg(event,"已成功对二进制数据进行了加密");

  
  })

  ipcMain.on('OnReSetBnt', (event, arg) => {
    
     //用于将加密锁数据全部初始化为0，只适用于版本号大于或等于9以上的锁
     lasterror = mIF2K.ReSet(KeyPath);
     if (lasterror != 0)
     {
        SendErrMsgEx(event,"初始化失败,错误码是：");
         return;
     }

     //初始化成功，所有数据将回复到0的状态，读密码及新密码都全部为0
     //以下代码再将它重新设置为原来出厂时的FFFFFFFF-FFFFFFF
     //先设置写密码
     lasterror = mIF2K.SetWritePassword("00000000", "00000000", "FFFFFFFF", "FFFFFFFF",KeyPath);
     if (lasterror != 0)
     {
        SendErrMsgEx(event,"设置写密码错误。错误码是："); return;
     }
     //再设置读密码,注意，设置读密码是用原"写"密码进行设置，而不是原“读”密码
     lasterror = mIF2K.SetReadPassword("FFFFFFFF", "FFFFFFFF", "FFFFFFFF", "FFFFFFFF",KeyPath);
     if (lasterror != 0)
     {
        SendErrMsgEx(event,"设置读密码错误。错误码是："); return;
     }
     SendMsg(event,"初始化成功。");
  
  })

  ipcMain.on('OnSm2TestBnt', (event, arg) => {
    var ErrGetVer="获取锁的版本时错误，错误码是："
    var ErrGetVerEx="获取锁的扩展版本时错误，错误码是："

    var Ver=mIF2K.NT_GetIDVersion(KeyPath);
    lasterror=mIF2K.GetLastError();
    if(lasterror!=0)
    {
        SendErrMsgEx(g_Event,ErrGetVer);return ;
    }
    var VerEx=mIF2K.NT_GetIDVersionEx(KeyPath);
    lasterror=mIF2K.GetLastError();
    if(lasterror!=0)
    {
        SendErrMsgEx(g_Event,ErrGetVerEx);return ;
    }
    //如果锁的扩展版本或版本号少于33则不支持国密算法，
    if(VerEx<33 && Ver<33)
    {
        SendMsg(event,"该锁不支持加密算法" );return ;
    }

    {//返回锁的芯片唯一ID
    var ChipID = mIF2K.GetChipID(KeyPath);
    lasterror=mIF2K.GetLastError() ;
    if (lasterror != 0) { SendErrMsgEx(event,"返回锁的芯片唯一ID时错误。,错误码是："); return; }
    SendMsg(event,"已成功返回锁的芯片唯一ID：" + ChipID);
    }

    //生成密钥对
    {
    var KeyPairInfo = mIF2K.YT_GenKeyPair(KeyPath);
    lasterror=mIF2K.GetLastError() ;
    if (lasterror!= 0)  { SendErrMsgEx(event,"生成密钥对时错误。,错误码是："); return; }
    
    SendMsg(event,"已生成的私钥是：" + KeyPairInfo.PriKey);
    
    SendMsg(event,"已生在的公钥X是：" + KeyPairInfo.PubKeyX);
    
    SendMsg(event,"已生成的公钥Y是：" + KeyPairInfo.PubKeyY);

    KeyPairInfo.PriKey='128B2FA8BD433C6C068C8D803DFF79792A519A55171B1B650C23661D15897263'
    KeyPairInfo.PubKeyX='D5548C7825CBB56150A3506CD57464AF8A1AE0519DFAF3C58221DC810CAF28DD'
    KeyPairInfo.PubKeyY='921073768FE3D59CE54E79A49445CF73FED23086537027264D168946D479533E'
    
    //设置密钥对及用户身份到加密锁中
    var UserName="xxx company";
    
        lasterror= mIF2K.Set_SM2_KeyPair(KeyPairInfo.PriKey,KeyPairInfo.PubKeyX,KeyPairInfo.PubKeyY,UserName,KeyPath);
        if (lasterror != 0) { SendErrMsgEx(event,"设置密钥对及用户身份时出现错误。,错误码是："); return; }
        SendMsg(event,"已成功设置密钥对及用户身份到锁中。" );
    }

    {
    var PubKeyInfo = mIF2K.Get_SM2_PubKey(KeyPath);
    lasterror=mIF2K.GetLastError() ;
    if (lasterror != 0) { SendErrMsgEx(event,"获取设置在锁中的公钥X时出现错误。,错误码是："); return; }
    SendMsg(event,"已成功返回设置在锁的公钥X:" + PubKeyInfo.PubKeyX);
    
    SendMsg(event,"已成功返回设置在锁的公钥Y:" + PubKeyInfo.PubKeyY);
    
    SendMsg(event,"已成功返回设置在锁中的用户身份：" + PubKeyInfo.sm2UserName);
    }

    //设置PIN码,
    {
    var oldPin="123"
    var newPin="123"
    lasterror = mIF2K.YtSetPin(oldPin,newPin,KeyPath);
    if (lasterror != 0) { SendErrMsgEx(event,"设置PIN码时错误,错误码是："); return; }
    SendMsg(event,"已成功设置新的PIN码是：" +newPin);
    }
    //使用默认的PIN码
    Pin="123"
    //对数据进行签名
    {
    var outSignData = mIF2K.YtSign("12345678",Pin,KeyPath);
    lasterror=mIF2K.GetLastError() ;
    if (lasterror != 0) { SendErrMsgEx(event,"对数据进行签名时错误,错误码是："); return; }
    SendMsg(event,"已成功对数据进行签名：" + outSignData);
    }
    //对数据进行解密
    {
    var outEncString = mIF2K.SM2_EncString("123",KeyPath);
    lasterror=mIF2K.GetLastError() ;
    if (lasterror!= 0) { SendErrMsgEx(event,"对数据进行加密时错误,错误码是："); return; }
    SendMsg(event,"已成功对数据进行加密，加密后的结果是：" + outEncString);
    
    //对数据进行解密，使用默认的PIN码
    
    var outDecString = mIF2K.SM2_DecString(outEncString,Pin,KeyPath);
    lasterror=mIF2K.GetLastError() ;
    if (lasterror!= 0) { SendErrMsgEx(event,"对数据进行解密时错误,错误码是："); return; }
    SendMsg(event,"已成功对数据进行解密，解密后的结果是：" + outDecString);
    }
  
  })
  ///////////////////


///UsbKey pnp event
usbDetect.on('add', function(device) { 
    if(mIF2K.MacthUKeyID(device))
    {
        SendMsg(g_Event,"收到有加密锁初插入的消息");   
    }
 });

 usbDetect.on('remove', function(device) { 

    if(mIF2K.MacthUKeyID(device))
    { 
        SendMsg(g_Event,"收到有加密锁被拨出的消息");
    }

});

module.exports.mIF2K=mIF2K;
module.exports.lasterror=lasterror;
module.exports.usbDetect=usbDetect;