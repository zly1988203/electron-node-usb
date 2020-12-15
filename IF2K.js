// JScript source code

var HID = require('node-hid')
const sm3 = require('sm3');


var  GETVERSION = 0x01;
var  GETID = 0x02;
var  GETVEREX = 0x05;
var  CAL_TEA = 0x08;
var  SET_TEAKEY = 0x09;
var  READBYTE = 0x10;
var  WRITEBYTE = 0x11;
var  YTREADBUF = 0x12;
var  YTWRITEBUF = 0x13;
var  MYRESET = 0x20;
var  YTREBOOT = 0x24;
var  SET_ECC_PARA = 0x30;
var  GET_ECC_PARA = 0x31;
var  SET_ECC_KEY = 0x32;
var  GET_ECC_KEY = 0x33;
var  MYENC = 0x34;
var  MYDEC = 0X35;
var  SET_PIN = 0X36;
var  GEN_KEYPAIR = 0x37;
var  YTSIGN = 0x51;
var  YTVERIFY = 0x52;
var  GET_CHIPID = 0x53;
var  YTSIGN_2 = 0x53;


//errcode 
var FAILEDGENKEYPAIR = -21;
var FAILENC = -22;
var FAILDEC = -23;
var FAILPINPWD = -24;
var USBStatusFail = -50;  
var ERR_SET_REPORT=-94;
var ERR_GET_REPORT=-93;

var MAX_LEN = 2031;

var SM2_ADDBYTE = 97;//
var MAX_ENCLEN = 128; //
var MAX_DECLEN = (MAX_ENCLEN + SM2_ADDBYTE); //
var SM2_USENAME_LEN = 80;// 

var ECC_MAXLEN = 32;
var PIN_LEN = 16;

var MAX_TRANSE_LEN = 21;
var SM2_MAX_TRANSE_LEN=255;

var ID_LEN=16;

class IF2K
{
    IF2K() {
        //connection object
        IF2K.connection=null;

    }

    GetLastError()
    {
        return this.lasterror;
    }

StrEnc(InString , Key)
{
        var n;var m;
        var nlen;

        var b=Buffer.from(InString);
        var zero_buf = Buffer.from([0]);
        b = Buffer.concat([b,zero_buf]);
        nlen=b.length;
        if( b.length < 8)
        {
            nlen= 8;
        }

        var outb=Buffer.alloc(nlen);
        var inb=Buffer.alloc(nlen);
        b.copy(inb);//如果少于8，则会补0，这里主要是用于补0
        b.copy(outb);

        
        for(n=0;n<=(nlen-8);n=n+8)
        {
            var tmpoutb = this.sub_EnCode(inb,n,Key);
            for(m=0;m<8;m++)
            {
                outb[m+n]=tmpoutb[m];
            }
        }
        
        return outb.toString('hex');
}



StrDec( InString ,  Key)//
{
    var n,m;
    var inb=new Buffer(InString, 'hex');
    var outb=Buffer.alloc(inb.length );
    inb.copy(outb);

    for( n = 0; n<=inb.length - 8 ;n=n+ 8)
    {
        var tmpoutb =this.sub_DeCode(inb,n,Key);
        for(m=0;m<8;m++)
        {
            outb[m+n]=tmpoutb[m];
        }
    }

    return  outb.toString();
}

EnCode(inb,Key)
{
    this.sub_EnCode(inb,0,Key);
}

sub_EnCode(inb,pos,Key ) 
{
        var cnDelta, y, z, a, b, c, d;
        var outb=new Uint8Array(8);
        var n, i, nlen;
        var sum;
        var temp, temp_1;
        
        var buf = new Array(16);
        var temp_string;
        
        cnDelta = 2654435769;
        sum = 0;

        nlen = Key.length ;
        i = 0;
        for (n = 1; n <= nlen; n = n + 2)
        {
            temp_string = Key.substring(n-1, n-1+2);
            buf[i] = this.HexToInt(temp_string);
            i = i + 1;
        }
        a = 0; b = 0; c = 0; d = 0;
        for (n = 0; n <= 3; n++)
        {
            a = (buf[n] << (n * 8)) | a; 
            b = (buf[n + 4] << (n * 8)) | b;
            c = (buf[n + 4 + 4] << (n * 8)) | c;
            d = (buf[n + 4 + 4 + 4] << (n * 8)) | d;
        }
       
        y = 0;
        z = 0;
        for (n = 0; n <= 3; n++)
        {
            y = (inb[n + pos] << (n * 8)) | y;
            z = (inb[n + 4 + pos]<< (n * 8)) | z;
        }

        n = 32;

        while (n > 0)
        {
            sum = cnDelta + sum;

            temp = (z << 4) & 0xFFFFFFFF; 
          
            temp = (temp + a) & 0xFFFFFFFF; 
            temp_1 = (z + sum) & 0xFFFFFFFF;  
            temp = (temp ^ temp_1) & 0xFFFFFFFF; 
            temp_1 = (z >>>5) & 0xFFFFFFFF;  
            temp_1 = (temp_1 + b) & 0xFFFFFFFF;  
            temp = (temp ^ temp_1) & 0xFFFFFFFF;  
            temp = (temp + y) & 0xFFFFFFFF; 
            y = temp & 0xFFFFFFFF; 
           // y += ((z << 4) + a) ^ (z + sum) ^ ((z >> 5) + b);

            temp = (y << 4) & 0xFFFFFFFF;
            temp = (temp + c) & 0xFFFFFFFF;
            temp_1 = (y + sum) & 0xFFFFFFFF;
            temp = (temp ^ temp_1) & 0xFFFFFFFF;
            temp_1 = (y >>> 5) & 0xFFFFFFFF;
            temp_1 = (temp_1 + d) & 0xFFFFFFFF;
            temp = (temp ^ temp_1) & 0xFFFFFFFF;
            temp = (z + temp) & 0xFFFFFFFF;
            z = temp & 0xFFFFFFFF;
          //  z += ((y << 4) + c) ^ (y + sum) ^ ((y >> 5) + d);
          
            n = n - 1;

        }
         
        for (n = 0; n <= 3; n++)
        {
            outb[n] = ((y >>> (n * 8)) & 255);
            outb[n + 4] = ((z >>> (n * 8)) & 255);
        }
        return outb;

} 

DeCode()
{
    sub_DeCode(inb,0,Key );
}

 sub_DeCode(inb,pos,Key ) 
{
        var cnDelta, y, z, a, b, c, d;
        var outb=new Uint8Array(8);
        var n, i, nlen;
        var sum;
        var temp, temp_1;
        
        var buf = new Array(16);
        var temp_string;

        cnDelta = 2654435769;
        sum = 3337565984;

        nlen = Key.length ;
        i = 0;
        for (n = 1; n <= nlen; n = n + 2)
        {
            temp_string = Key.substring(n-1, n-1+2);
            buf[i] = this.HexToInt(temp_string);
            i = i + 1;
        }
        a = 0; b = 0; c = 0; d = 0;
        for (n = 0; n <= 3; n++)
        {
            a = (buf[n] << (n * 8)) | a; 
            b = (buf[n + 4] << (n * 8)) | b;
            c = (buf[n + 4 + 4] << (n * 8)) | c;
            d = (buf[n + 4 + 4 + 4] << (n * 8)) | d;
        }
       
        y = 0;
        z = 0;
        for (n = 0; n <= 3; n++)
        {
            y = (inb[n + pos] << (n * 8)) | y;
            z = (inb[n + 4 + pos]<< (n * 8)) | z;
        }

        n = 32;

        while (n > 0)
        {
            
             temp = (y << 4) & 0xFFFFFFFF;
            temp = (temp + c) & 0xFFFFFFFF;
            temp_1 = (y + sum) & 0xFFFFFFFF;
            temp = (temp ^ temp_1) & 0xFFFFFFFF;
            temp_1 = (y >>> 5) & 0xFFFFFFFF;
            temp_1 = (temp_1 + d) & 0xFFFFFFFF;
            temp = (temp ^ temp_1) & 0xFFFFFFFF;
            temp = (z - temp) & 0xFFFFFFFF;
            z = temp & 0xFFFFFFFF;
          //  z += ((y << 4) + c) ^ (y + sum) ^ ((y >> 5) + d);

            temp = (z << 4) & 0xFFFFFFFF; 
            temp = (temp + a) & 0xFFFFFFFF; 
            temp_1 = (z + sum) & 0xFFFFFFFF;  
            temp = (temp ^ temp_1) & 0xFFFFFFFF; 
            temp_1 = (z >>>5) & 0xFFFFFFFF;  
            temp_1 = (temp_1 + b) & 0xFFFFFFFF;  
            temp = (temp ^ temp_1) & 0xFFFFFFFF;  
            temp = ( y -temp) & 0xFFFFFFFF; 
            y = temp & 0xFFFFFFFF; 
           // y += ((z << 4) + a) ^ (z + sum) ^ ((z >> 5) + b);

           
          
            sum = sum-cnDelta;
            n = n - 1;

        }
         
        for (n = 0; n <= 3; n++)
        {
            outb[n] = ((y >>> (n * 8)) & 255);
            outb[n + 4] = ((z >>> (n * 8)) & 255);
        }
        return outb;

} 

    MacthUKeyID(mDevices)
    {
        if ((mDevices.vendorId == IF2K.VID && mDevices.productId == IF2K.PID) ||
        (mDevices.vendorId == IF2K.VID_NEW && mDevices.productId == IF2K.PID_NEW) ||
        (mDevices.vendorId == IF2K.VID_NEW_2 && mDevices.productId == IF2K.PID_NEW_2))
        {
            return true;
        }
        return false
    }

 /////////////////////
AddZero( InKey)
{
    var nlen;
    var n;
    nlen =InKey.length;
    for(n=nlen;n<=7;n++)
    {
        InKey = "0" + InKey;
    }
    return  InKey;
}

myconvert( HKey,  LKey)
{
    HKey = this.AddZero(HKey);
    LKey = this.AddZero(LKey);
    var out_data=new Uint8Array(8)
    var n;
    for(n=0;n<=3;n++)
    {
        out_data[n] = this.HexToInt(HKey.substring(  n * 2, n * 2+2));
    }
    for(n=0;n<=3;n++)
    {
        out_data[n + 4] = this.HexToInt(LKey.substring( n * 2, n * 2+2));
    }
    return out_data;
}   

////bin2hex  & hex2bin     
   ByteArrayToHexString(Inb,len)
   {
        var outstring = "";
        for (var n = 0 ;n<= len - 1;n++)
        {
            outstring = outstring +this.myhex(Inb[n]) ;
        }
        return outstring;
   }
     
HexStringToByteArray(InString)
    {
         var nlen;
         var retutn_len;
         var n,i;
         var b;
         var temp;
         nlen = InString.length;
         if (nlen < 16) retutn_len = 16;
         retutn_len = nlen / 2;
         b = new Uint8Array(retutn_len);
         i = 0;
         for(n=0;n<nlen;n=n+2)
         {
             temp = InString.substring( n, n+2);
             b[i] = this.HexToInt(temp);
             i = i + 1;
          }
          return b;
     }
 ////////    


//decimal to hex && hex2dec	
   myhex(value) {
    if (value < 16)
      return '0' + value.toString(16);
    return value.toString(16);
    };

	
    HexToInt( s)
    {
        var hexch ="0123456789ABCDEF";
        var i, j;
        var r, n, k;
        var ch;
        s=s.toUpperCase();

        k = 1; r = 0;
        for (i = s.length; i > 0; i--)
        {
            ch = s.substring(i - 1,  i-1+1);
            n = 0;
            for (j = 0; j < 16; j++)
            {
                if (ch == hexch.substring(j, j+1) )
                {
                    n = j;
                }
            }
            r += (n * k);
            k *= 16;
        }
        return r;
    };
////////////////

 /////////////// send cmd only ,no carry data  
   SendNoWithData(CmdFlag) {
        var array_in = new Uint8Array(MAX_TRANSE_LEN) ; 
        this.SendWithData( CmdFlag,array_in);
        return this.lasterror;
 };
 ///////////////////////////
 /*
 SendWithDataNoErr(CmdFlag,array_in,KeyPath) {
       
    this.lasterror=0;
    var featureReport = [2, 0];

    featureReport[1] = CmdFlag;

    for (var i = 1; i < array_in.length; i++) {
        featureReport[i + 1] =array_in[i];
    }
    if(KeyPath==null)
    {
        this.lasterror= -92;
        return array_out;
    }
    this.connection = new  HID.HID(KeyPath)
    if(this.connection==null)
    {
        this.lasterror= -92;
        return array_out;
    }
    var Outlen=this.connection.sendFeatureReport( featureReport); 
    if(Outlen<2) {this.lasterror= ERR_SET_REPORT;return undefined;}
    var array_out=this.connection.getFeatureReport(1,SM2_MAX_TRANSE_LEN) ;
    this.connection.close();
    if(array_out.length<1){this.lasterror=ERR_GET_REPORT; return undefined;}

    return array_out;

 }*/
 ///////////send cmd and data
 SendWithDataNoErr(CmdFlag,array_in,KeyPath) {
       
    this.lasterror=0;
    var featureReport = [2]
    for(var n=1;n<=SM2_MAX_TRANSE_LEN+1;n++)
    {
        featureReport[n] = 0;
    }

    featureReport[1] = CmdFlag;
 
    for (var i = 1; i < array_in.length; i++) {
        featureReport[i + 1] =array_in[i];
    }
    if(KeyPath==null)
    {
        this.lasterror= -92;
        return array_out;
    }
    this.connection = new  HID.HID(KeyPath)
    if(this.connection==null)
    {
        this.lasterror= -92;
        return array_out;
    }
    var Outlen=this.connection.sendFeatureReport( featureReport); 
    if(Outlen<2) {this.connection.close();this.lasterror= ERR_SET_REPORT;return undefined;}
    var array_out=this.connection.getFeatureReport(1,510) ;
    this.connection.close();
    if(array_out.length<1){this.lasterror=ERR_GET_REPORT; return undefined;}

    return array_out;

}

 SendWithData(CmdFlag,array_in,KeyPath) {
       
    var array_out=this.SendWithDataNoErr(CmdFlag,array_in,KeyPath);

    if( array_out[0] != 0)
    {
        this.lasterror= array_out[0] - 256;
    }
    else
    {
        this.lasterror=0;
    }

    return array_out;

}
 ///////////////
 GetOneByteDataFromUsbKey(cmd,KeyPath)
   {
    var array_in = new Uint8Array(MAX_TRANSE_LEN) ;
    var array_out;
    array_out= this.SendWithDataNoErr( cmd,array_in,KeyPath);
    if(this.lasterror!=0)return undefined;
    return array_out[0];
   }
////////
   
FindPort(start) {
    this.lasterror=0;
    var KeyPath="";
    var count=0;
    var devices = HID.devices()
    devices.forEach(mDevice=>{  
        if (this.MacthUKeyID(mDevice))
        {
           if(count==start)
           {
             KeyPath=mDevice.path;
               return KeyPath;
           }
            count++; 
        }
    });
    if(KeyPath!="")
    {
        this.lasterror=0;
    }
    else{
    this.lasterror=-92;
    }
    return KeyPath;
}

////////////////////////////////////////////////////////////////////////////////////

NT_GetIDVersionEx(KeyPath)
{
    return this.GetOneByteDataFromUsbKey(5,KeyPath);
};

NT_GetIDVersion(KeyPath)
{
    return this.GetOneByteDataFromUsbKey(1,KeyPath);  
};
 /////

GetID(KeyPath)
{
    var IDInfo= {
        ID_1 : "",
        ID_2:"",
      };
    var array_in = new Uint8Array(MAX_TRANSE_LEN) ;
    var array_out;
    var t1=new Buffer.alloc(4);
    var t2=new Buffer.alloc(4);
    array_out= this.SendWithDataNoErr( 2,array_in,KeyPath);
    if(this.lasterror!=0){return ""}
    t1[0] = array_out[0] ; t1[1] = array_out[1] ; t1[2] = array_out[2] ; t1[3] = array_out[3];
    t2[0] = array_out[4] ; t2[1] = array_out[5] ; t2[2] = array_out[6] ; t2[3] = array_out[7];
    if(this.lasterror!=0)return this.lasterror;
    IDInfo.ID_1=t1.toString('hex');
    IDInfo.ID_2 =t2.toString('hex');
    return IDInfo;
}
 	
GetChipID(KeyPath)
{
    var array_in = new Uint8Array(SM2_MAX_TRANSE_LEN) ;
    var array_out;

    var OutChipID = "";var outb=new Uint8Array(ID_LEN) ;

    array_out= this.SendWithDataNoErr( GET_CHIPID,array_in,KeyPath);
    if(this.lasterror!=0){return ""}
    if (array_out[0] != 0x20) 
    {
        this.lasterror= USBStatusFail;
        return OutChipID;
    }
    outb = array_out.slice(1,ID_LEN+1);

    OutChipID = this.ByteArrayToHexString(outb, 16);
    OutChipID=OutChipID.toUpperCase();
    return OutChipID;
    
};
 ////////		
 	
/////
FindPort_2(start, in_data,  verf_data )
{
    var n;
    var count=0;
    var out_data=0;
    for(n=0;n<256;n++)
    {
        var KeyPath=this.FindPort(n);
        if (this.lasterror != 0 ) return null;
        out_data = this.sWriteEx(in_data,KeyPath);
        if (this.lasterror != 0 ) return null;
        if (out_data == verf_data ){ 
            if(start==count)return KeyPath;
            count++;
        }
    }
    return null;
};
 ///////	
 FindPort_3( start,in_data,  verf_data )
 {
    var n;
    var count=0;
    var out_data=0;
    for(n=0;n<256;n++)
    {
        var KeyPath=this.FindPort(n);
        if (this.lasterror != 0 ) return null;
        out_data = this.sWriteEx_New(in_data,KeyPath);
        if (this.lasterror != 0 ) return null;
        if (out_data == verf_data ){ 
            if(start==count)return KeyPath;
            count++;
        }
    }
    return null;
 };

 SetWritePassword( W_HKey,  W_LKey,  new_HKey,  new_LKey,KeyPath)
 {
     var address;
     var ary1=this.myconvert(W_HKey, W_LKey);
     var ary2=this.myconvert(new_HKey, new_LKey);
     address = 2040;

     this.lasterror = this.Sub_WriteByte(ary2, address, 8, ary1,0,KeyPath);

     return this.lasterror;
 }

 SetReadPassword( W_HKey,  W_LKey,  new_HKey,  new_LKey,KeyPath)
 {
     var address;
     var ary1=this.myconvert(W_HKey, W_LKey);
     var ary2=this.myconvert(new_HKey, new_LKey);
     address = 2032;

     this.lasterror = this.Sub_WriteByte(ary2, address, 8, ary1,0,KeyPath);

     return this.lasterror;
 }

NT_SetCal(cmd, indata,  IsHi,  pos,KeyPath )
 {
    var array_in = new Uint8Array(MAX_TRANSE_LEN) ;
    var n;
    array_in[1] = IsHi;
    for(n=0;n <8;n++)
    {
        array_in[2 + n] = indata[n + pos];
    }
      
    var array_out=this.SendWithData( cmd,array_in,KeyPath);
    if(this.lasterror!=0)return this.lasterror;
    if (array_out[0] != 0)
    {
        this.lasterror= -82;
    }
    return this.lasterror;
 }

 Sub_SetCal( cmd,Key,KeyPath)
 {
     var KeyBuf=this.HexStringToByteArray(Key);
     this.lasterror = this.NT_SetCal(cmd,KeyBuf, 0, 8,KeyPath);
     if ( this.lasterror != 0) return  this.lasterror;
     return this.NT_SetCal(cmd,KeyBuf, 1, 0,KeyPath);

 }

 SetCal_2( Key,KeyPath)
 {
    return this.Sub_SetCal(SET_TEAKEY,Key,KeyPath);
 }

 SetCal_New(Key,KeyPath)
 {
    return this.Sub_SetCal(13,Key,KeyPath);
 }

 Sub_EncString(cmd, InString ,  KeyPath)
 {
        var n;var m;
        var nlen;

        var b=Buffer.from(InString);
        var zero_buf = Buffer.from([0]);
        b = Buffer.concat([b,zero_buf]);
        nlen=b.length;
        if( b.length < 8)
        {
            nlen = 8;
        }

        var outb=Buffer.alloc(nlen);
        var inb=Buffer.alloc(nlen);
        b.copy(inb);//如果少于8，则会补0，这里主要是用于补0
        b.copy(outb);


         for(n=0;n<=(nlen-8);n=n+8)
         {
             var tmpoutb = this.NT_Cal(cmd,inb, n,KeyPath);
             for(m=0;m<8;m++)
             {
                 outb[m+n]=tmpoutb[m];
             }
             if (this.lasterror != 0) '';
         }
        
         return outb.toString('hex');
 }

EncString( InString,KeyPath)
{
        return this.Sub_EncString(8,InString,KeyPath)
}

EncString_New( InString,KeyPath)
{
        return this.Sub_EncString(12,InString,KeyPath)
}

NT_Cal(cmd, InBuf ,  pos,KeyPath)
{
    var n;
    var array_in = new Uint8Array(MAX_TRANSE_LEN) ;
    var outbuf= new Uint8Array(8);
    for(n=1;n<=8;n++)
    {
        array_in[n] = InBuf[n - 1+ pos];
    }
    var array_out=this.SendWithDataNoErr(cmd, array_in,KeyPath);
    if(this.lasterror!=0)return undefined;
    for(n=0;n <8;n++)
    {
        outbuf[n + pos] = array_out[n];
    }
    if( array_out[8] != 0x55)
    {
        this.lasterror= -20;
    }
    return outbuf;
}

Cal(Inbuf,KeyPath)
{
  return this.NT_Cal(8,Inbuf,0,KeyPath);
}

Cal_New(Inbuf,KeyPath)
{
  return this.NT_Cal(12,Inbuf,0,KeyPath);
}

 SimpleCalData(cmd,in_data,KeyPath)
{   
    var t1;
    var t2;
    var t3;
    var t4;
    var array_in = new Uint8Array(MAX_TRANSE_LEN) ;
    array_in[1]=(in_data & 255);
    array_in[2]=((in_data >> 8) & 255);
    array_in[3] = ((in_data >> 16) & 255);
    array_in[4] = ((in_data >> 24) & 255);
    
    var array_out;
    array_out= this.SendWithDataNoErr( cmd,array_in,KeyPath);
    if(this.lasterror!=0){return 0}
    t1 = array_out[0];
    t2 = array_out[1];
    t3 = array_out[2];
    t4 = array_out[3];

    return t1 | (t2 << 8) | (t3 << 16) | (t4 << 24);
}

sWriteEx_New( in_data,KeyPath)
{
    return this.SimpleCalData(0x0a,in_data,KeyPath);
}

sWrite_2Ex_New( in_data ,KeyPath)
{
    return this.SimpleCalData(0x0b,in_data,KeyPath);
}

sWriteEx( in_data ,KeyPath)
{
    return this.SimpleCalData(0x03,in_data,KeyPath);
}

sWrite_2Ex( in_data ,KeyPath)
{
    return this.SimpleCalData(0x04,in_data,KeyPath);
}
 /////////////////////
 Sub_WriteByte( indata,address,nlen,password,pos,KeyPath)
 {  
     var array_in = new Uint8Array(MAX_TRANSE_LEN) ;
     var addr_l;
     var addr_h;
     var n;
     if ((address + nlen - 1) > (MAX_LEN + 17) || (address < 0)) return -81;
     addr_h = (address >> 8) * 2;
     addr_l = address & 255;
 
     array_in[1] = addr_h;
     array_in[2] = addr_l;
     array_in[3] = nlen;
 
     for (n = 0; n <= 7; n++)
     {
         array_in[4 + n] = password[n];
     }
     for (n = 0; n < nlen; n++)
     {
         array_in[12 + n] = indata[n + pos];
     }
     
     var array_out=this.SendWithDataNoErr(WRITEBYTE, array_in,KeyPath);
     if(this.lasterror!=0)return this.lasterror;
     if (array_out[0] != 0)
     {
        this.lasterror= -82;
     }
     return this.lasterror;
 }
 //////////////
   
Sub_ReadByte(address,  nlen, password,KeyPath)
{
    var outData = new Uint8Array(nlen );
    var array_out;
    var ret;
    if( nlen > MAX_TRANSE_LEN )
    {
        this.lasterror=ERR_OVER_SEC_MAX_LEN;
        return outData;
        }
    if( (address + nlen > MAX_LEN) )
    {
        this.lasterror==ERR_OVER_SEC_MAX_LEN;
        return outData;
        }

    var array_in = new Uint8Array(MAX_TRANSE_LEN) ;
    var  addr_l;
    var  addr_h;
    var n;

    addr_h = (address >> 8) * 2;
    addr_l = address & 255;

    array_in[1] = addr_h;
    array_in[2] = addr_l;
    array_in[3] = nlen;
    
    
    for( n = 0 ;n<= 7;n++)
    {
        array_in[4 + n] = password[n];
    }

    array_out=this.SendWithDataNoErr(READBYTE, array_in,KeyPath);
    if(this.lasterror!=0)return undefined;
    if (array_out[0] != 0)
    {
        this.lasterror= -82;return outData;
    }
    for( n = 0 ;n<(nlen);n++)
    {
        outData[n] = array_out[n + 1];
    }
    return outData;

        
}

///////////
YWrite( indata,   address,  nlen,  HKey,  LKey,KeyPath )
{
    var ret = 0;
    var n, trashLen = 16;
   
    if ((address + nlen - 1 > MAX_LEN) || (address < 0)) return -81;

    trashLen = trashLen - 8;
    
    var password=this.myconvert(HKey, LKey);
    var tmplen;
    var pos=0;
   while(nlen>0)
    {
        if(nlen>trashLen)
            tmplen=trashLen;
        else
           tmplen=nlen;
        this.lasterror = this.Sub_WriteByte(indata, address + pos, tmplen, password,  pos,KeyPath);
        if (this.lasterror != 0) {  return this.lasterror; }
        nlen=nlen-trashLen;
        pos=pos+trashLen;
    }
   
   
    return this.lasterror;
}

///////////////////////////////
YWriteString(InString ,Address , HKey,  LKey,KeyPath)
{
    var Buf=Buffer.from(InString);
     this.YWrite(Buf,Address,Buf.length,HKey,LKey,KeyPath); 
     if(this.lasterror<0)return this.lasterror;
     return Buf.length;
}

///////////////  
YRead(address,  nlen,  HKey,  LKey,KeyPath )
{  
    var ret = 0;
    var password = new Uint8Array(8 );
    var n, trashLen = 16;
    var OutData=Buffer.alloc(0);
    var tmp_OutData;

    if ((address + nlen - 1 > MAX_LEN) || (address < 0)) return (-81);

    password=this.myconvert(HKey, LKey);
    var tmplen;
    var pos=0;
    while(nlen>0)
    {
        if(nlen>trashLen)
            tmplen=trashLen;
        else
           tmplen=nlen;
        tmp_OutData = this.Sub_ReadByte(address + pos, tmplen, password,KeyPath);
        if (this.lasterror != 0) { return OutData; }
        OutData = Buffer.concat([OutData,tmp_OutData]);
        nlen=nlen-trashLen;
        pos=pos+trashLen;
    }
    
    
    return OutData;

}
//////////////

YReadString( Address,  nlen, HKey,  LKey,KeyPath)
{
    var outData=this.YRead(Address,  nlen,  HKey,  LKey ,KeyPath);

    return outData.toString();
        
}

  ///////////////////////////////////////////////////// other api  
NT_ReSet(KeyPath)
{
    var array_in = new Uint8Array(MAX_TRANSE_LEN) ;
    var array_out=this.SendWithDataNoErr(MYRESET,array_in,KeyPath);
    if(this.lasterror!=0)return this.lasterror;
    if (array_out[0] != 0)
    {
        this.lasterror= -82;
    }
    return this.lasterror;
}


/////////Reset
ReSet( KeyPath )
{
    var Ver=this.NT_GetIDVersion(KeyPath);
    if(this.lasterror!=0)return this.lasterror;
    this.lasterror = this.NT_ReSet(KeyPath);
    if(this.lasterror!=0)return this.lasterror;
    this.lasterror = this.NT_ReSet(KeyPath);
    if(this.lasterror!=0)return this.lasterror;
    this.lasterror = this.NT_ReSet(KeyPath);
    if(this.lasterror!=0)return this.lasterror;
    this.lasterror = this.NT_ReSet(KeyPath);
    return this.lasterror;
}

SetHidOnly( IsHidOnly, KeyPath)
{
    return this.NT_SetHidOnly(IsHidOnly, KeyPath);
}
NT_SetHidOnly( IsHidOnly, KeyPath)
{
    var array_in = new Uint8Array(MAX_TRANSE_LEN) ;
    
    if (IsHidOnly) array_in[1] = 0; else array_in[1] = 0xff;
    var array_out=this.SendWithDataNoErr(0x55, array_in,KeyPath);
    if(this.lasterror!=0)return this.lasterror;
    if (array_out[0] != 0)
    {
        return -82;
    }
    return 0;
}

SetUReadOnly(KeyPath)
{
    return  this.NT_SetUReadOnly(KeyPath);
}
NT_SetUReadOnly(KeyPath)
{
    var array_in = new Uint8Array(MAX_TRANSE_LEN) ;
    var array_out=this.SendWithDataNoErr(0x56, array_in,KeyPath);
    if(this.lasterror!=0)return this.lasterror;
    if (array_out[0] != 0)
    {
        return -82;
    }
    return 0;
}

NT_Set_SM2_KeyPair(PriKey, PubKeyX, PubKeyY, sm2_UerName, KeyPath)
{
    var array_in = new Uint8Array(SM2_MAX_TRANSE_LEN) ;
    var n = 0; 

    
    for (n = 0; n < ECC_MAXLEN; n++)
    {
        array_in[1 + n + ECC_MAXLEN * 0] = PriKey[n];
        array_in[1 + n + ECC_MAXLEN * 1] = PubKeyX[n];
        array_in[1 + n + ECC_MAXLEN * 2] = PubKeyY[n];
    }
    for (n = 0; n < SM2_USENAME_LEN; n++)
    {
        array_in[1 + n + ECC_MAXLEN * 3] = sm2_UerName[n];
    }

    var array_out=this.SendWithDataNoErr(0x32, array_in,KeyPath);
    if(this.lasterror!=0)return this.lasterror;
    if (array_out[0] != 0x20) this.lasterror= USBStatusFail;

    return this.lasterror;
}

NT_GenKeyPair(KeyPath)
{
    var KEYPAIR={
        PriKey:null,
        PubKeyX:null,
        PubKeyY:null,
    };
    var array_in = new Uint8Array(SM2_MAX_TRANSE_LEN) ;
    var n = 0; 

    var array_out=this.SendWithDataNoErr(GEN_KEYPAIR, array_in,KeyPath);
    if(this.lasterror!=0)return undefined; 
    if (array_out[0] != 0x20)
    {

        this.lasterror= FAILEDGENKEYPAIR;return undefined;

    }
    KEYPAIR.PriKey=array_out.slice(1,1 + ECC_MAXLEN );
    KEYPAIR.PubKeyX=array_out.slice(1 + ECC_MAXLEN,ECC_MAXLEN*2+1);
    KEYPAIR.PubKeyY=array_out.slice(1 + ECC_MAXLEN*2,ECC_MAXLEN*3+1);
    return KEYPAIR;
}



NT_Get_SM2_PubKey( KeyPath)
{
    var SM2_PubKeyInfo={
        KGx:null,
        KGy:null,
        sm2_UerName:null,
    }
    var array_in = new Uint8Array(SM2_MAX_TRANSE_LEN) ;
    var n = 0;  

    var array_out=this.SendWithDataNoErr(0x33, array_in,KeyPath);
    if(this.lasterror!=0)return this.lasterror;
    if (array_out[0] != 0x20) 
    {
        this.lasterror= USBStatusFail;return this.lasterror;
    }

    
        SM2_PubKeyInfo.KGx = array_out.slice(1  ,1 + ECC_MAXLEN * 1);
        SM2_PubKeyInfo.KGy = array_out.slice(1 + ECC_MAXLEN * 1 ,1 + ECC_MAXLEN * 2);
   
        SM2_PubKeyInfo.sm2_UerName = array_out.slice(1 + ECC_MAXLEN * 2 ,1 + ECC_MAXLEN * 2 +SM2_USENAME_LEN);
    

    return SM2_PubKeyInfo;
}

NT_Set_Pin(old_pin, new_pin, KeyPath)
{

    var array_in = new Uint8Array(SM2_MAX_TRANSE_LEN) ;
    var n = 0;  

    var b_oldpin  =Buffer.from(old_pin);
    var b_newpin  =Buffer.from(new_pin);
    for (n = 0; n < PIN_LEN; n++)
    {
        array_in[1 + PIN_LEN * 0 + n] = b_oldpin[n];
        array_in[1 + PIN_LEN * 1 + n] = b_newpin[n];
    }

    var array_out=this.SendWithDataNoErr(SET_PIN, array_in,KeyPath);
    if(this.lasterror!=0)return this.lasterror;
    if (array_out[0] != 0x20) 
    {
        this.lasterror= USBStatusFail;return this.lasterror;
    }
    if (array_out[1] != 0x20) 
    {
        this.lasterror= FAILPINPWD;
    }
    return this.lasterror;
}


NT_SM2_Enc( inbuf,  inlen, KeyPath)
{
    var array_in = new Uint8Array(SM2_MAX_TRANSE_LEN) ;
    var outbuf=new Uint8Array(inlen + SM2_ADDBYTE);
    var n = 0;  

    array_in[1] = inlen;
    for (n = 0; n < inlen; n++)
    {
        array_in[2 + n] = inbuf[n];
    }
    var array_out=this.SendWithDataNoErr(MYENC, array_in,KeyPath);
    if(this.lasterror!=0)
    {
        return outbuf;
    }
    if (array_out[0] != 0x20) 
    {
        this.lasterror= USBStatusFail;
        return outbuf;
    }
    if (array_out[1] == 0) 
    {
        this.lasterror= FAILENC;
        return outbuf;
    }

    for (n = 0; n < (inlen + SM2_ADDBYTE); n++)
    {
        outbuf[n] = array_out[2 + n];
    }

    return outbuf;
}

NT_SM2_Dec( inbuf, inlen, pin, KeyPath)
{

    var array_in = new Uint8Array(SM2_MAX_TRANSE_LEN) ;
    var outbuf=new Uint8Array(inlen - SM2_ADDBYTE);
    var n = 0;  

    var b_pin =Buffer.from(pin);
    for (n = 0; n < PIN_LEN; n++)
    {
        array_in[1 + PIN_LEN * 0 + n] = b_pin[n];
    }
    array_in[1 + PIN_LEN] = inlen;
    for (n = 0; n < inlen; n++)
    {
        array_in[1 + PIN_LEN + 1 + n] = inbuf[n];
    }
    var array_out=this.SendWithDataNoErr(MYDEC, array_in,KeyPath);
    if(this.lasterror!=0)
    {
        return outbuf;
    }
    if (array_out[2] != 0x20)
    {
        this.lasterror= FAILPINPWD; return outbuf;
    } 
    if (array_out[1] == 0) 
    {
        this.lasterror= FAILENC; return outbuf;
    }
    if (array_out[0] != 0x20) 
    {
        this.lasterror= USBStatusFail; return outbuf;
    }
    for (n = 0; n < (inlen - SM2_ADDBYTE); n++)
    {
        outbuf[n] = array_out[3 + n];
    }

    return outbuf;
}

sub_NT_Sign(cmd, inbuf, pin, KeyPath)
{
    var outbuf = new Uint8Array(ECC_MAXLEN*2) ;
    var array_in = new Uint8Array(SM2_MAX_TRANSE_LEN) ;
    var n = 0;  

    var b_pin =Buffer.from(pin);
    for (n = 0; n < PIN_LEN; n++)
    {
        array_in[1 + PIN_LEN * 0 + n] = b_pin[n];
    }
    for (n = 0; n < 32; n++)
    {
        array_in[1 + PIN_LEN + n] = inbuf[n];
    }
    var array_out=this.SendWithDataNoErr(cmd, array_in,KeyPath);
    if(this.lasterror!=0)
    {
        return outbuf;
    }
    if (array_out[1] != 0x20) 
    {
        this.lasterror=FAILPINPWD;
        return outbuf;
    }
    if (array_out[0] != 0x20) 
    {
        this.lasterror= USBStatusFail;
        return outbuf;
    }
    for (n = 0; n < ECC_MAXLEN*2; n++)
    {
        outbuf[n] = array_out[2 + n];
    }

    return outbuf;
}

NT_Sign( inbuf,  pin, KeyPath)
{
    return this.sub_NT_Sign(0x51, inbuf,pin,KeyPath);
}

NT_Sign_2( inbuf,  pin, KeyPath)
{

    return this.sub_NT_Sign(0x53, inbuf,pin,KeyPath);
}

NT_Verfiy( inbuf,  InSignBuf,  KeyPath)
{
    var array_in = new Uint8Array(SM2_MAX_TRANSE_LEN) ;
    var n = 0;  

    for (n = 0; n < ECC_MAXLEN; n++)
    {
        array_in[1 + n] = inbuf[n];
    }
    for (n = 0; n < ECC_MAXLEN*2; n++)
    {
        array_in[1 + ECC_MAXLEN + n] = InSignBuf[n];
    }
    var array_out=this.SendWithDataNoErr(YTVERIFY, array_in,KeyPath);
    if(this.lasterror!=0)return false;
    var outbiao = (array_out[1] != 0);
    if (array_out[0] != 0x20) 
    {
        this.lasterror=USBStatusFail;return false;
    }

    return outbiao;
}

YT_GenKeyPair(KeyPath)
{
    var n; 
    var KeyPairInfo={
        PriKey:"",
        PubKeyX:"",
        PubKeyY:"",
    } 
    var KEYPAIR=this.NT_GenKeyPair(KeyPath);
    if(this.lasterror)return KeyPairInfo;
    KeyPairInfo.PriKey = this.ByteArrayToHexString(KEYPAIR.PriKey, ECC_MAXLEN);
    KeyPairInfo.PubKeyX = this.ByteArrayToHexString(KEYPAIR.PubKeyX, ECC_MAXLEN);
    KeyPairInfo.PubKeyY = this.ByteArrayToHexString(KEYPAIR.PubKeyY, ECC_MAXLEN);
    
    return KeyPairInfo;

}

Set_SM2_KeyPair(PriKey, PubKeyX, PubKeyY, SM2_UserName, KeyPath)
{

    var b_PriKey=this.HexStringToByteArray(PriKey);
    var b_PubKeyX=this.HexStringToByteArray(PubKeyX);
    var b_PubKeyY=this.HexStringToByteArray(PubKeyY);

    var b_SM2UserName  =Buffer.from(SM2_UserName);

    return this.NT_Set_SM2_KeyPair(b_PriKey, b_PubKeyX, b_PubKeyY, b_SM2UserName, KeyPath);


}

Get_SM2_PubKey(KeyPath)
{
   var PubKeyInfo={
    PubKeyX:"",
    PubKeyY:"",
    sm2UserName:"",
   }
    
    var  SM2_PubKeyInfo=this.NT_Get_SM2_PubKey( KeyPath);
   
    PubKeyInfo.PubKeyX = this.ByteArrayToHexString(SM2_PubKeyInfo.KGx, ECC_MAXLEN);
    PubKeyInfo.PubKeyY = this.ByteArrayToHexString(SM2_PubKeyInfo.KGy, ECC_MAXLEN);
    PubKeyInfo.sm2UserName= new Buffer(SM2_PubKeyInfo.sm2_UerName).toString();
    return PubKeyInfo;
  

}

SM2_EncBuf( InBuf, inlen, KeyPath)
{

    var  n, temp_inlen, incount = 0, outcount = 0;  
    var temp_InBuf = new Uint8Array(MAX_ENCLEN+ SM2_ADDBYTE)
    var OutBuf=Buffer.alloc(0);
    //InBuf.copy(OutBuf);
    while (inlen > 0)
    {
        if (inlen > MAX_ENCLEN)
            temp_inlen = MAX_ENCLEN;
        else
            temp_inlen = inlen;
        for (n = 0; n < temp_inlen; n++)
        {
            temp_InBuf[n] = InBuf[incount + n];
        }
        var temp_OutBuf = this.NT_SM2_Enc(temp_InBuf, temp_inlen, KeyPath);
        if(this.lasterror)return OutBuf;
        OutBuf = Buffer.concat([OutBuf,temp_OutBuf]);
        inlen = inlen - MAX_ENCLEN;
        incount = incount + MAX_ENCLEN;
        outcount = outcount + MAX_DECLEN;
    }

    return OutBuf;

}

SM2_DecBuf( InBuf, inlen, pin, KeyPath)
{

    var temp_inlen, n, incount = 0, outcount = 0;  
    var temp_InBuf = new Uint8Array(MAX_ENCLEN+ SM2_ADDBYTE)
    var OutBuf=Buffer.alloc(InBuf.length);
    //var b=new Buffer(InBuf)
    //b.copy(OutBuf);
    var OutBuf=Buffer.alloc(0);
    while (inlen > 0)
    {
        if (inlen > MAX_DECLEN)
            temp_inlen = MAX_DECLEN;
        else
            temp_inlen = inlen;
        for (n = 0; n < temp_inlen; n++)
        {
            temp_InBuf[n] = InBuf[incount + n];
        }
        var temp_OutBuf = this.NT_SM2_Dec(InBuf, temp_inlen, pin, KeyPath);
        if(this.lasterror)return OutBuf;
        OutBuf = Buffer.concat([OutBuf,temp_OutBuf]);
        inlen = inlen - MAX_DECLEN;
        incount = incount + MAX_DECLEN;
        outcount = outcount + MAX_ENCLEN;
    }
    return OutBuf;

}

SM2_EncString(InString,  KeyPath)
{
    var InBuf=Buffer.from(InString);
    var OutBuf=this.SM2_EncBuf(InBuf, InBuf.length, KeyPath);
    if(this.lasterror)return OutBuf;
    return  this.ByteArrayToHexString(OutBuf, OutBuf.length);

}

SM2_DecString(InString,  pin, KeyPath)
{
    var InBuf=this.HexStringToByteArray(InString);

    var OutBuf=this.SM2_DecBuf(InBuf, InBuf.length, pin, KeyPath);
      
    return OutBuf.toString();

}

YtSetPin(old_pin, new_pin, KeyPath)
{
    return  this.NT_Set_Pin(old_pin, new_pin, KeyPath);
}

Sub_YtSign(cmd, msg,  pin,  KeyPath)
{
    var OutSign;
    
    var MsgHashValue = sm3(msg);
    var Inbuf=new Buffer.from(MsgHashValue,'hex');
    var OutBuf = this.sub_NT_Sign(cmd, Inbuf,pin,KeyPath);
    if(this.lasterror!=0)return OutSign;
    OutSign = new Buffer(OutBuf).toString('hex')
    return OutSign;
}

YtSign(msg,  pin,  KeyPath)
{
    return this.Sub_YtSign(0x51,msg,pin,KeyPath)
}

YtSign_2(msg,  pin,  KeyPath)
{
    return this.Sub_YtSign(0x53,msg,pin,KeyPath)
}


}

//vid,pid
IF2K.VID = 0x3689;
IF2K.PID = 0x3689;
IF2K.PID_NEW = 0X4040;
IF2K.VID_NEW = 0X3689;
IF2K.PID_NEW_2 = 0X4040;
IF2K.VID_NEW_2 = 0X2020;

module.exports = IF2K;



   