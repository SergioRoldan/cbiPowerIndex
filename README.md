> PowerIndex Server and Client Prototype.


> Misce:
Some discarts and other files needed for the project but not in use in the prototype.


> BackEnd:

package.json = Define modules, compile and run properties

server.js = Server code using express, socket.io and webscraping. To serve static files and retrieved information to the users, 
and to scrap the information from RG

match.js = Functions to get matches of the information retrieved of ResearchGate

getProxy.js = Functions to get proxies from gimmeproxy

modules = node modules used for the server


> Contracts:

PIF.sol = Factory smart contract to create researchers and store their data


> FrontEnd (inside public):

index.html = Main page of the web

json = Includes the abi (application binary interface) in json format used to be able to perfom actions over our contract deployed on Ropsten
testnet (we need also the contract address included in app.js)

images = Includes the images for the web app

html = Includes aboutus.html page that explains our project and display our contact data

css = Contain the style for index.html and the libraries we use

js = Includes the different libraries we use in the main client script app.js (also included in this folder) that takes care of connecting 
with the blockchain, the server and display the data to the user
