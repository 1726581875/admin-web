import JSEncrypt from 'jsencrypt/bin/jsencrypt'

// 密钥对生成 http://web.chacuo.net/netrsakeypair

const publicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCCJ2MUCgeKIDKr9qGkM3C+1eXufEuxOPO8K9hwNwnrrZYpOOGTUMY8RP85T0pBioUhd1N2jrBBdvrb1GnGGIt/r9HFPzehQLE49MG2RMrDujApw5Z8JHj2Silp7os4Qs3CgOQRahuoHR3oprggRO25uFd9KNCkea6ffsOU/cyW6wIDAQAB'

const privateKey = ''

// 用于密码加密传输加密
export function encrypt(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey) // 设置公钥
  return encryptor.encrypt(txt) // 对需要加密的数据进行加密
}

