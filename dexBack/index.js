const express = require("express");
const Moralis = require("moralis").default;
const app = express();
const cors = require("cors");
const {createProxyMiddleware} = require("http-proxy-middleware");
require("dotenv").config();
const port = 3001;

// const corsOptions = {
//   origin: 'http://localhost:3000', // replace with your frontend origin
//   credentials: true,
// };

// app.use(cors(corsOptions));
app.use(cors());
app.use(express.json());

app.use( "/swap",
    createProxyMiddleware({
      target: 'https://api.1inch.dev',
      changeOrigin: true,
      // pathRewrite: { '^/swap': '' },
      onProxyReq: (proxyReq) => {
        console.log("check!: ", process.env.REACT_APP_1INCH_KEY);
        // add API key in Header
        proxyReq.setHeader(
            "Authorization",
            `Bearer ${process.env.REACT_APP_1INCH_KEY}`
        );
        console.log("check8: ", process.env.REACT_APP_1INCH_KEY);
      },
    })
);

app.get("/tokenPrice", async (req, res) => {

  const {query} = req;

  const responseOne = await Moralis.EvmApi.token.getTokenPrice({
    address: query.addressOne
  })

  const responseTwo = await Moralis.EvmApi.token.getTokenPrice({
    address: query.addressTwo
  })

  const usdPrices = {
    tokenOne: responseOne.raw.usdPrice,
    tokenTwo: responseTwo.raw.usdPrice,
    ratio: responseOne.raw.usdPrice/responseTwo.raw.usdPrice
  }

  return res.status(200).json(usdPrices);
});

Moralis.start({
  apiKey: process.env.MORALIS_KEY,
}).then(() => {
  app.listen(port, () => {
    console.log(`Listening for API Calls`);
  });
});
