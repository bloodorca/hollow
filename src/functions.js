import { ModeOfOperation as aes } from 'aes-js'
import * as base64 from "./base64.js"

const cSharpHeader = [0, 1, 0, 0, 0, 255, 255, 255, 255, 1, 0, 0, 0, 0, 0, 0, 0, 6, 1, 0, 0, 0]
const aesKey = StringToBytes('UKu52ePUBwetZ9wNX88o54dnfKRu0T1l')
const ecb = new aes.ecb(aesKey)

String.prototype.reverse = function(){
    return this.split("").reverse().join("")
}

export function StringToBytes(string){
    return new TextEncoder().encode(string) 
}

export function BytesToString(bytes){
    return new TextDecoder().decode(bytes)
}

// aes decrypts and removes pkcs7 padding 
export function AESDecrypt(bytes){
    let data = ecb.decrypt(bytes)
    data = data.subarray(0, -data[data.length-1]) 
    return data
}

// pkcs7 pads and encrypts 
export function AESEncrypt(bytes){
    let padValue = 16 - bytes.length % 16
    var padded = new Uint8Array(bytes.length + padValue)
    padded.fill(padValue)
    padded.set(bytes)
    return ecb.encrypt(padded)
}

// LengthPrefixedString https://msdn.microsoft.com/en-us/library/cc236844.aspx
export function GenerateLengthPrefixedString(length){
    var length = Math.min(0x7FFFFFFF, length) // maximum value
    var bytes = [] 
    for (let i=0; i<4; i++){
        if (length >> 7 != 0){
            bytes.push(length & 0x7F | 0x80)
            length >>= 7 
        } else {
            bytes.push(length & 0x7F)
            length >>= 7
            break 
        }
    } 
    if (length != 0){
        bytes.push(length)
    }

    return bytes 
}

export function AddHeader(bytes){
    var lengthData = GenerateLengthPrefixedString(bytes.length)
    var newBytes = new Uint8Array(bytes.length + cSharpHeader.length + lengthData.length + 1)
    newBytes.set(cSharpHeader) // fixed header 
    newBytes.subarray(cSharpHeader.length).set(lengthData) // variable LengthPrefixedString header 
    newBytes.subarray(cSharpHeader.length + lengthData.length).set(bytes) // our data 
    newBytes.subarray(cSharpHeader.length + lengthData.length + bytes.length).set([11]) // fixed header (11) 
    return newBytes
}

export function RemoveHeader(bytes){
    // remove fixed csharp header, plus the ending byte 11. 
    bytes = bytes.subarray(cSharpHeader.length, bytes.length - 1) 
 
    
    // remove LengthPrefixedString header 
    let lengthCount = 0 
    for (let i = 0; i < 5; i++){
        lengthCount++
        if ((bytes[i] & 0x80) == 0){ 
            break  
        }
    }
    bytes = bytes.subarray(lengthCount)

    return bytes 
}

export function Decode(bytes){
    bytes = bytes.slice() 
    bytes = RemoveHeader(bytes)
    bytes = base64.decode(bytes)
    bytes = AESDecrypt(bytes)
    return BytesToString(bytes)
}

export function Encode(jsonString){
    var bytes = StringToBytes(jsonString)
    bytes = AESEncrypt(bytes)
    bytes = base64.encode(bytes)
    // bytes = bytes.filter(v => v != 10 && v != 13)
    return AddHeader(bytes)
}

export function Hash(string){
    return string.split("").reduce((a, b) => {
        return ((a << 5) - a) + b.charCodeAt(0)   
    }, 0)
}

function round(value, precision){
    let multi = Math.pow(10, precision)
    return Math.round(value * multi) / multi
}

export function HumanTime(date){
    var minutes = (new Date() - date) / 1000 / 60
    var hours = minutes / 60  
    var days = hours / 24
    var weeks = days / 7
    var months = weeks / 4 
    var years = months / 12 

    if (minutes < 1){
        return "now"
    } else if (minutes < 120){
        return `about ${round(minutes, 0)} minutes ago`
    } else if (hours < 48){
        return `about ${round(hours, 0)} hours ago`
    } else if (days < 14){
        return `about ${round(days, 0)} days ago`
    } else if (weeks < 8){
        return `about ${round(weeks, 0)} weeks ago`
    } else if (months < 24){
        return `about ${round(months, 1)} months ago`
    } 

    return `about ${round(years, 1)} years ago`
}

export function DownloadData(data, fileName){
    var a = document.createElement("a")
    a.setAttribute("href", window.URL.createObjectURL(new Blob([data], {type: "octet/stream"})));
    a.setAttribute('download', fileName)
    a.setAttribute('style', `position: fixed; opacity: 0; left: 0; top: 0;`)
    document.body.append(a)
    a.click()
    document.body.removeChild(a)
}
