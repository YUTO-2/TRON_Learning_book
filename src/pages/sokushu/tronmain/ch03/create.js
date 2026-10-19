// Alice（この講座で使い続ける練習用のアカウント）を作る
alice = await tronWeb.createAccount();
console.log("秘密鍵  :", alice.privateKey);
console.log("公開鍵  :", alice.publicKey);
console.log("アドレス:", alice.address.base58);
console.log("16進    :", alice.address.hex);
