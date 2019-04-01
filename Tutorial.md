Once you run make install, you should wait for the following message : "Started DVCW API on localhost:3000" to appear on the console.

Now, we are ready to launch the Electron application.

The first time the application is launched, it will present to you your mnemonic and will prompt to you to set up a password for your wallet. 

Once you have entered your password, just press "" and a new window will be opened.

On the upper left side, you can find your ETH balance and on the right side, the balance of the wallet on DVCTokens and three different icons. 

Before operating we need to enter the "Settings" menu. On this window, you need to set up your OTP. In order to achieve this, you only need to scan the QR code with a Microsoft or Google Authenticator application. Optionally, you can set up your personal information such as email account and name.

Now, you are ready to start operating but first, you need a little bit of background information.
This vulnerable application sets up a test Ethereum node with ganache-cli , which gives you 10 accounts that you can use to make transactions. By default, the application sets up (0x627306090abab3a6e1400e9345bc60c78a8bef57) as the account that the client uses. 
Below, you can find a detailed list of the available accounts that you can send money to:

Available Accounts

| (0) 0x627306090abab3a6e1400e9345bc60c78a8bef57 (~100 ETH)
| (1) 0xf17f52151ebef6c7334fad080c5704d77216b732 (~100 ETH)
| (2) 0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef (~100 ETH)
| (3) 0x821aea9a577a9b44299b9c15c88cf3087f3b5544 (~100 ETH)
| (4) 0x0d1d4e623d10f9fba5db95830f7d3839406c6af2 (~100 ETH)
| (5) 0x2932b7a2355d6fecc4b5c0b6bd44cc31df247a2e (~100 ETH)
| (6) 0x2191ef87e392377ec08e7c08eb105ef5448eced5 (~100 ETH)
| (7) 0x0f4f2ac550a1b4e2280d04c21cea7ebd822934b5 (~100 ETH)
| (8) 0x6330a553fc93768f612722bb8c2ec78ac90b3bbc (~100 ETH)
| (9) 0x5aeda56215b167893e80b4fe645ba6d5bab767de (~100 ETH)

Once you enter one of the available accounts on the "To" field, complete the "Amount" and "Message" fields with your desired input and press "Send". This will prompt an OTP window and, once you complete the OTP confirmation and press "Submit", this will generate the transaction.

To buy and sell DVCTokens, you need to press on the "Buy & Sell Tokens" button. This will prompt a window where you can observe the Smart contracts source code and also perform the operations. The process is similar to the transactions workflow, just fill the fields and press the corresponding button, which will prompt an OTP window and after this confirmation, it will generate the transaction.

